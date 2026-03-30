import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Property {
  id: number;
  name: string;
  location: string;
  landlordId?: number;
}

export interface Unit {
  id: number;
  unitNumber: string;
  unitType?: string;
  price: number;
  property?: Property;
}

export interface Booking {
  id: number;
  studentId: number;
  unitId: number;
  status: "pending" | "approved" | "rejected" | "paid" | "confirmed"; 
  moveInDate: string;
  createdAt: string;
  updatedAt?: string;
  student?: {
    id: number;
    fullName: string;
    email: string;
  }; 
  unit?: Unit;
  payments?: any[];
}

export interface CreateBookingPayload {
  unitId: number;
  studentId?: number;
  moveInDate: string;
  status?: string;
}

/* =========================
   API CALLS
========================= */

// GET ALL BOOKINGS (ADMIN)
export const getBookings = async (): Promise<Booking[]> => {
  const res = await axiosClient.get<Booking[]>("/bookings");
  return res.data;
};

// GET LANDLORD BOOKINGS (NEW)
export const getLandlordBookings = async (): Promise<Booking[]> => {
  const res = await axiosClient.get<Booking[]>("/bookings/landlord");
  return res.data;
};

// GET MY BOOKINGS (STUDENT)
export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await axiosClient.get<Booking[]>("/bookings/my-bookings");
  return res.data;
};

// GET BOOKING BY ID
export const getBookingById = async (id: number): Promise<Booking> => {
  const res = await axiosClient.get<Booking>(`/bookings/${id}`);
  return res.data;
};

// CREATE BOOKING
export const createBooking = async (data: CreateBookingPayload): Promise<{ message: string; booking: Booking }> => {
  const res = await axiosClient.post("/bookings", data);
  return res.data;
};

// UPDATE STATUS
export const updateBookingStatus = async (
  id: number,
  status: string
): Promise<{ message: string }> => {
  const res = await axiosClient.put(`/bookings/${id}/status`, { status });
  return res.data;
};

// DELETE BOOKING
export const deleteBooking = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.delete(`/bookings/${id}`);
  return res.data;
};