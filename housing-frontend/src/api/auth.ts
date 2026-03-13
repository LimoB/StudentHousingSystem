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

export interface User {
  id: number;
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

export const registerUser = async (data: RegisterRequest) => {
  const response = await axiosClient.post("/auth/register", data);
  return response.data;
};

/* =========================
   LOGIN
========================= */

export const loginUser = async (data: LoginRequest) => {
  const response = await axiosClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

/* =========================
   LOGOUT
========================= */

export const logoutUser = () => {
  localStorage.removeItem("token");
};