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
  TPaymentSelect 
} from "../drizzle/schema";

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
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return response.data.access_token;
};
export const initiateSTKPushService = async (phone: string, amount: number, bookingId: number, studentId: number) => {
  // 1. PRE-CHECK: Ensure unit is still available before requesting money
  const bookingCheck = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { unit: true }
  });

  if (!bookingCheck || !bookingCheck.unit?.isAvailable) {
    throw new Error("This unit is no longer available.");
  }

  // 2. CLEANUP: Remove any existing 'pending' payments for this specific booking
  // This prevents multiple 'pending' rows (zombies) if the user clicks pay multiple times.
  // Make sure to import 'and' from "drizzle-orm" at the top of your file.
  await db.delete(payments)
    .where(
      and(
        eq(payments.bookingId, bookingId),
        eq(payments.status, "pending")
      )
    );

  const accessToken = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");
  const formattedPhone = phone.startsWith("254") ? phone : phone.replace(/^0/, "254");

  const payload = {
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
  };

  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // 3. INSERT: Store the fresh pending payment session
  await db.insert(payments).values({
    studentId,
    bookingId,
    amount: amount.toString(),
    status: "pending",
    phone: formattedPhone,
    checkoutRequestID: response.data.CheckoutRequestID,
    reference: response.data.CheckoutRequestID, 
  });

  return response.data;
};


/**
 * UPDATED: Instant Fulfillment Logic
 * Processes M-Pesa callback and automatically creates a Lease.
 */
export const processMpesaCallbackService = async (stkCallback: any) => {
  const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

  // 1. If payment failed
  if (ResultCode !== 0) {
    await db.update(payments)
      .set({ status: "failed" })
      .where(eq(payments.checkoutRequestID, CheckoutRequestID));
    return { success: false, message: "Payment failed or cancelled" };
  }

  // 2. If payment succeeded, run a transaction to finalize everything
  try {
    const receipt = CallbackMetadata.Item.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

    return await db.transaction(async (tx) => {
      // A. Update Payment Record
      const [updatedPayment] = await tx.update(payments)
        .set({ status: "paid", mpesaReceiptNumber: receipt })
        .where(eq(payments.checkoutRequestID, CheckoutRequestID))
        .returning();

      if (!updatedPayment) throw new Error("Payment record not found");

      // B. Fetch Booking details for student and unit info
      const bookingData = await tx.query.bookings.findFirst({
        where: eq(bookings.id, updatedPayment.bookingId),
      });

      if (!bookingData) throw new Error("Booking record not found");

      // C. Update Booking Status to Approved
      await tx.update(bookings)
        .set({ status: "approved" })
        .where(eq(bookings.id, bookingData.id));

      // D. Create the Lease Record automatically
      // Assuming a semester length of 4 months
      const startDate = bookingData.moveInDate ? new Date(bookingData.moveInDate) : new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 4); 

      await tx.insert(leases).values({
        studentId: bookingData.studentId,
        unitId: bookingData.unitId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: "active",
      });

      // E. Mark the Unit as Occupied/Unavailable
      await tx.update(units)
        .set({ isAvailable: false })
        .where(eq(units.id, bookingData.unitId));

      return { success: true, message: "Payment confirmed and Lease activated instantly" };
    });
  } catch (error) {
    console.error("Fulfillment Transaction Error:", error);
    return { success: false, message: "Error processing instant lease" };
  }
};

/**
 * NEW: Get payment status for Frontend Polling
 */
export const getPaymentStatusService = async (checkoutRequestID: string) => {
  return await db.query.payments.findFirst({
    where: eq(payments.checkoutRequestID, checkoutRequestID),
    columns: { status: true, mpesaReceiptNumber: true }
  });
};

/* ================================
   STANDARD CRUD SERVICES
================================== */

// export const getAllPaymentsService = async () => {
//   return await db.query.payments.findMany({
//     with: {
//       student: { columns: { fullName: true, email: true } },
//       booking: true
//     },
//     orderBy: [desc(payments.createdAt)]
//   });
// };

/**
 * UPDATED: Fetch payments with optional student filtering
 */
export const getAllPaymentsService = async (studentId?: number) => {
  return await db.query.payments.findMany({
    // Add this filter logic
    where: studentId ? eq(payments.studentId, studentId) : undefined,
    with: {
      student: { columns: { fullName: true, email: true } },
      booking: true
    },
    orderBy: [desc(payments.createdAt)]
  });
};

export const getPaymentByIdService = async (id: number) => {
  return await db.query.payments.findFirst({
    where: eq(payments.id, id),
    with: { student: true, booking: true }
  });
};

export const updatePaymentService = async (id: number, data: Partial<TPaymentInsert>): Promise<number> => {
  const result = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
  return result.length;
};

export const deletePaymentService = async (id: number): Promise<number> => {
  const result = await db.delete(payments).where(eq(payments.id, id)).returning();
  return result.length;
};

export function getPaymentStatusByCheckoutID(checkoutID: string) {
    return db.query.payments.findFirst({
        where: eq(payments.checkoutRequestID, checkoutID)
    });
}