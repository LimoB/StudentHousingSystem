import { Router } from "express";
import {
  createLease,
  deleteLease,
  endLease,
  getLeaseById,
  getLeases,
  getMyLeases,
  getLandlordLeases, 
} from "./lease.controller";

import {
  authMiddleware,
  adminOrLandlord,
  studentOnly,
  adminOnly,
} from "../middleware/authMiddleware";

export const leaseRouter = Router();

/* =====================================
   1. STATIC ROUTES (Must come first!)
===================================== */

// Landlords see only leases for their own properties
leaseRouter.get(
  "/landlord",
  authMiddleware,
  adminOrLandlord,
  getLandlordLeases
);

// Students see only their personal leases
leaseRouter.get(
  "/my-leases",
  authMiddleware,
  studentOnly,
  getMyLeases
);

// Global overview for Admins
leaseRouter.get(
  "/",
  authMiddleware,
  adminOnly, 
  getLeases
);

/* =====================================
   2. MANAGEMENT & ACTION ROUTES
===================================== */

leaseRouter.post(
  "/",
  authMiddleware,
  adminOrLandlord,
  createLease
);

leaseRouter.put(
  "/:id/end",
  authMiddleware,
  adminOrLandlord,
  endLease
);

leaseRouter.delete(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  deleteLease
);

/* =====================================
   3. DYNAMIC ROUTES (Must come last!)
===================================== */

// This will now only trigger if the URL doesn't match the static paths above
leaseRouter.get(
  "/:id",
  authMiddleware,
  getLeaseById
);