import { Router } from "express";
import {
  createNotification,
  deleteNotification,
  getMyNotifications,
  getNotifications,
  markAsRead,
} from "./notification.controller";

import { authMiddleware, adminOnly } from "../middleware/authMiddleware";

export const notificationRouter = Router();

/* ================================
   ADMIN
================================ */
notificationRouter.get("/", authMiddleware, adminOnly, getNotifications);
notificationRouter.post("/", authMiddleware, adminOnly, createNotification);
notificationRouter.delete("/:id", authMiddleware, adminOnly, deleteNotification);

/* ================================
   USER
================================ */
notificationRouter.get("/my-notifications", authMiddleware, getMyNotifications);
notificationRouter.put("/:id/read", authMiddleware, markAsRead);