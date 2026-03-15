import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { notifications } from "../drizzle/schema";

export type TNotificationInsert = typeof notifications.$inferInsert;

/* ================================
   GET ALL NOTIFICATIONS (With Relations)
================================ */
export const getNotificationsService = async () => {
  return await db.query.notifications.findMany({
    with: {
      user: {
        columns: { fullName: true, email: true }
      }
    },
    orderBy: [desc(notifications.createdAt)]
  });
};

/* ================================
   GET USER NOTIFICATIONS (Newest First)
================================ */
export const getUserNotificationsService = async (userId: number) => {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)]
  });
};

/* ================================
   CREATE NOTIFICATION
================================ */
export const createNotificationService = async (notification: TNotificationInsert) => {
  const result = await db.insert(notifications).values(notification).returning();
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
  return "Notification marked as read";
};

/* ================================
   DELETE NOTIFICATION
================================ */
export const deleteNotificationService = async (notificationId: number) => {
  const result = await db.delete(notifications).where(eq(notifications.id, notificationId)).returning();
  return result.length > 0;
};