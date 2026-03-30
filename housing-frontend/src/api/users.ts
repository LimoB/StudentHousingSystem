import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

/**
 * Standard User interface used across the API.
 * Note: We include both 'id' (from DB) and 'userId' (for Redux consistency)
 * to prevent TS errors in the slices.
 */
export interface User {
  id: number;
  userId?: number; // Added to match authSlice expectation
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "landlord" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
}

export interface SingleUserResponse {
  user: User;
  message?: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password?: string; 
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

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<User[]>("/users");
  // Map 'id' to 'userId' immediately so the rest of the app doesn't break
  return res.data.map(u => ({ ...u, userId: u.id }));
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await axiosClient.get<User>(`/users/${id}`);
  return { ...res.data, userId: res.data.id };
};

export const createUser = async (data: CreateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.post<SingleUserResponse>("/users", data);
  if (res.data.user) {
    res.data.user.userId = res.data.user.id;
  }
  return res.data;
};

export const updateUser = async (id: number, data: UpdateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.put<SingleUserResponse>(`/users/${id}`, data);
  if (res.data.user) {
    res.data.user.userId = res.data.user.id;
  }
  return res.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.delete<{ message: string }>(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (data: UpdateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.put<SingleUserResponse>("/users/profile", data);
  if (res.data.user) {
    res.data.user.userId = res.data.user.id;
  }
  return res.data;
};