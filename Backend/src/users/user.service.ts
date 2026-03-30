import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";
import { createNotificationService } from "../notifications/notification.service";

export type TUserInsert = typeof users.$inferInsert;
export type TUserSelect = typeof users.$inferSelect;

type PublicUser = Omit<TUserSelect, "password">;

/**
 * Helper to determine the profile link based on user role
 */
const getProfileLink = (role: string) => {
  if (role === "admin") return "/admin/dashboard"; // Usually admins don't have a dedicated 'profile' page, or it's part of dashboard
  return `/${role}/dashboard`; // Redirects to student/dashboard or landlord/dashboard
};

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
    orderBy: [desc(users.createdAt)]
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
   CREATE USER (Welcome Notification)
=============================== */
export const createUserService = async (user: TUserInsert): Promise<PublicUser> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const result = await db.insert(users).values({
    ...user,
    password: hashedPassword,
  }).returning();

  const { password, ...safeUser } = result[0];

  // Send a Welcome Notification with Role-Based Link
  await createNotificationService({
    userId: safeUser.id,
    title: "Welcome! 👋",
    message: `Hi ${safeUser.fullName}, your account has been created successfully. Welcome to the platform!`,
    type: "info",
    link: getProfileLink(safeUser.role)
  });

  return safeUser;
};

/* ================================
   UPDATE USER (ADMIN Action)
================================ */
export const updateUserService = async (userId: number, updates: Partial<TUserInsert>): Promise<PublicUser> => {
  const payload = { ...updates };

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

  // Notify user that an Admin modified their account
  await createNotificationService({
    userId: safeUser.id,
    title: "Account Updated by Admin 🛠️",
    message: "Your account details have been modified by an administrator.",
    type: "info",
    link: getProfileLink(safeUser.role)
  });

  return safeUser;
};

/* ================================
   UPDATE PROFILE (USER SELF-SERVICE)
================================ */
export const updateProfileService = async (userId: number, updates: Partial<TUserInsert>): Promise<PublicUser> => {
  const payload = { ...updates };
  
  // Security: Prevent self-promotion to Admin
  if ("role" in payload) delete (payload as any).role; 

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

  // Notify user of their own change
  await createNotificationService({
    userId: safeUser.id,
    title: "Profile Updated ✅",
    message: "You have successfully updated your profile information.",
    type: "info",
    link: getProfileLink(safeUser.role)
  });

  return safeUser;
};

/* ================================
   DELETE USER
================================ */
export const deleteUserService = async (userId: number): Promise<boolean> => {
  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  return result.length > 0;
};