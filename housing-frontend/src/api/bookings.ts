import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Booking {
  id: number;
  studentId: number;
  unitId: number;
  status: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  unitId: number;
  startDate?: string;
}

/* =========================
   GET ALL BOOKINGS
   (ADMIN / LANDLORD)
========================= */

export const getBookings = async () => {
  const res = await axiosClient.get("/bookings");
  return res.data;
};

/* =========================
   GET MY BOOKINGS
========================= */

export const getMyBookings = async () => {
  const res = await axiosClient.get("/bookings/my-bookings");
  return res.data;
};

/* =========================
   GET BOOKING BY ID
========================= */

export const getBookingById = async (id: number) => {
  const res = await axiosClient.get(`/bookings/${id}`);
  return res.data;
};

/* =========================
   CREATE BOOKING
========================= */

export const createBooking = async (data: CreateBookingPayload) => {
  const res = await axiosClient.post("/bookings", data);
  return res.data;
};

/* =========================
   UPDATE STATUS
========================= */

export const updateBookingStatus = async (
  id: number,
  status: string
) => {
  const res = await axiosClient.put(`/bookings/${id}/status`, {
    status,
  });

  return res.data;
};

/* =========================
   DELETE BOOKING
========================= */

export const deleteBooking = async (id: number) => {
  const res = await axiosClient.delete(`/bookings/${id}`);
  return res.data;
};