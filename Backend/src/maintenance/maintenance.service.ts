import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { maintenanceRequests } from "../drizzle/schema";

export type TMRequestInsert = typeof maintenanceRequests.$inferInsert;

/* ================================
   GET ALL REQUESTS (With Relations)
================================ */
export const getMaintenanceRequestsService = async () => {
  return await db.query.maintenanceRequests.findMany({
    with: {
      student: {
        columns: { fullName: true, phone: true }
      },
      unit: {
        with: {
          property: {
            columns: { name: true }
          }
        },
        columns: { unitNumber: true }
      }
    },
    orderBy: (maintenanceRequests, { desc }) => [desc(maintenanceRequests.createdAt)]
  });
};

/* ================================
   GET REQUEST BY ID
================================ */
export const getMaintenanceRequestByIdService = async (requestId: number) => {
  return await db.query.maintenanceRequests.findFirst({
    where: eq(maintenanceRequests.id, requestId),
    with: {
      student: { columns: { fullName: true, phone: true, email: true } },
      unit: {
        with: { property: { columns: { name: true, location: true } } }
      }
    }
  });
};

/* ================================
   GET STUDENT REQUESTS
================================ */
export const getMyMaintenanceRequestsService = async (studentId: number) => {
  return await db.query.maintenanceRequests.findMany({
    where: eq(maintenanceRequests.studentId, studentId),
    with: {
      unit: {
        with: { property: { columns: { name: true } } }
      }
    },
    orderBy: (maintenanceRequests, { desc }) => [desc(maintenanceRequests.createdAt)]
  });
};

/* ================================
   CREATE REQUEST
================================ */
export const createMaintenanceRequestService = async (request: TMRequestInsert) => {
  const result = await db.insert(maintenanceRequests).values(request).returning();
  return result[0];
};

/* ================================
   UPDATE STATUS
================================ */
export const updateMaintenanceStatusService = async (requestId: number, status: string) => {
  const result = await db
    .update(maintenanceRequests)
    .set({ status })
    .where(eq(maintenanceRequests.id, requestId))
    .returning();

  if (!result.length) throw new Error("Maintenance request not found");
  return "Request status updated successfully";
};

/* ================================
   DELETE REQUEST
================================ */
export const deleteMaintenanceRequestService = async (requestId: number) => {
  const result = await db.delete(maintenanceRequests).where(eq(maintenanceRequests.id, requestId)).returning();
  return result.length > 0;
};