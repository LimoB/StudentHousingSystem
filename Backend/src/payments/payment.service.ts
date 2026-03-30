import axios from "axios";
import dotenv from "dotenv";
import db from "../drizzle/db";
import { eq, desc, and } from "drizzle-orm";
import { 
  payments, 
  bookings,
  leases, 
  units, 
  TPaymentInsert, 
} from "../drizzle/schema";
import { createNotificationService } from "../notifications/notification.service";

dotenv.config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY,
  MPESA_SHORTCODE,
  MPESA_CALLBACK_URL,
} = process.env;

/* ================================
   M-PESA / DARAJA CORE LOGIC
================================== */

export const getAccessToken = async (): Promise<string> => {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error("M-Pesa credentials missing in environment variables.");
  }
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return response.data.access_token;
};

export const initiateSTKPushService = async (phone: string, amount: number, bookingId: number, studentId: number) => {
  const bookingCheck = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { unit: true }
  });

  if (!bookingCheck || !bookingCheck.unit?.isAvailable) {
    throw new Error("This unit is no longer available.");
  }

  // Cleanup old pending payments for this booking to avoid checkoutID conflicts
  await db.delete(payments)
    .where(and(eq(payments.bookingId, bookingId), eq(payments.status, "pending")));

  const accessToken = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");
  
  // Robust Phone Formatting for Safaricom (2547XXXXXXXX)
  const formattedPhone = phone.replace(/\D/g, "").replace(/^0/, "254").replace(/^\+/, "");

  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `Booking-${bookingId}`,
      TransactionDesc: `Housing Payment`,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // Store the payment attempt
  await db.insert(payments).values({
    studentId,
    bookingId,
    amount: amount.toString(),
    status: "pending",
    phone: formattedPhone,
    checkoutRequestID: response.data.CheckoutRequestID,
    reference: response.data.CheckoutRequestID, 
  });

  // Notify student to check their phone
  await createNotificationService({
    userId: studentId,
    title: "Payment Prompt Sent 📲",
    message: `A request for KES ${amount} has been sent to ${formattedPhone}. Enter your M-Pesa PIN.`,
    type: "payment",
    link: "/student/payments" // Updated to match StudentRoutes
  });

  return response.data;
};

/* ================================
   INSTANT FULFILLMENT LOGIC
================================== */
export const processMpesaCallbackService = async (stkCallback: any) => {
  const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

  // 1. Handle Failed/Cancelled Payments
  if (ResultCode !== 0) {
    await db.update(payments)
      .set({ status: "failed" })
      .where(eq(payments.checkoutRequestID, CheckoutRequestID));
    return { success: false, message: "Payment cancelled or failed" };
  }

  try {
    const receipt = CallbackMetadata?.Item?.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

    return await db.transaction(async (tx) => {
      // 2. Mark Payment as Paid
      const [updatedPayment] = await tx.update(payments)
        .set({ status: "paid", mpesaReceiptNumber: receipt })
        .where(eq(payments.checkoutRequestID, CheckoutRequestID))
        .returning();

      if (!updatedPayment) throw new Error("Critical: Payment record missing for CheckoutID");

      // 3. Get Context for Fulfillment
      const bookingData = await tx.query.bookings.findFirst({
        where: eq(bookings.id, updatedPayment.bookingId),
        with: { 
          unit: { with: { property: true } }, 
          student: true 
        }
      });

      if (!bookingData) throw new Error("Fulfillment Error: Booking not found");

      // 4. Update Booking
      await tx.update(bookings)
        .set({ status: "approved" })
        .where(eq(bookings.id, bookingData.id));

      // 5. Create Lease (4 months)
      const startDate = bookingData.moveInDate ? new Date(bookingData.moveInDate) : new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 4); 

      const [newLease] = await tx.insert(leases).values({
        studentId: bookingData.studentId,
        unitId: bookingData.unitId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: "active",
      }).returning();

      // 6. Occupy Unit
      await tx.update(units)
        .set({ isAvailable: false })
        .where(eq(units.id, bookingData.unitId));

      // 7. MULTI-USER NOTIFICATIONS
      
      // Notify Student
      await createNotificationService({
        userId: bookingData.studentId,
        title: "Stay Confirmed! 🏠",
        message: `Payment KES ${updatedPayment.amount} confirmed. Your lease for ${bookingData.unit.property.name} is now active.`,
        type: "payment",
        link: `/student/leases/${newLease.id}`
      });

      // Notify Landlord
      if (bookingData.unit.property?.landlordId) {
        await createNotificationService({
          userId: bookingData.unit.property.landlordId,
          title: "New Payment & Lease 💰",
          message: `${bookingData.student.fullName} paid for Unit ${bookingData.unit.unitNumber}. Space is now occupied.`,
          type: "payment",
          link: "/landlord/leases"
        });
      }

      return { success: true, message: "Fulfillment complete", leaseId: newLease.id };
    });
  } catch (error) {
    console.error("M-Pesa Callback Critical Error:", error);
    return { success: false, message: "System error during fulfillment" };
  }
};

/* ================================
   QUERIES
================================== */

export const getAllPaymentsService = async (studentId?: number, landlordId?: number) => {
  const allPayments = await db.query.payments.findMany({
    where: studentId ? eq(payments.studentId, studentId) : undefined,
    with: {
      student: { columns: { fullName: true, email: true } },
      booking: { 
        with: { 
          unit: { with: { property: { columns: { name: true, landlordId: true } } } } 
        } 
      }
    },
    orderBy: [desc(payments.createdAt)]
  });

  // Server-side filtering for Landlords
  if (landlordId) {
    return allPayments.filter(pay => pay.booking?.unit?.property?.landlordId === landlordId);
  }
  return allPayments;
};

export const getPaymentByIdService = async (id: number) => {
  return await db.query.payments.findFirst({
    where: eq(payments.id, id),
    with: { student: true, booking: true }
  });
};

export const getPaymentStatusService = async (checkoutRequestID: string) => {
  return await db.query.payments.findFirst({
    where: eq(payments.checkoutRequestID, checkoutRequestID),
    columns: { status: true, mpesaReceiptNumber: true }
  });
};

export const deletePaymentService = async (id: number): Promise<number> => {
  const result = await db.delete(payments).where(eq(payments.id, id)).returning();
  return result.length;
};