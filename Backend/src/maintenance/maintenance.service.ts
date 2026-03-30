import { eq, desc, and } from "drizzle-orm";
import db from "../drizzle/db";
import { 
  maintenanceRequests, 
  units, 
  properties, 
  users 
} from "../drizzle/schema";
import { PgTable } from "drizzle-orm/pg-core";
import { createNotificationService } from "../notifications/notification.service";

// 1. Keep your working casts to break the "protected" conflict
const m = maintenanceRequests as any;
const u = units as unknown as PgTable<any>;
const p = properties as unknown as PgTable<any>;
const s = users as any;

export type TMRequestInsert = typeof maintenanceRequests.$inferInsert;

/* ================================
   GET LANDLORD REQUESTS (Relational API)
================================ */
export const getLandlordMaintenanceRequestsService = async (landlordId: number) => {
  const results = await db.query.maintenanceRequests.findMany({
    where: (maintenance, { exists }) => 
      exists(
        db.select()
          .from(u)
          .innerJoin(p, eq((u as any).propertyId, (p as any).id))
          .where(
            and(
              eq((u as any).id, maintenance.unitId),
              eq((p as any).landlordId, landlordId)
            )
          )
      ),
    with: {
      student: { columns: { fullName: true, phone: true } },
      unit: {
        columns: { unitNumber: true },
        with: { property: { columns: { name: true } } }
      }
    },
    orderBy: [desc(maintenanceRequests.createdAt)]
  });

  return results;
};

/* ================================
   GET ALL REQUESTS (Admin View)
================================ */
export const getMaintenanceRequestsService = async () => {
  return await db.query.maintenanceRequests.findMany({
    with: {
      student: { columns: { fullName: true, phone: true } },
      unit: {
        with: { property: { columns: { name: true } } },
        columns: { unitNumber: true }
      }
    },
    orderBy: [desc(maintenanceRequests.createdAt)]
  });
};

/* ================================
   GET REQUEST BY ID
================================ */
export const getMaintenanceRequestByIdService = async (requestId: number) => {
  return await db.query.maintenanceRequests.findFirst({
    where: eq(maintenanceRequests.id, requestId),
    with: {
      student: { columns: { id: true, fullName: true, phone: true, email: true } },
      unit: {
        with: { 
          property: { 
            columns: { id: true, landlordId: true, name: true, location: true } 
          } 
        }
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
    orderBy: [desc(maintenanceRequests.createdAt)]
  });
};

/* ================================
   CREATE REQUEST (Linked with Notification)
================================ */
export const createMaintenanceRequestService = async (request: TMRequestInsert) => {
  const result = await db.insert(maintenanceRequests).values(request).returning();
  const newRequest = result[0];

  // Fetch details to notify the landlord
  const details = await getMaintenanceRequestByIdService(newRequest.id);

if (details && details.unit?.property) {
  await createNotificationService({
    userId: details.unit.property.landlordId,
    title: "New Maintenance Issue 🔧",
    // Providing context in the message helps the landlord prioritize
    message: `${details.student.fullName} reported: "${details.description.substring(0, 40)}..."`,
    type: "maintenance",
    // SYNCED WITH FRONTEND: Points to the Landlord's maintenance route
    link: "/landlord/maintenance" 
  });
}

  return newRequest;
};

/* ================================
   UPDATE STATUS (Linked with Notification)
================================ */
export const updateMaintenanceStatusService = async (requestId: number, status: string) => {
  const result = await db
    .update(maintenanceRequests)
    .set({ status })
    .where(eq(maintenanceRequests.id, requestId))
    .returning();

  if (!result.length) throw new Error("Maintenance request not found");

  // Fetch details to notify the student
  const details = await getMaintenanceRequestByIdService(requestId);
  
  if (details) {
    await createNotificationService({
      userId: details.studentId,
      title: "Work Order Update 🛠️",
      message: `Status updated to ${status.toUpperCase()} for ${details.unit.property.name}.`,
      type: "maintenance",
      link: "/dashboard/my-maintenance"
    });
  }

  return "Request status updated successfully";
};

/* ================================
   DELETE REQUEST
================================ */
export const deleteMaintenanceRequestService = async (requestId: number) => {
  const result = await db.delete(maintenanceRequests).where(eq(maintenanceRequests.id, requestId)).returning();
  return result.length > 0;
};