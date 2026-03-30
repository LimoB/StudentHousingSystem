import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  deleteBookingService,
  getBookingByIdService,
  getBookingsService,
  getStudentBookingsService,
  getLandlordBookingsService,
  updateBookingStatusService,
} from "./booking.service";

/* ================================
   GET ALL BOOKINGS (ADMIN ONLY)
================================ */
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[CONTROLLER] Fetching all bookings (Admin)");
  try {
    const bookings = await getBookingsService();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("[ERROR] getBookings:", error);
    next(error);
  }
};

/* ================================
   GET LANDLORD BOOKINGS
================================ */
export const getLandlordBookings = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[CONTROLLER] Hit Landlord Bookings Route");
  try {
    // Check exactly what the authMiddleware is attaching
    console.log("[DEBUG] req.user content:", req.user);

    const landlordId = req.user?.userId;

    if (!landlordId) {
      console.warn("[WARN] Landlord ID missing from req.user");
      return res.status(401).json({ message: "Unauthorized: Landlord profile not found" });
    }

    console.log("[DEBUG] Calling Service with Landlord ID:", landlordId);
    const bookings = await getLandlordBookingsService(landlordId);
    
    console.log(`[SUCCESS] Found ${bookings.length} bookings for Landlord ${landlordId}`);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("[ERROR] getLandlordBookings:", error);
    next(error);
  }
};

/* ================================
   GET MY BOOKINGS (STUDENT)
================================ */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[CONTROLLER] Hit Student 'My Bookings' Route");
  try {
    const studentId = req.user?.userId;
    console.log("[DEBUG] Student ID from token:", studentId);

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized: Student profile not found" });
    }

    const bookings = await getStudentBookingsService(studentId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("[ERROR] getMyBookings:", error);
    next(error);
  }
};

/* ================================
   GET BOOKING BY ID
================================ */
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  console.log(`[CONTROLLER] Fetching Booking by ID: ${id}`);
  
  const bookingId = Number(id);
  if (isNaN(bookingId)) {
    console.warn(`[WARN] Invalid Booking ID requested: ${id}`);
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    const booking = await getBookingByIdService(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    console.error("[ERROR] getBookingById:", error);
    next(error);
  }
};

/* ================================
   CREATE BOOKING (STUDENT)
================================ */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[CONTROLLER] Creating new booking for student:", req.user?.userId);
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
    console.error("[ERROR] createBooking:", error);
    next(error);
  }
};

/* ================================
   UPDATE BOOKING STATUS
================================ */
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;
  const currentUserId = req.user?.userId;

  console.log(`[CONTROLLER] Status Update Request - Booking: ${bookingId}, New Status: ${status}`);

  try {
    const booking = await getBookingByIdService(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Ensure the property exists within the booking object for ownership check
    const propertyOwnerId = (booking as any).unit?.property?.landlordId;
    
    console.log(`[DEBUG] Property Owner: ${propertyOwnerId}, Requesting User: ${currentUserId}`);

    if (req.user?.role !== 'admin' && propertyOwnerId !== currentUserId) {
      console.warn(`[WARN] Unauthorized status update attempt by user ${currentUserId}`);
      return res.status(403).json({ message: "Forbidden: You do not own this property" });
    }

    const message = await updateBookingStatusService(bookingId, status);
    res.status(200).json({ message });
  } catch (error) {
    console.error("[ERROR] updateBookingStatus:", error);
    next(error);
  }
};

/* ================================
   DELETE BOOKING
================================ */
export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  const bookingId = Number(req.params.id);
  console.log(`[CONTROLLER] Deleting booking: ${bookingId}`);

  try {
    const deleted = await deleteBookingService(bookingId);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("[ERROR] deleteBooking:", error);
    next(error);
  }
};