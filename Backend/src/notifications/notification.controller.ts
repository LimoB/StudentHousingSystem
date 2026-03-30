import { Request, Response, NextFunction } from "express";
import {
  createNotificationService,
  deleteNotificationService,
  getNotificationsService,
  getUserNotificationsService,
  markAsReadService,
} from "./notification.service";

// Get all (Admin View)
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getNotificationsService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Get current user's notifications
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensuring we look for the ID from your Auth Middleware
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized: No User ID found" });

    const data = await getUserNotificationsService(userId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Manual creation (Optional, usually called internally by other services)
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await createNotificationService(req.body);
    res.status(201).json({ message: "Notification dispatched", notification });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await markAsReadService(id);
    res.status(200).json({ message: "Marked as read", notification: result });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteNotificationService(id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification purged successfully" });
  } catch (error) {
    next(error);
  }
};