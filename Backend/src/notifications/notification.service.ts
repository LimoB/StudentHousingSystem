import { eq, desc, and } from "drizzle-orm";
import db from "../drizzle/db";
import { notifications } from "../drizzle/schema";

export type TNotificationInsert = typeof notifications.$inferInsert;

/* ================================
   GET ALL NOTIFICATIONS
================================ */
export const getNotificationsService = async () => {
  return await db.query.notifications.findMany({
    with: {
      user: {
        columns: { fullName: true, email: true, role: true }
      }
    },
    orderBy: [desc(notifications.createdAt)]
  });
};

/* ================================
   GET USER NOTIFICATIONS
================================ */
export const getUserNotificationsService = async (userId: number) => {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)]
  });
};

/* ================================
   CREATE NOTIFICATION (Internal Utility)
================================ */
export const createNotificationService = async (notification: TNotificationInsert) => {
  const result = await db
    .insert(notifications)
    .values({
      ...notification,
      isRead: false // Ensure new notifications are unread
    })
    .returning();
  return result[0];
};

/* ================================
   MARK AS READ
================================ */
export const markAsReadService = async (notificationId: number) => {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();

  if (!result.length) throw new Error("Notification not found");
  return result[0];
};

/* ================================
   DELETE NOTIFICATION
================================ */
export const deleteNotificationService = async (notificationId: number) => {
  const result = await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId))
    .returning();
    
  return result.length > 0;
};