import { Router } from "express";
import {
  createLease,
  deleteLease,
  endLease,
  getLeaseById,
  getLeases,
  getMyLeases,
} from "./lease.controller";

import {
  authMiddleware,
  adminOrLandlord,
  studentOnly,
} from "../middleware/authMiddleware";

export const leaseRouter = Router();

/* ================================
   ADMIN / LANDLORD
================================ */

leaseRouter.get(
  "/",
  authMiddleware,
  adminOrLandlord,
  getLeases
);

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

/* ================================
   STUDENT
================================ */

leaseRouter.get(
  "/my-leases",
  authMiddleware,
  studentOnly,
  getMyLeases
);

/* ================================
   COMMON
================================ */

leaseRouter.get(
  "/:id",
  authMiddleware,
  getLeaseById
);