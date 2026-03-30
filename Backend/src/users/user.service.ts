import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";

export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

type PublicUser = Omit<TUserSelect, "password">;

/* ================================
   GET ALL USERS
================================ */
export const getUsersService = async () => {
  return await db.query.users.findMany({
    columns: { password: false },
    with: {
      properties: { columns: { id: true } },
      bookings: { columns: { id: true } },
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)]
  });
};

/* ================================
   GET USER BY ID
================================ */
export const getUserByIdService = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { password: false },
    with: {
      properties: true,
      bookings: {
        with: { unit: { with: { property: true } } }
      },
      leases: true
    }
  });
};

/* ================================
   CREATE USER
=============================== */
export const createUserService = async (user: TUserInsert): Promise<PublicUser> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const result = await db.insert(users).values({
    ...user,
    password: hashedPassword,
  }).returning();

  const { password, ...safeUser } = result[0];
  return safeUser;
};

/* ================================
   UPDATE USER (ADMIN)
================================ */
export const updateUserService = async (userId: number, updates: Partial<TUserInsert>): Promise<PublicUser> => {
  const payload = { ...updates };

  // Logic: Only hash if a new password was actually sent
  if (payload.password && payload.password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);
  } else {
    delete payload.password; // Prevent overwriting with empty/null
  }

  const result = await db.update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) throw new Error("User not found");

  const { password, ...safeUser } = result[0];
  return safeUser; // Returns the updated object to the controller
};

/* ================================
   UPDATE PROFILE (USER SELF-SERVICE)
================================ */
export const updateProfileService = async (userId: number, updates: Partial<TUserInsert>): Promise<PublicUser> => {
  const payload = { ...updates };
  
  delete payload.role; // Security: User cannot change their own role

  if (payload.password && payload.password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);
  } else {
    delete payload.password;
  }

  const result = await db.update(users)
    .set(payload)
    .where(eq(users.id, userId))
    .returning();

  if (!result.length) throw new Error("User not found");

  const { password, ...safeUser } = result[0];
  return safeUser;
};

/* ================================
   DELETE USER
================================ */
export const deleteUserService = async (userId: number): Promise<boolean> => {
  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  return result.length > 0;
};