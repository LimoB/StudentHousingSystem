import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export type UserRole = "admin" | "landlord" | "student";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * UPDATED: Added userId to match your backend payload 
 * and your Redux slice expectations.
 */
export interface User {
  userId: number; // Primary key used in your frontend logic
  id?: number;    // Optional, in case some endpoints return 'id'
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

/* =========================
   REGISTER
========================= */

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>("/auth/register", data);
  return response.data;
};

/* =========================
   LOGIN
========================= */

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

/* =========================
   LOGOUT
========================= */

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};