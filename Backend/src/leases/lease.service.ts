import { eq, and, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { 
  leases, 
  units, 
  properties, 
  users, 
  TLeaseInsert 
} from "../drizzle/schema";
import { createNotificationService } from "../notifications/notification.service";

// Helper for type-broken environments
const l = leases as any;
const u = units as any;
const p = properties as any;
const s = users as any;

/* ================================
   GET LANDLORD LEASES
================================ */
export const getLandlordLeasesService = async (landlordId: number) => {
  const result = await db
    .select({
      id: l.id,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      createdAt: l.createdAt,
      studentName: s.fullName,
      studentEmail: s.email,
      studentPhone: s.phone,
      unitNumber: u.unitNumber,
      propertyName: p.name,
      location: p.location,
    })
    .from(l)
    .innerJoin(s, eq(l.studentId, s.id))
    .innerJoin(u, eq(l.unitId, u.id))
    .innerJoin(p, eq(u.propertyId, p.id))
    .where(eq(p.landlordId, landlordId))
    .orderBy(desc(l.createdAt));

  return result.map((row) => ({
    id: row.id,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    student: {
      fullName: row.studentName,
      email: row.studentEmail,
      phone: row.studentPhone,
    },
    unit: {
      unitNumber: row.unitNumber,
      property: {
        name: row.propertyName,
        location: row.location,
      },
    },
  }));
};

/* ================================
   GET ALL LEASES (Admin View)
================================ */
export const getLeasesService = async () => {
  return await db.query.leases.findMany({
    with: {
      student: { columns: { fullName: true, email: true, phone: true } },
      unit: {
        with: { property: { columns: { name: true, location: true } } }
      }
    },
    orderBy: [desc(leases.createdAt)]
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
    },
    orderBy: [desc(leases.createdAt)]
  });
};

/* ================================
   GET LEASE BY ID
================================ */
export const getLeaseByIdService = async (leaseId: number) => {
  return await db.query.leases.findFirst({
    where: eq(leases.id, leaseId),
    with: {
      student: { columns: { id: true, fullName: true, email: true } },
      unit: {
        columns: { unitNumber: true }, // Added unitNumber
        with: { 
          property: { 
            columns: { name: true, landlordId: true } // Added landlordId here!
          } 
        }
      }
    }
  });
};

/* ================================
   CREATE LEASE
================================ */
export const createLeaseService = async (lease: TLeaseInsert) => {
  const result = await db.insert(leases).values(lease).returning();
  const newLease = result[0];

  // Fetch full details (now including landlordId)
  const details = await getLeaseByIdService(newLease.id);

  if (details && (details as any).unit?.property) {
    const d = details as any;
    
    // 1. Notify Student
    await createNotificationService({
      userId: d.studentId,
      title: "Lease Agreement Ready 📝",
      message: `Your lease for ${d.unit.property.name}, Unit ${d.unit.unitNumber} is now active.`,
      type: "info",
      link: `/student/leases/${newLease.id}` 
    });

    // 2. Notify Landlord
    await createNotificationService({
      userId: d.unit.property.landlordId, // This now exists!
      title: "New Lease Registered 🏠",
      message: `A new lease has been generated for ${d.unit.property.name} (Unit ${d.unit.unitNumber}).`,
      type: "info",
      link: `/landlord/leases`
    });
  }

  return newLease;
};

/* ================================
   END LEASE
================================ */
export const endLeaseService = async (leaseId: number) => {
  return await db.transaction(async (tx) => {
    const [updatedLease] = await (tx as any)
      .update(leases)
      .set({ status: "ended" })
      .where(eq(leases.id, leaseId))
      .returning();

    if (!updatedLease) throw new Error("Lease not found");

    await (tx as any)
      .update(units)
      .set({ isAvailable: true })
      .where(eq(units.id, updatedLease.unitId));

    // Notify Student using correct student route
    await createNotificationService({
      userId: updatedLease.studentId,
      title: "Lease Ended 🏁",
      message: `Your lease has officially ended. Thank you for staying with us!`,
      type: "info",
      link: "/student/leases"
    });

    return "Lease ended and unit is now available";
  });
};

/* ================================
   DELETE LEASE
================================ */
export const deleteLeaseService = async (leaseId: number) => {
  const result = await db.delete(leases).where(eq(leases.id, leaseId)).returning();
  return result.length > 0;
};