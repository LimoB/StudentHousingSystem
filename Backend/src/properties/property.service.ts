import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { properties } from "../drizzle/schema";

export type TPropertyInsert = typeof properties.$inferInsert;
export type TPropertySelect = typeof properties.$inferSelect;

/* ================================
   GET ALL PROPERTIES
================================ */

export const getPropertiesService = async (): Promise<TPropertySelect[]> => {
  return await db.query.properties.findMany();
};

/* ================================
   GET PROPERTY BY ID
================================ */

export const getPropertyByIdService = async (
  propertyId: number
): Promise<TPropertySelect | null> => {
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
  });

  return property ?? null;
};

/* ================================
   CREATE PROPERTY
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