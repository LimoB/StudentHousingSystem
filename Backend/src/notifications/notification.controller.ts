import { Request, Response, NextFunction } from "express";
import {
  createNotificationService,
  deleteNotificationService,
  getNotificationsService,
  getUserNotificationsService,
  markAsReadService,
} from "./notification.service";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getNotificationsService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const data = await getUserNotificationsService(userId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await createNotificationService(req.body);
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const message = await markAsReadService(id);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteNotificationService(id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};