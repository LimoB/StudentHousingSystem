import { Request, Response, NextFunction } from "express";
import {
  createNotificationService,
  deleteNotificationService,
  getNotificationsService,
  getUserNotificationsService,
  markAsReadService,
} from "./notification.service";

/* ================================
   GET ALL NOTIFICATIONS (ADMIN)
================================ */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await getNotificationsService();
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY NOTIFICATIONS
================================ */
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await getUserNotificationsService(req.user.userId);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE NOTIFICATION (ADMIN)
================================ */
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await createNotificationService(req.body);
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    next(error);
  }
};

/* ================================
   MARK AS READ
================================ */
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  const notificationId = Number(req.params.id);
  try {
    const message = await markAsReadService(notificationId);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE NOTIFICATION (ADMIN)
================================ */
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  const notificationId = Number(req.params.id);
  try {
    const deleted = await deleteNotificationService(notificationId);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};