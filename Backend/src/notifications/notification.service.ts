import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { notifications } from "../drizzle/schema";

export type TNotificationInsert = typeof notifications.$inferInsert;
export type TNotificationSelect = typeof notifications.$inferSelect;

/* ================================
   GET ALL NOTIFICATIONS
================================ */
export const getNotificationsService = async (): Promise<TNotificationSelect[]> => {
  return await db.query.notifications.findMany();
};

/* ================================
   GET USER NOTIFICATIONS
================================ */
export const getUserNotificationsService = async (userId: number): Promise<TNotificationSelect[]> => {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
  });
};

/* ================================
   CREATE NOTIFICATION
================================ */
export const createNotificationService = async (notification: TNotificationInsert): Promise<TNotificationSelect> => {
  const result = await db.insert(notifications).values(notification).returning();
  return result[0];
};

/* ================================
   MARK AS READ
================================ */
export const markAsReadService = async (notificationId: number): Promise<string> => {
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
export const deleteNotificationService = async (notificationId: number): Promise<boolean> => {
  const result = await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId))
    .returning();

  return result.length > 0;
};