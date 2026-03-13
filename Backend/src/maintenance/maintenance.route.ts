import { Router } from "express";
import {
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequestById,
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  updateMaintenanceStatus,
} from "./maintenance.controller";

import {
  authMiddleware,
  adminOrLandlord,
  studentOnly,
} from "../middleware/authMiddleware";

export const maintenanceRouter = Router();

/* ================================
   ADMIN / LANDLORD
================================ */
maintenanceRouter.get("/", authMiddleware, adminOrLandlord, getMaintenanceRequests);
maintenanceRouter.put("/:id/status", authMiddleware, adminOrLandlord, updateMaintenanceStatus);
maintenanceRouter.delete("/:id", authMiddleware, adminOrLandlord, deleteMaintenanceRequest);

/* ================================
   STUDENT
================================ */
maintenanceRouter.post("/", authMiddleware, studentOnly, createMaintenanceRequest);
maintenanceRouter.get("/my-requests", authMiddleware, studentOnly, getMyMaintenanceRequests);

/* ================================
   COMMON
================================ */
maintenanceRouter.get("/:id", authMiddleware, getMaintenanceRequestById);