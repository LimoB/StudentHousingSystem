import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  getMyBookings,
  getLandlordBookings, // Import the new controller
  updateBookingStatus,
} from "./booking.controller";

import {
  authMiddleware,
  adminOrLandlord,
  studentOnly,
  adminOnly, // Assuming you have this for the global view
} from "../middleware/authMiddleware";

export const bookingRouter = Router();

/* ================================
   ADMIN & LANDLORD ROUTES
================================ */

// 1. Global View: Only for Admins to see EVERY booking in the system
bookingRouter.get(
  "/bookings/",
  authMiddleware,
  adminOnly, 
  getBookings
);

// 2. Landlord View: For landlords to see bookings for THEIR properties only
bookingRouter.get(
  "/bookings/landlord",
  authMiddleware,
  adminOrLandlord,
  getLandlordBookings
);

// 3. Status Update: For landlords/admins to approve or reject
bookingRouter.put(
  "/bookings/:id/status",
  authMiddleware,
  adminOrLandlord,
  updateBookingStatus
);

/* ================================
   STUDENT ROUTES
================================ */

bookingRouter.post(
  "/bookings",
  authMiddleware,
  studentOnly,
  createBooking
);

bookingRouter.get(
  "/bookings/my-bookings",
  authMiddleware,
  studentOnly,
  getMyBookings
);

/* ================================
   COMMON ROUTES
================================ */

bookingRouter.get(
  "/bookings/:id",
  authMiddleware,
  getBookingById
);

bookingRouter.delete(
  "/bookings/:id",
  authMiddleware,
  deleteBooking
);

export default bookingRouter;