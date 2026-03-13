import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { leases } from "../drizzle/schema";

export type TLeaseInsert = typeof leases.$inferInsert;
export type TLeaseSelect = typeof leases.$inferSelect;

/* ================================
   GET ALL LEASES
================================ */

export const getLeasesService = async (): Promise<TLeaseSelect[]> => {
  return await db.query.leases.findMany();
};

/* ================================
   GET LEASE BY ID
================================ */

export const getLeaseByIdService = async (
  leaseId: number
): Promise<TLeaseSelect | null> => {
  const lease = await db.query.leases.findFirst({
    where: eq(leases.id, leaseId),
  });

  return lease ?? null;
};

/* ================================
   GET STUDENT LEASES
================================ */

export const getStudentLeasesService = async (
  studentId: number
): Promise<TLeaseSelect[]> => {
  return await db.query.leases.findMany({
    where: eq(leases.studentId, studentId),
  });
};

/* ================================
   CREATE LEASE
================================ */

export const createLeaseService = async (
  lease: TLeaseInsert
): Promise<TLeaseSelect> => {
  const result = await db
    .insert(leases)
    .values(lease)
    .returning();

  return result[0];
};

/* ================================
   END LEASE
================================ */

export const endLeaseService = async (
  leaseId: number
): Promise<string> => {
  const result = await db
    .update(leases)
    .set({ status: "ended" })
    .where(eq(leases.id, leaseId))
    .returning();

  if (!result.length) {
    throw new Error("Lease not found");
  }

  return "Lease ended successfully";
};

/* ================================
   DELETE LEASE
================================ */

export const deleteLeaseService = async (
  leaseId: number
): Promise<boolean> => {
  const result = await db
    .delete(leases)
    .where(eq(leases.id, leaseId))
    .returning();

  return result.length > 0;
};