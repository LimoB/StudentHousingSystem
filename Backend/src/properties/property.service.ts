import { eq, and, SQL } from "drizzle-orm";
import db from "../drizzle/db";
import { properties, units } from "../drizzle/schema";

export type TPropertyInsert = typeof properties.$inferInsert;

/* ================================
   GET ALL PROPERTIES (With Relations)
================================ */
export const getPropertiesService = async (
  filter?: { status?: "available" | "occupied" }
) => {
  return await db.query.properties.findMany({
    where: filter?.status ? eq(properties.status, filter.status) : undefined,
    with: {
      landlord: {
        columns: { fullName: true, phone: true, email: true }
      },
      units: true // Pulls all rooms/units for each property
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)]
  });
};

/* ================================
   GET PROPERTY BY ID (Deep Relations)
================================ */
export const getPropertyByIdService = async (
  propertyId: number,
  filter?: { status?: "available" | "occupied" }
) => {
  let condition: SQL<unknown> = eq(properties.id, propertyId);

  if (filter?.status) {
    condition = and(condition, eq(properties.status, filter.status))!;
  }

  return await db.query.properties.findFirst({
    where: condition,
    with: {
      landlord: {
        columns: { fullName: true, phone: true, email: true }
      },
      units: {
        // You can even filter units here if needed
        where: eq(units.isAvailable, true)
      }
    }
  });
};

/* ================================
   CREATE PROPERTY
================================ */
export const createPropertyService = async (property: TPropertyInsert) => {
  const result = await db.insert(properties).values(property).returning();
  return result[0];
};

/* ================================
   UPDATE PROPERTY
================================ */
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
  return "Property updated successfully";
};

/* ================================
   DELETE PROPERTY
================================ */
export const deletePropertyService = async (propertyId: number) => {
  const result = await db.delete(properties).where(eq(properties.id, propertyId)).returning();
  return result.length > 0;
};