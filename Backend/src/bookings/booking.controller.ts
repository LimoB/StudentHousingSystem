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

  if (isNaN(bookingId)) {
    res.status(400).json({ message: "Invalid booking ID" });
    return;
  }

  try {
    const booking = await getBookingByIdService(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY BOOKINGS
================================ */

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = await getStudentBookingsService(req.user.userId);

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
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

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
    const message = await updateBookingStatusService(
      bookingId,
      status
    );

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

    if (!deleted) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};