import { eq, desc, and, SQL } from "drizzle-orm";
import db from "../drizzle/db";
import { 
  maintenanceRequests, 
  units, 
  properties, 
  users 
} from "../drizzle/schema";
import { PgTable } from "drizzle-orm/pg-core";

// 1. Cast tables to unknown first, then to PgTable to break the "protected" conflict
const m = maintenanceRequests as any;
const u = units as unknown as PgTable<any>;
const p = properties as unknown as PgTable<any>;
const s = users as any;

export type TMRequestInsert = typeof maintenanceRequests.$inferInsert;

/* ================================
   GET LANDLORD REQUESTS (Relational API)
   Filters maintenance by units owned by the landlord
================================ */
export const getLandlordMaintenanceRequestsService = async (landlordId: number) => {
  // Use the relational API to avoid manual join column mapping issues
  const results = await db.query.maintenanceRequests.findMany({
    where: (maintenance, { exists }) => 
      // We use the casted variables (u, p) here to avoid the TS error
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
      student: { 
        columns: { 
          fullName: true, 
          phone: true 
        } 
      },
      unit: {
        columns: { 
          unitNumber: true 
        },
        with: {
          property: { 
            columns: { 
              name: true 
            } 
          }
        }
      }
    },
    // We use the original maintenanceRequests object here for the sort
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
        with: {
          property: { columns: { name: true } }
        },
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
    orderBy: [desc(maintenanceRequests.createdAt)]
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