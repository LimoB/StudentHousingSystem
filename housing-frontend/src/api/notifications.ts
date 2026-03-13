// src/api/notifications.ts
import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Notification {
  id: number;
  title: string;
  message: string;
  userId?: number;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  userId?: number; // optional for all users
}

/* =========================
   GET ALL (ADMIN)
========================= */
export const getNotifications = async () => {
  const res = await axiosClient.get("/notifications");
  return res.data;
};

/* =========================
   GET MY NOTIFICATIONS
========================= */
export const getMyNotifications = async () => {
  const res = await axiosClient.get("/notifications/my-notifications");
  return res.data;
};

/* =========================
   CREATE NOTIFICATION (ADMIN)
========================= */
export const createNotification = async (data: CreateNotificationPayload) => {
  const res = await axiosClient.post("/notifications", data);
  return res.data;
};

/* =========================
   MARK AS READ
========================= */
export const markAsRead = async (id: number) => {
  const res = await axiosClient.put(`/notifications/${id}/read`);
  return res.data;
};

/* =========================
   DELETE (ADMIN)
========================= */
export const deleteNotification = async (id: number) => {
  const res = await axiosClient.delete(`/notifications/${id}`);
  return res.data;
};