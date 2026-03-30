import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { bookings, units } from "../drizzle/schema";

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
  });
};

/* ================================
   GET LANDLORD BOOKINGS SERVICE
   Filters bookings where the unit belongs to a property owned by the landlord.
================================ */
export const getLandlordBookingsService = async (landlordId: number) => {
  // If landlordId is NaN or undefined, returning an empty array avoids a 400 DB error
  if (!landlordId || isNaN(landlordId)) return [];

  const allBookings = await db.query.bookings.findMany({
    with: {
      student: true,
      payments: true,
      unit: {
        with: {
          property: true
        }
      }
    },
  });

  // Added extra safety checks to ensure we don't call .landlordId on a null property
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
    }
  });
};

/* ================================
   GET BOOKING BY ID
================================ */
export const getBookingByIdService = async (bookingId: number) => {
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
   CREATE BOOKING SERVICE
================================ */
export const createBookingService = async (booking: TBookingInsert): Promise<any> => {
  // 1. Availability Check
  const unit = await db.query.units.findFirst({
    where: eq(units.id, booking.unitId),
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

  // 3. Create
  const result = await db.insert(bookings).values(booking).returning();
  return await getBookingByIdService(result[0].id);
};

/* ================================
   UPDATE BOOKING STATUS SERVICE
================================ */
export const updateBookingStatusService = async (
  bookingId: number,
  status: "pending" | "approved" | "rejected" | "paid" | "confirmed"
): Promise<string> => {
  const result = await db.update(bookings)
    .set({ status: status as any })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!result.length) throw new Error("Booking not found");

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