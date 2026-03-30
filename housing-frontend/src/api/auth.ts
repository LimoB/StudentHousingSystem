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
 * FINALIZED USER INTERFACE
 * Standardized to match both the backend response (id) 
 * and existing frontend logic (userId).
 */
export interface User {
  id: number;         // Primary key (Required to fix TS error)
  userId?: number;    // Secondary/Alias key used in some frontend logic
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt?: string; // Added since it appeared in your console logs
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