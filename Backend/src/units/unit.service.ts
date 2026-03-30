import { eq, and, sql } from "drizzle-orm";
import db from "../drizzle/db";
import { units, properties } from "../drizzle/schema";

export type TUnitInsert = typeof units.$inferInsert;

/* ================================
   GET UNITS (Admin = All, Landlord = Filtered)
================================ */
export const getUnitsService = async (landlordId?: number) => {
  // If no landlordId is provided, it's an Admin request: Return all units
  if (!landlordId) {
    return await db.query.units.findMany({
      with: {
        property: {
          columns: { name: true, location: true, landlordId: true }
        }
      }
    });
  }

  // Otherwise, filter by landlordId via existence check in properties table
  return await db.query.units.findMany({
    where: (units, { exists }) => exists(
      db.select()
        .from(properties)
        .where(
          and(
            eq(properties.id, units.propertyId),
            eq(properties.landlordId, landlordId)
          )
        )
    ),
    with: {
      property: {
        columns: { name: true, location: true, landlordId: true }
      }
    }
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

  // If landlordId is provided (Landlord), check ownership. 
  // If undefined (Admin), bypass.
  if (landlordId && result.property.landlordId !== landlordId) {
    return null; 
  }
  
  return result;
};

/* ================================
   GET UNITS BY PROPERTY (Secure)
================================ */
export const getUnitsByPropertyService = async (propertyId: number, landlordId?: number) => {
  // If landlordId is provided, verify ownership first
  if (landlordId) {
    const propertyOwner = await db.query.properties.findFirst({
      where: and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId))
    });
    if (!propertyOwner) return [];
  }

  // Admin or verified Landlord proceeds to fetch units
  return await db.query.units.findMany({
    where: eq(units.propertyId, propertyId),
    with: {
      property: {
        columns: { name: true, location: true }
      }
    }
  });
};

/* ================================
   CREATE UNIT
================================ */
export const createUnitService = async (unit: TUnitInsert) => {
  const result = await db.insert(units).values(unit).returning();
  return result[0];
};

/* ================================
   UPDATE UNIT
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
  return "Unit updated successfully";
};

/* ================================
   DELETE UNIT
================================ */
export const deleteUnitService = async (unitId: number) => {
  const result = await db.delete(units).where(eq(units.id, unitId)).returning();
  return result.length > 0;
};