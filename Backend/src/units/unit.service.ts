import { eq, and, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { units, properties } from "../drizzle/schema";
import { createNotificationService } from "../notifications/notification.service";

export type TUnitInsert = typeof units.$inferInsert;

/* ================================
   GET UNITS (Admin = All, Landlord = Filtered)
================================ */
export const getUnitsService = async (landlordId?: number) => {
  if (!landlordId) {
    return await db.query.units.findMany({
      with: {
        property: {
          columns: { name: true, location: true, landlordId: true }
        }
      },
      orderBy: [desc(units.createdAt)]
    });
  }

  return await db.query.units.findMany({
    where: (u, { exists }) => exists(
      db.select()
        .from(properties)
        .where(
          and(
            eq(properties.id, u.propertyId),
            eq(properties.landlordId, landlordId)
          )
        )
    ),
    with: {
      property: {
        columns: { name: true, location: true, landlordId: true }
      }
    },
    orderBy: [desc(units.createdAt)]
  });
};

/* ================================
   GET UNIT BY ID (Secure)
=============================== */
export const getUnitByIdService = async (unitId: number, landlordId?: number) => {
  const result = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      property: true
    }
  });

  if (!result) return null;
  if (landlordId && result.property.landlordId !== landlordId) return null; 
  
  return result;
};

/* ================================
   GET UNITS BY PROPERTY (Secure)
================================ */
export const getUnitsByPropertyService = async (propertyId: number, landlordId?: number) => {
  if (landlordId) {
    const propertyOwner = await db.query.properties.findFirst({
      where: and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId))
    });
    if (!propertyOwner) return [];
  }

  return await db.query.units.findMany({
    where: eq(units.propertyId, propertyId),
    with: {
      property: { columns: { name: true, location: true, landlordId: true } }
    }
  });
};

/* ================================
   CREATE UNIT (Notification Added)
================================ */
/* ================================
   CREATE UNIT (Optimized)
================================ */
export const createUnitService = async (unit: TUnitInsert) => {
  // 1. Verify Property Exists first to avoid Foreign Key Crash
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, unit.propertyId as number)
  });

  if (!property) {
    throw new Error(`Property with ID ${unit.propertyId} not found in registry.`);
  }

  // 2. Perform Insert
  const result = await db.insert(units).values(unit).returning();
  const newUnit = result[0];

  // 3. Trigger Notification
  try {
    await createNotificationService({
      userId: property.landlordId,
      title: "New Unit Added 🚪",
      message: `Unit ${newUnit.unitNumber} has been added to ${property.name}.`,
      type: "info",
      link: `/landlord/units`
    });
  } catch (notifErr) {
    console.warn("Notification failed, but unit was created:", notifErr);
  }

  return newUnit;
};

/* ================================
   UPDATE UNIT (Fixed to return Object)
================================ */
export const updateUnitService = async (
  unitId: number,
  updates: Partial<TUnitInsert>
) => {
  // 1. Execute Update with RETURNING to get the fresh data
  const result = await db
    .update(units)
    .set(updates)
    .where(eq(units.id, unitId))
    .returning();

  if (!result || !result.length) {
    throw new Error("Unit not found or no changes made");
  }

  const updatedUnit = result[0];

  // 2. Fetch property context for the notification
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, updatedUnit.propertyId)
  });

  // 3. Trigger Notification (Async - we don't necessarily need to wait for this to return data)
  if (property) {
    try {
      await createNotificationService({
        userId: property.landlordId, // Consistently using landlordId
        title: "Unit Updated 📝",
        message: `Unit ${updatedUnit.unitNumber} in ${property.name} has been updated.`,
        type: "info",
        link: `/landlord/units`
      });
    } catch (notiError) {
      console.error("[Service Warning] Notification failed to send:", notiError);
      // We don't throw here because the DB update actually succeeded
    }
  }

  /**
   * FIX: Return the actual OBJECT, not a string message.
   * This allows the Controller to send JSON back to the Frontend.
   */
  return updatedUnit; 
};

/* ================================
   DELETE UNIT
================================ */
export const deleteUnitService = async (unitId: number) => {
  const result = await db.delete(units).where(eq(units.id, unitId)).returning();
  return result.length > 0;
};