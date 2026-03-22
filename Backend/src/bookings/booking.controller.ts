import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  deleteBookingService,
  getBookingByIdService,
  getBookingsService,
  getStudentBookingsService,
  updateBookingStatusService,
} from "./booking.service";

/* ================================
   GET ALL BOOKINGS (ADMIN)
================================ */
export const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await getBookingsService();
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET BOOKING BY ID
================================ */
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookingId = Number(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: "Invalid booking ID" });

  try {
    const booking = await getBookingByIdService(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY BOOKINGS (STUDENT)
   Standardized to use .userId from Auth Middleware
================================ */
export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Check if user is attached by authMiddleware
    // TypeScript knows 'userId' exists because of your 'declare global'
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({ 
        message: "Unauthorized: Student profile not found in token" 
      });
    }

    // 2. Fetch the student's specific bookings
    const bookings = await getStudentBookingsService(studentId);

    // 3. Return results
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE BOOKING (STUDENT)
================================ */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const booking = await createBookingService({
      ...req.body,
      studentId: req.user.userId,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE BOOKING STATUS
================================ */
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;

  try {
    const message = await updateBookingStatusService(bookingId, status);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE BOOKING
================================ */
export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookingId = Number(req.params.id);

  try {
    const deleted = await deleteBookingService(bookingId);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};