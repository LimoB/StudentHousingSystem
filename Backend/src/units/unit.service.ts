import { eq, and, inArray } from "drizzle-orm";
import db from "../drizzle/db";
import { units, properties } from "../drizzle/schema";

export type TUnitInsert = typeof units.$inferInsert;

/* ================================
   GET LANDLORD UNITS ONLY
================================ */
export const getUnitsService = async (landlordId: number) => {
  // Join with properties to ensure we only get units where property.landlordId matches
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
        columns: { name: true, location: true }
      }
    }
  });
};

/* ================================
   GET UNIT BY ID (Secure)
=============================== */
export const getUnitByIdService = async (unitId: number, landlordId: number) => {
  const result = await db.query.units.findFirst({
    where: and(eq(units.id, unitId)),
    with: {
      property: true
    }
  });

  // Verify ownership after fetch (or include in 'where' via a join)
  if (result && result.property.landlordId !== landlordId) {
    return null; 
  }
  return result;
};

/* ================================
   GET UNITS BY PROPERTY (Secure)
================================ */
export const getUnitsByPropertyService = async (propertyId: number, landlordId: number) => {
  // Verify the property belongs to the landlord before returning its units
  const propertyOwner = await db.query.properties.findFirst({
    where: and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId))
  });

  if (!propertyOwner) return [];

  return await db.query.units.findMany({
    where: eq(units.propertyId, propertyId),
  });
};

// ... keep create, update, delete standard, but check ownership in controller

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