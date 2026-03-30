import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'booking' | 'maintenance' | 'payment' | 'error';
  link?: string;
  isRead: boolean; // Matches your backend schema
  createdAt: string;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  userId: number;
  type?: string;
  link?: string;
}

/* =========================
   METHODS
========================= */

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await axiosClient.get("/notifications");
  return res.data;
};

export const getMyNotifications = async (): Promise<Notification[]> => {
  const res = await axiosClient.get("/notifications/my-notifications");
  return res.data;
};

export const createNotification = async (data: CreateNotificationPayload) => {
  const res = await axiosClient.post("/notifications", data);
  return res.data;
};

export const markAsRead = async (id: number) => {
  // Matches your backend route: PUT /notifications/:id/read
  const res = await axiosClient.put(`/notifications/${id}/read`);
  return res.data;
};

export const deleteNotification = async (id: number) => {
  const res = await axiosClient.delete(`/notifications/${id}`);
  return res.data;
};