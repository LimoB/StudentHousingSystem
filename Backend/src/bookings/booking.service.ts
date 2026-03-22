import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings, units } from "../drizzle/schema";

// export type TBookingInsert = typeof bookings.$inferInsert;

export type TBookingInsert = typeof bookings.$inferInsert;
export type TBookingSelect = typeof bookings.$inferSelect;

/* ================================
   GET ALL BOOKINGS WITH RELATIONS
================================ */
export const getBookingsService = async () => {
  return await db.query.bookings.findMany({
    with: {
      student: true,      // user info
      unit: {             // unit info
        with: {
          property: true  // property info
        }
      },
      payments: true      // payment info
    },
  });
};

/* ================================
   GET BOOKING BY ID
================================ */
export const getBookingByIdService = async (
  bookingId: number
) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      student: true,
      unit: { with: { property: true } },
      payments: true
    }
  });

  return booking ?? null;
};

/* ================================
   GET BOOKINGS BY STUDENT
================================ */
export const getStudentBookingsService = async (
  studentId: number
) => {
  return await db.query.bookings.findMany({
    where: eq(bookings.studentId, studentId),
    with: {
      unit: { with: { property: true } },
      payments: true
    }
  });
};

/* ================================
   CREATE BOOKING (Updated with Availability Check)
================================ */
export const createBookingService = async (booking: TBookingInsert): Promise<any> => {
  // 1. Check if the unit is actually available
  const unit = await db.query.units.findFirst({
    where: eq(units.id, booking.unitId),
  });

  if (!unit || !unit.isAvailable) {
    throw new Error("This unit is no longer available for booking.");
  }

  // 2. Check if this specific student already has a PENDING booking for this unit
  // This prevents spamming the payment records
  const existing = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.studentId, booking.studentId),
      eq(bookings.unitId, booking.unitId),
      eq(bookings.status, "pending")
    )
  });

  if (existing) return await getBookingByIdService(existing.id);

  // 3. Create booking
  const result = await db.insert(bookings).values(booking).returning();
  return await getBookingByIdService(result[0].id);
};


/* ================================
   UPDATE BOOKING STATUS
   (Simplified: In Option 1, 'approved' happens via Payment Service)
================================ */
export const updateBookingStatusService = async (
  bookingId: number,
  status: "pending" | "approved" | "rejected"
): Promise<string> => {
  const result = await db.update(bookings)
    .set({ status })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!result.length) throw new Error("Booking not found");

  // NOTE: In Option 1, we don't handle 'approved' here 
  // because the Lease creation and Unit lock happen in PaymentService.
  // This function is now mainly for 'rejected' or 'pending' overrides.

  return `Booking status updated to ${status}`;
};

/* ================================
   DELETE BOOKING
================================ */
export const deleteBookingService = async (
  bookingId: number
): Promise<boolean> => {
  const result = await db.delete(bookings)
    .where(eq(bookings.id, bookingId))
    .returning();

  return result.length > 0;
};