import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings } from "../drizzle/schema";

export type TBookingInsert = typeof bookings.$inferInsert;
export type TBookingSelect = typeof bookings.$inferSelect;

/* ================================
   GET ALL BOOKINGS
================================ */

export const getBookingsService = async (): Promise<TBookingSelect[]> => {
  return await db.query.bookings.findMany();
};

/* ================================
   GET BOOKING BY ID
================================ */

export const getBookingByIdService = async (
  bookingId: number
): Promise<TBookingSelect | null> => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  return booking ?? null;
};

/* ================================
   GET BOOKINGS BY STUDENT
================================ */

export const getStudentBookingsService = async (
  studentId: number
): Promise<TBookingSelect[]> => {
  return await db.query.bookings.findMany({
    where: eq(bookings.studentId, studentId),
  });
};

/* ================================
   CREATE BOOKING
================================ */

export const createBookingService = async (
  booking: TBookingInsert
): Promise<TBookingSelect> => {
  const result = await db
    .insert(bookings)
    .values(booking)
    .returning();

  return result[0];
};

/* ================================
   UPDATE BOOKING STATUS
================================ */

export const updateBookingStatusService = async (
  bookingId: number,
  status: "pending" | "approved" | "rejected"
): Promise<string> => {
  const result = await db
    .update(bookings)
    .set({ status })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!result.length) {
    throw new Error("Booking not found");
  }

  return "Booking updated successfully";
};

/* ================================
   DELETE BOOKING
================================ */

export const deleteBookingService = async (
  bookingId: number
): Promise<boolean> => {
  const result = await db
    .delete(bookings)
    .where(eq(bookings.id, bookingId))
    .returning();

  return result.length > 0;
};