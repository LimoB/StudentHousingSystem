import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { leases, units } from "../drizzle/schema";

export type TLeaseInsert = typeof leases.$inferInsert;

/* ================================
   GET ALL LEASES (With Relations)
================================ */
export const getLeasesService = async () => {
  return await db.query.leases.findMany({
    with: {
      student: { columns: { fullName: true, email: true, phone: true } },
      unit: {
        with: { property: { columns: { name: true, location: true } } }
      }
    }
  });
};

/* ================================
   GET STUDENT LEASES
================================ */
export const getStudentLeasesService = async (studentId: number) => {
  return await db.query.leases.findMany({
    where: eq(leases.studentId, studentId),
    with: {
      unit: {
        with: { property: { columns: { name: true, location: true } } }
      }
    }
  });
};

/* ================================
   END LEASE (Updated with Unit Release)
================================ */
export const endLeaseService = async (leaseId: number) => {
  return await db.transaction(async (tx) => {
    // 1. Update lease status
    const [updatedLease] = await tx
      .update(leases)
      .set({ status: "ended" })
      .where(eq(leases.id, leaseId))
      .returning();

    if (!updatedLease) throw new Error("Lease not found");

    // 2. IMPORTANT: Make the unit available for booking again!
    await tx
      .update(units)
      .set({ isAvailable: true })
      .where(eq(units.id, updatedLease.unitId));

    return "Lease ended and unit is now available";
  });
};

// ... keep your getLeaseById and deleteLease as they were

/* ================================
   GET LEASE BY ID (With Relations)
================================ */
export const getLeaseByIdService = async (leaseId: number) => {
  return await db.query.leases.findFirst({
    where: eq(leases.id, leaseId),
    with: {
      student: { columns: { fullName: true, email: true } },
      unit: {
        with: { property: { columns: { name: true } } }
      }
    }
  });
};

/* ================================
   GET STUDENT LEASES
================================ */
// export const getStudentLeasesService = async (studentId: number) => {
//   return await db.query.leases.findMany({
//     where: eq(leases.studentId, studentId),
//     with: {
//       unit: {
//         with: { property: { columns: { name: true, location: true } } }
//       }
//     }
//   });
// };

/* ================================
   CREATE LEASE
================================ */
export const createLeaseService = async (lease: TLeaseInsert) => {
  const result = await db.insert(leases).values(lease).returning();
  return result[0];
};

/* ================================
   END LEASE
================================ */
// export const endLeaseService = async (leaseId: number) => {
//   const result = await db
//     .update(leases)
//     .set({ status: "ended" })
//     .where(eq(leases.id, leaseId))
//     .returning();

//   if (!result.length) throw new Error("Lease not found");
//   return "Lease ended successfully";
// };

/* ================================
   DELETE LEASE
================================ */
export const deleteLeaseService = async (leaseId: number) => {
  const result = await db.delete(leases).where(eq(leases.id, leaseId)).returning();
  return result.length > 0;
};