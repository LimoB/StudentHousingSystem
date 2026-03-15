// src/api/properties.ts
import axiosClient from "./axios";
import { Unit } from "./units"; // Import the Unit interface we defined earlier

/* =========================
   TYPES
========================= */
export interface Property {
  id: number;
  name: string;
  location: string;
  description: string | null;
  landlordId: number;
  status: "available" | "occupied" | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Added units to the Property type to support relational data
  units?: Unit[]; 
}

export interface CreatePropertyPayload {
  name: string;
  location: string;
  description?: string;
  landlordId?: number; // Usually handled by backend via JWT
  status?: "available" | "occupied";
}

/* =========================
   API FUNCTIONS
========================= */

/**
 * Fetches all properties for the logged-in landlord.
 * The backend should return properties with their nested units.
 */
export const getProperties = async (): Promise<Property[]> => {
  console.log("API: getProperties");
  const res = await axiosClient.get("/properties");
  return res.data;
};

/**
 * Fetches a single property by ID, including its units.
 */
export const getPropertyById = async (id: number): Promise<Property> => {
  console.log("API: getPropertyById", id);
  const res = await axiosClient.get(`/properties/${id}`);
  return res.data;
};

export const createProperty = async (data: CreatePropertyPayload): Promise<Property> => {
  console.log("API: createProperty", data);
  const res = await axiosClient.post("/properties", data);
  return res.data;
};

export const updateProperty = async (
  id: number,
  data: Partial<CreatePropertyPayload>
): Promise<Property> => {
  console.log("API: updateProperty", id, data);
  const res = await axiosClient.put(`/properties/${id}`, data);
  return res.data;
};

export const deleteProperty = async (id: number): Promise<{ message: string }> => {
  console.log("API: deleteProperty", id);
  const res = await axiosClient.delete(`/properties/${id}`);
  return res.data;
};