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
export const createUnitService = async (unit: TUnitInsert) => {
  const result = await db.insert(units).values(unit).returning();
  const newUnit = result[0];

  // Fetch property details to get the landlordId
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, newUnit.propertyId)
  });

  if (property) {
    await createNotificationService({
      userId: property.landlordId,
      title: "New Unit Added 🚪",
      message: `Unit ${newUnit.unitNumber} has been added to ${property.name}.`,
      type: "info",
      // UPDATED LINK
      link: `/landlord/units`
    });
  }

  return newUnit;
};

/* ================================
   UPDATE UNIT (Notification Added)
================================ */
export const updateUnitService = async (
  unitId: number,
  updates: Partial<TUnitInsert>
) => {
  const result = await db
    .update(units)
    .set(updates)
    .where(eq(units.id, unitId))
    .returning();

  if (!result.length) throw new Error("Unit not found");
  const updatedUnit = result[0];

  // Fetch property context for the notification
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, updatedUnit.propertyId)
  });

  if (property) {
    await createNotificationService({
      userId: property.landlordId,
      title: "Unit Updated 📝",
      message: `Unit ${updatedUnit.unitNumber} in ${property.name} has been updated.`,
      type: "info",
      // UPDATED LINK
      link: `/landlord/units`
    });
  }

  return "Unit updated successfully";
};

/* ================================
   DELETE UNIT
================================ */
export const deleteUnitService = async (unitId: number) => {
  const result = await db.delete(units).where(eq(units.id, unitId)).returning();
  return result.length > 0;
};