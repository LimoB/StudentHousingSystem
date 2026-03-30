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
   MANAGEMENT (ADMIN / LANDLORD)
   Note: getMaintenanceRequests now filters 
   based on the logged-in user's role.
================================ */

// List all requests (Admin) or Property-specific requests (Landlord)
maintenanceRouter.get("/", authMiddleware, adminOrLandlord, getMaintenanceRequests);

// Update status of a request
maintenanceRouter.put("/:id/status", authMiddleware, adminOrLandlord, updateMaintenanceStatus);

// Remove a request record
maintenanceRouter.delete("/:id", authMiddleware, adminOrLandlord, deleteMaintenanceRequest);


/* ================================
   STUDENT
================================ */

// Create a new request (Student only)
maintenanceRouter.post("/", authMiddleware, studentOnly, createMaintenanceRequest);

// Get requests created by the logged-in student
// CRITICAL: This must come BEFORE "/:id" to avoid being treated as an ID
maintenanceRouter.get("/my-requests", authMiddleware, studentOnly, getMyMaintenanceRequests);


/* ================================
   COMMON / INDIVIDUAL
================================ */

// View a single request detail
maintenanceRouter.get("/:id", authMiddleware, getMaintenanceRequestById);