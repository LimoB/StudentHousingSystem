import { eq, and, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings, units, properties } from "../drizzle/schema";
import { createNotificationService } from "../notifications/notification.service";

export type TBookingInsert = typeof bookings.$inferInsert;
export type TBookingSelect = typeof bookings.$inferSelect;

/* ================================
   GET ALL BOOKINGS (ADMIN)
================================ */
export const getBookingsService = async () => {
  return await db.query.bookings.findMany({
    with: {
      student: true,
      unit: { with: { property: true } },
      payments: true
    },
    orderBy: [desc(bookings.createdAt)]
  });
};

/* ================================
   GET LANDLORD BOOKINGS SERVICE
================================ */
export const getLandlordBookingsService = async (landlordId: number) => {
  if (!landlordId || isNaN(landlordId)) return [];

  const allBookings = await db.query.bookings.findMany({
    with: {
      student: true,
      payments: true,
      unit: {
        with: { property: true }
      }
    },
    orderBy: [desc(bookings.createdAt)]
  });

  return allBookings.filter(booking => {
    const property = (booking.unit as any)?.property;
    return property && Number(property.landlordId) === Number(landlordId);
  });
};

/* ================================
   GET STUDENT BOOKINGS SERVICE
================================ */
export const getStudentBookingsService = async (studentId: number) => {
  if (!studentId || isNaN(studentId)) return [];

  return await db.query.bookings.findMany({
    where: eq(bookings.studentId, studentId),
    with: {
      unit: { with: { property: true } },
      payments: true
    },
    orderBy: [desc(bookings.createdAt)]
  });
};

/* ================================
   GET BOOKING BY ID
================================ */
export const getBookingByIdService = async (bookingId: number) => {
  return await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      student: true,
      unit: { with: { property: true } },
      payments: true
    }
  }) ?? null;
};

/* ================================
   CREATE BOOKING SERVICE
================================ */
export const createBookingService = async (booking: TBookingInsert): Promise<any> => {
  // 1. Availability Check
  const unit = await db.query.units.findFirst({
    where: eq(units.id, booking.unitId),
    with: { 
      property: {
        columns: { landlordId: true, name: true } // Explicitly select for notification
      } 
    }
  });

  if (!unit || !unit.isAvailable) {
    throw new Error("This unit is no longer available for booking.");
  }

  // 2. Prevent Duplicate Pending Bookings
  const existing = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.studentId, booking.studentId),
      eq(bookings.unitId, booking.unitId),
      eq(bookings.status, "pending")
    )
  });

  if (existing) return await getBookingByIdService(existing.id);

  // 3. Create Booking
  const result = await db.insert(bookings).values(booking).returning();
  const newBooking = await getBookingByIdService(result[0].id);

  // 4. NOTIFICATIONS
  if (newBooking && unit.property) {
    const d = newBooking as any;

    // --- Notify LANDLORD: Someone wants to move in ---
    await createNotificationService({
      userId: unit.property.landlordId,
      title: "New Booking Request 🏠",
      message: `${d.student.fullName} has requested to book Unit ${unit.unitNumber} at ${unit.property.name}.`,
      type: "booking",
      // SYNCED: Matches <Route path="bookings" /> in LandlordRoutes.tsx
      link: "/landlord/bookings" 
    });

    // --- Notify STUDENT: Confirmation of request ---
    await createNotificationService({
      userId: d.studentId,
      title: "Booking Request Sent 🚀",
      message: `Your request for ${unit.property.name} (Unit ${unit.unitNumber}) is pending approval.`,
      type: "booking",
      // SYNCED: Matches <Route path="bookings/:id" /> in StudentRoutes.tsx
      link: `/student/bookings/${d.id}`
    });
  }

  return newBooking;
};

/* ================================
   UPDATE BOOKING STATUS SERVICE
=============================== */
export const updateBookingStatusService = async (
  bookingId: number,
  status: "pending" | "approved" | "rejected" | "paid" | "confirmed"
): Promise<string> => {
  const result = await db.update(bookings)
    .set({ status: status as any })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!result.length) throw new Error("Booking not found");

  // Fetch full details to get the studentId and unit info for the notification
  const fullBooking = await getBookingByIdService(bookingId);

  if (fullBooking) {
    let title = "Booking Update";
    let message = `Your booking status has been updated to ${status}.`;
    let type = "info";

    if (status === "approved") {
      title = "Booking Approved! 🎉";
      message = `Your request for ${fullBooking.unit.unitNumber} was approved. Please proceed to payment.`;
      type = "booking";
    } else if (status === "rejected") {
      title = "Booking Rejected ❌";
      message = `Sorry, your request for ${fullBooking.unit.unitNumber} was not accepted.`;
      type = "error";
    }

    // NOTIFY STUDENT
    await createNotificationService({
      userId: fullBooking.studentId,
      title,
      message,
      type,
      link: "/dashboard/my-bookings"
    });
  }

  return `Booking status updated to ${status}`;
};

/* ================================
   DELETE BOOKING SERVICE
================================ */
export const deleteBookingService = async (bookingId: number): Promise<boolean> => {
  const result = await db.delete(bookings)
    .where(eq(bookings.id, bookingId))
    .returning();

  return result.length > 0;
};