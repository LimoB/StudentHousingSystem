// src/api/users.ts
import axiosClient from "./axios";

/* =========================
   TYPES
========================= */
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "landlord" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "admin" | "landlord" | "student";
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: "admin" | "landlord" | "student";
}

/* =========================
   API FUNCTIONS
========================= */
export const getUsers = async () => {
  const res = await axiosClient.get("/users");
  return res.data;
};

export const getUserById = async (id: number) => {
  const res = await axiosClient.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: CreateUserPayload) => {
  const res = await axiosClient.post("/users", data);
  return res.data;
};

export const updateUser = async (id: number, data: UpdateUserPayload) => {
  const res = await axiosClient.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await axiosClient.delete(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (data: Partial<CreateUserPayload>) => {
  const res = await axiosClient.put("/users/profile", data);
  return res.data;
};