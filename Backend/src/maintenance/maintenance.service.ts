import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { maintenanceRequests } from "../drizzle/schema";

export type TMRequestInsert = typeof maintenanceRequests.$inferInsert;
export type TMRequestSelect = typeof maintenanceRequests.$inferSelect;

/* ================================
   GET ALL MAINTENANCE REQUESTS
================================ */
export const getMaintenanceRequestsService = async (): Promise<TMRequestSelect[]> => {
  return await db.query.maintenanceRequests.findMany();
};

/* ================================
   GET REQUEST BY ID
================================ */
export const getMaintenanceRequestByIdService = async (
  requestId: number
): Promise<TMRequestSelect | null> => {
  return (await db.query.maintenanceRequests.findFirst({
    where: eq(maintenanceRequests.id, requestId),
  })) ?? null;
};

/* ================================
   GET STUDENT REQUESTS
================================ */
export const getMyMaintenanceRequestsService = async (
  studentId: number
): Promise<TMRequestSelect[]> => {
  return await db.query.maintenanceRequests.findMany({
    where: eq(maintenanceRequests.studentId, studentId),
  });
};

/* ================================
   CREATE REQUEST
================================ */
export const createMaintenanceRequestService = async (
  request: TMRequestInsert
): Promise<TMRequestSelect> => {
  const result = await db.insert(maintenanceRequests).values(request).returning();
  return result[0];
};

/* ================================
   UPDATE REQUEST STATUS
================================ */
export const updateMaintenanceStatusService = async (
  requestId: number,
  status: string
): Promise<string> => {
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
export const deleteMaintenanceRequestService = async (
  requestId: number
): Promise<boolean> => {
  const result = await db
    .delete(maintenanceRequests)
    .where(eq(maintenanceRequests.id, requestId))
    .returning();

  return result.length > 0;
};