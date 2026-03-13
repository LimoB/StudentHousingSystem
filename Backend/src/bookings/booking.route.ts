import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  getMyBookings,
  updateBookingStatus,
} from "./booking.controller";

import {
  authMiddleware,
  adminOrLandlord,
  studentOnly,
} from "../middleware/authMiddleware";

export const bookingRouter = Router();

/* ================================
   ADMIN / LANDLORD
================================ */

bookingRouter.get(
  "/",
  authMiddleware,
  adminOrLandlord,
  getBookings
);

bookingRouter.put(
  "/:id/status",
  authMiddleware,
  adminOrLandlord,
  updateBookingStatus
);

/* ================================
   STUDENT
================================ */

bookingRouter.post(
  "/",
  authMiddleware,
  studentOnly,
  createBooking
);

bookingRouter.get(
  "/my-bookings",
  authMiddleware,
  studentOnly,
  getMyBookings
);

/* ================================
   COMMON
================================ */

bookingRouter.get(
  "/:id",
  authMiddleware,
  getBookingById
);

bookingRouter.delete(
  "/:id",
  authMiddleware,
  deleteBooking
);