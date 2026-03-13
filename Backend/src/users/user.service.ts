import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";

export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

type PublicUser = Omit<TUserSelect, "password">;

/* ================================
   GET ALL USERS (ADMIN)
================================ */

export const getUsersService = async (): Promise<PublicUser[]> => {
  const result = await db.query.users.findMany({
    columns: {
      password: false,
    },
  });

  return result as PublicUser[];
};

/* ================================
   GET USER BY ID
================================ */

export const getUserByIdService = async (
  userId: number
): Promise<PublicUser | null> => {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      password: false,
    },
  });

  return result as PublicUser | null;
};

/* ================================
   CREATE USER
================================ */

export const createUserService = async (
  user: TUserInsert
): Promise<PublicUser> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const result = await db
    .insert(users)
    .values({
      ...user,
      password: hashedPassword,
    })
    .returning();

  const createdUser = result[0];

  const { password, ...safeUser } = createdUser;

  return safeUser;
};

/* ================================
   UPDATE USER (ADMIN)
================================ */

export const updateUserService = async (
  userId: number,
  updates: Partial<TUserInsert>
): Promise<string> => {
  const payload = { ...updates };

  if (payload.password) {
    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);
  }

  const result = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) {
    throw new Error("User not found");
  }

  return "User updated successfully";
};

/* ================================
   UPDATE PROFILE
================================ */

export const updateProfileService = async (
  userId: number,
  updates: Partial<TUserInsert>
): Promise<string> => {
  const payload = { ...updates };

  delete payload.role;

  if (payload.password) {
    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);
  }

  const result = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) {
    throw new Error("User not found");
  }

  return "Profile updated successfully";
};

/* ================================
   DELETE USER
================================ */

export const deleteUserService = async (
  userId: number
): Promise<boolean> => {
  const result = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  return result.length > 0;
};