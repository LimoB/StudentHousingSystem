import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { units } from "../drizzle/schema";

export type TUnitInsert = typeof units.$inferInsert;

/* ================================
   GET ALL UNITS (With Property Info)
================================ */
export const getUnitsService = async () => {
  return await db.query.units.findMany({
    with: {
      property: {
        columns: { name: true, location: true }
      }
    }
  });
};

/* ================================
   GET UNIT BY ID
================================ */
export const getUnitByIdService = async (unitId: number) => {
  return await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      property: {
        columns: { name: true, location: true, description: true }
      }
    }
  });
};

/* ================================
   GET UNITS BY PROPERTY
================================ */
export const getUnitsByPropertyService = async (propertyId: number) => {
  return await db.query.units.findMany({
    where: eq(units.propertyId, propertyId),
    // We don't necessarily need 'with' here because the caller 
    // usually already knows the property, but it doesn't hurt.
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