import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface User {
  id: number;
  userId: number; // Mandatory for Redux consistency
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "landlord" | "student";
  createdAt: string;
  updatedAt?: string;
}

// This interface matches the standardized response from your new Controller
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

/**
 * Normalizes user data to ensure 'userId' always exists
 */
const normalizeUser = (u: any): User => ({
  ...u,
  userId: u.userId || u.id,
});

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<any[]>("/users");
  // The backend returns an array directly
  return res.data.map(normalizeUser);
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await axiosClient.get<any>(`/users/${id}`);
  return normalizeUser(res.data);
};

export const createUser = async (data: CreateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.post<any>("/users", data);
  // Support both {user: {}} and raw {} responses
  const userData = res.data.user || res.data;
  return {
    message: res.data.message || "Created",
    user: normalizeUser(userData)
  };
};

export const updateUser = async (id: number, data: UpdateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.put<any>(`/users/${id}`, data);
  
  /**
   * FIX: If the backend returns { message: "..." } only, 
   * we must handle that so the Thunk doesn't crash.
   */
  const userData = res.data.user || res.data;
  
  return {
    message: res.data.message || "Updated",
    user: normalizeUser(userData)
  };
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.delete<{ message: string }>(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (data: UpdateUserPayload): Promise<SingleUserResponse> => {
  const res = await axiosClient.put<any>("/users/profile", data);
  const userData = res.data.user || res.data;
  
  return {
    message: res.data.message || "Profile Updated",
    user: normalizeUser(userData)
  };
};