import { eq } from "drizzle-orm";
import db from "../drizzle/db";
// All tables and enums now come from one place
import { bookings, units } from "../drizzle/schema";

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
   CREATE BOOKING
================================ */
export const createBookingService = async (
  booking: TBookingInsert
): Promise<any> => {
  // Create booking
  const result = await db.insert(bookings).values(booking).returning();
  const newBookingId = result[0].id;

  // Fetch full booking with relations
  return await getBookingByIdService(newBookingId);
};

/* ================================
   UPDATE BOOKING STATUS
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

  // If approved, mark unit as unavailable
  if (status === "approved") {
    const booking = result[0];
    await db.update(units)
      .set({ isAvailable: false })
      .where(eq(units.id, booking.unitId));
  }

  return "Booking updated successfully";
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