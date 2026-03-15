import { eq, and, SQL } from "drizzle-orm";
import db from "../drizzle/db";
import { properties } from "../drizzle/schema";

export type TPropertyInsert = typeof properties.$inferInsert;
export type TPropertySelect = typeof properties.$inferSelect;

/* ================================
   GET ALL PROPERTIES
   - Students see only 'available', landlords/admins see all
================================ */
export const getPropertiesService = async (
  filter?: { status?: "available" | "occupied" }
): Promise<TPropertySelect[]> => {
  if (filter?.status) {
    return await db.query.properties.findMany({
      where: eq(properties.status, filter.status),
    });
  }

  return await db.query.properties.findMany();
};

/* ================================
   GET PROPERTY BY ID
   - Optionally restrict by status (students cannot see occupied)
================================ */
export const getPropertyByIdService = async (
  propertyId: number,
  filter?: { status?: "available" | "occupied" }
): Promise<TPropertySelect | null> => {
  // Always start with a valid condition
  let condition: SQL<unknown> = eq(properties.id, propertyId);

  // If a status filter exists, combine it using `and`
  if (filter?.status) {
    condition = and(condition, eq(properties.status, filter.status))!;
  }

  const property = await db.query.properties.findFirst({
    where: condition,
  });

  return property ?? null;
};

/* ================================
   CREATE PROPERTY
   - Landlords/Admins only (handled in controller)
================================ */
export const createPropertyService = async (
  property: TPropertyInsert
): Promise<TPropertySelect> => {
  const result = await db
    .insert(properties)
    .values(property)
    .returning();

  return result[0];
};

/* ================================
   UPDATE PROPERTY
   - Landlords/Admins only (handled in controller)
================================ */
export const updatePropertyService = async (
  propertyId: number,
  updates: Partial<TPropertyInsert>
): Promise<string> => {
  const result = await db
    .update(properties)
    .set(updates)
    .where(eq(properties.id, propertyId))
    .returning();

  if (!result.length) {
    throw new Error("Property not found");
  }

  return "Property updated successfully";
};

/* ================================
   DELETE PROPERTY
   - Landlords/Admins only (handled in controller)
================================ */
export const deletePropertyService = async (
  propertyId: number
): Promise<boolean> => {
  const result = await db
    .delete(properties)
    .where(eq(properties.id, propertyId))
    .returning();

  return result.length > 0;
};