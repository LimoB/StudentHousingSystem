import { and, SQL, desc, eq } from "drizzle-orm";
import db from "../drizzle/db";
import { properties, users } from "../drizzle/schema";
import { createNotificationService } from "../notifications/notification.service";

export type TPropertyInsert = typeof properties.$inferInsert;

/* ============================================================
   GET ALL PROPERTIES (Filtered by Role/Status)
============================================================ */
export const getPropertiesService = async (
  filter?: { 
    // Fix: Type the status to match your PgEnum exactly
    status?: "available" | "occupied"; 
    landlordId?: number 
  }
) => {
  const conditions: SQL[] = [];
  
  if (filter?.status) {
    // Now this matches the "PgEnumColumn" requirements perfectly
    conditions.push(eq(properties.status, filter.status));
  }
  
  if (filter?.landlordId) {
    conditions.push(eq(properties.landlordId, filter.landlordId));
  }

  const condition = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.query.properties.findMany({
    where: condition,
    with: {
      landlord: {
        columns: { id: true, fullName: true, phone: true, email: true }
      },
      units: true 
    },
    orderBy: [desc(properties.createdAt)]
  });
};


/* ============================================================
   GET PROPERTY BY ID (Deep Relations)
============================================================ */
export const getPropertyByIdService = async (
  propertyId: number,
  filter?: { landlordId?: number }
) => {
  const conditions: SQL[] = [eq(properties.id, propertyId)];

  if (filter?.landlordId) {
    conditions.push(eq(properties.landlordId, filter.landlordId));
  }

  return await db.query.properties.findFirst({
    where: and(...conditions),
    with: {
      landlord: {
        columns: { id: true, fullName: true, phone: true, email: true }
      },
      units: true 
    }
  });
};

/* ============================================================
   CREATE PROPERTY (Global Linked Notification)
============================================================ */
export const createPropertyService = async (property: TPropertyInsert) => {
  const result = await db.insert(properties).values(property).returning();
  const newProperty = result[0];

  if (newProperty) {
    // 1. NOTIFY LANDLORD (The Owner)
    if (newProperty.landlordId) {
      await createNotificationService({
        userId: newProperty.landlordId,
        title: "Property Listed! 🏠",
        message: `Your property "${newProperty.name}" is now live. Start adding units to receive bookings!`,
        type: "info",
        // SYNCED: Landlord Property Detail Route
        link: `/landlord/properties/${newProperty.id}`
      });
    }

    // 2. NOTIFY ALL ADMINS (The Moderators)
    const admins = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));

    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => 
        createNotificationService({
          userId: admin.id,
          title: "New Property Alert 🛡️",
          message: `A new property "${newProperty.name}" has been added and requires oversight.`,
          type: "system",
          // SYNCED: Admin Property Detail Route
          link: `/admin/properties/${newProperty.id}`
        })
      );
      
      await Promise.all(adminNotifications);
    }
  }

  return newProperty;
};

/* ============================================================
   UPDATE PROPERTY (Status Change Notifications)
============================================================ */
export const updatePropertyService = async (
  propertyId: number,
  updates: Partial<TPropertyInsert>
) => {
  const result = await db
    .update(properties)
    .set(updates)
    .where(eq(properties.id, propertyId))
    .returning();

  if (!result.length) throw new Error("Property not found");
  const updatedProperty = result[0];

  // If the status or details changed, notify the landlord
  await createNotificationService({
    userId: updatedProperty.landlordId,
    title: "Property Updated",
    message: `Details for "${updatedProperty.name}" have been modified successfully.`,
    type: "info",
    // SYNCED: Landlord Properties List
    link: `/landlord/properties`
  });

  return updatedProperty;
};

/* ============================================================
   DELETE PROPERTY
============================================================ */
export const deletePropertyService = async (propertyId: number) => {
  const result = await db.delete(properties)
    .where(eq(properties.id, propertyId))
    .returning();
    
  return result.length > 0;
};