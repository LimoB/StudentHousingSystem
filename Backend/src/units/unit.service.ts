import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { units } from "../drizzle/schema";

export type TUnitInsert = typeof units.$inferInsert;
export type TUnitSelect = typeof units.$inferSelect;

/* ================================
   GET ALL UNITS
================================ */

export const getUnitsService = async (): Promise<TUnitSelect[]> => {
  return await db.query.units.findMany();
};

/* ================================
   GET UNIT BY ID
================================ */

export const getUnitByIdService = async (
  unitId: number
): Promise<TUnitSelect | null> => {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
  });

  return unit ?? null;
};

/* ================================
   GET UNITS BY PROPERTY
================================ */

export const getUnitsByPropertyService = async (
  propertyId: number
): Promise<TUnitSelect[]> => {
  return await db.query.units.findMany({
    where: eq(units.propertyId, propertyId),
  });
};

/* ================================
   CREATE UNIT
================================ */

export const createUnitService = async (
  unit: TUnitInsert
): Promise<TUnitSelect> => {
  const result = await db
    .insert(units)
    .values(unit)
    .returning();

  return result[0];
};

/* ================================
   UPDATE UNIT
================================ */

export const updateUnitService = async (
  unitId: number,
  updates: Partial<TUnitInsert>
): Promise<string> => {
  const result = await db
    .update(units)
    .set(updates)
    .where(eq(units.id, unitId))
    .returning();

  if (!result.length) {
    throw new Error("Unit not found");
  }

  return "Unit updated successfully";
};

/* ================================
   DELETE UNIT
================================ */

export const deleteUnitService = async (
  unitId: number
): Promise<boolean> => {
  const result = await db
    .delete(units)
    .where(eq(units.id, unitId))
    .returning();

  return result.length > 0;
};