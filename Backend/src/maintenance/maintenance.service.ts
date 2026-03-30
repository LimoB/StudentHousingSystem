import { eq, desc, and } from "drizzle-orm";
import db from "../drizzle/db";
import { 
  maintenanceRequests, 
  units, 
  properties, 
  users 
} from "../drizzle/schema";

// Type helpers for environments with strict/broken inference
const m = maintenanceRequests as any;
const u = units as any;
const p = properties as any;
const s = users as any;

export type TMRequestInsert = typeof maintenanceRequests.$inferInsert;

/* ================================
   GET LANDLORD REQUESTS (Join-Based)
   Filters maintenance by units owned by the landlord
================================ */
export const getLandlordMaintenanceRequestsService = async (landlordId: number) => {
  const result = await db
    .select({
      id: m.id,
      description: m.description,
      status: m.status,
      priority: m.priority,
      createdAt: m.createdAt,
      studentName: s.fullName,
      studentPhone: s.phone,
      unitNumber: u.unitNumber,
      propertyName: p.name,
    })
    .from(m)
    .innerJoin(u, eq(m.unitId, u.id))
    .innerJoin(p, eq(u.propertyId, p.id))
    .innerJoin(s, eq(m.studentId, s.id))
    .where(eq(p.landlordId, landlordId))
    .orderBy(desc(m.createdAt));

  // Format to match the frontend expected nested structure
  return result.map((row) => ({
    id: row.id,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.createdAt,
    student: {
      fullName: row.studentName,
      phone: row.studentPhone,
    },
    unit: {
      unitNumber: row.unitNumber,
      property: {
        name: row.propertyName,
      },
    },
  }));
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