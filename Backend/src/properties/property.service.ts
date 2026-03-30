import { eq, and, SQL } from "drizzle-orm";
import db from "../drizzle/db";
import { properties, units } from "../drizzle/schema";

export type TPropertyInsert = typeof properties.$inferInsert;

/* ================================
   GET ALL PROPERTIES (With Relations)
========================= */
export const getPropertiesService = async (
  filter?: { status?: "available" | "occupied"; landlordId?: number }
) => {
  let condition: SQL | undefined = undefined;

  const conditions: SQL[] = [];
  if (filter?.status) conditions.push(eq(properties.status, filter.status));
  if (filter?.landlordId) conditions.push(eq(properties.landlordId, filter.landlordId));

  if (conditions.length > 0) {
    condition = and(...conditions);
  }

  return await db.query.properties.findMany({
    where: condition,
    with: {
      landlord: {
        columns: { fullName: true, phone: true, email: true }
      },
      units: true 
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)]
  });
};

/* ================================
   GET PROPERTY BY ID (Deep Relations)
========================= */
export const getPropertyByIdService = async (
  propertyId: number,
  filter?: { status?: "available" | "occupied"; landlordId?: number }
) => {
  const conditions: SQL[] = [eq(properties.id, propertyId)];

  if (filter?.status) conditions.push(eq(properties.status, filter.status));
  if (filter?.landlordId) conditions.push(eq(properties.landlordId, filter.landlordId));

  return await db.query.properties.findFirst({
    where: and(...conditions),
    with: {
      landlord: {
        columns: { fullName: true, phone: true, email: true }
      },
      units: true 
    }
  });
};

/* ================================
   CREATE PROPERTY
========================= */
export const createPropertyService = async (property: TPropertyInsert) => {
  const result = await db.insert(properties).values(property).returning();
  return result[0];
};

/* ================================
   UPDATE PROPERTY
========================= */
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
========================= */
export const deletePropertyService = async (propertyId: number) => {
  const result = await db.delete(properties).where(eq(properties.id, propertyId)).returning();
  return result.length > 0;
};