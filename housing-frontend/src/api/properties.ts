import axiosClient from "./axios";
import { Unit } from "./units";

/* =========================
   TYPES
========================= */

/**
 * Enhanced Property Interface
 * Matches the backend's relational structure.
 */
export interface Property {
  id: number;
  name: string;
  location: string;
  description: string | null;
  /** * Matches the User's 'userId'. 
   * This is the foreign key connecting the property to the landlord.
   */
  landlordId: number; 
  status: "available" | "occupied" | "maintenance" | null;
  createdAt: string;
  updatedAt: string;
  
  // Nested data from relations
  units?: Unit[]; 
  
  // Optional: If backend sends aggregated stats
  _count?: {
    units: number;
  };
}

/**
 * Payload for creating/updating a property.
 * Includes all fields allowed by the backend controller.
 */
export interface CreatePropertyPayload {
  name: string;
  location: string;
  description?: string;
  status?: "available" | "occupied" | "maintenance";
}

/**
 * Standardized Backend Responses
 */
export interface PropertyResponse {
  message: string;
  property: Property;
}

export interface DeletePropertyResponse {
  message: string;
}

/* =========================
   API FUNCTIONS
========================= */

/**
 * GET ALL PROPERTIES
 * Backend Logic: 
 * - Landlords: Returns properties where landlordId === req.user.userId
 * - Students: Returns all 'available' properties
 */
export const getProperties = async (): Promise<Property[]> => {
  const res = await axiosClient.get<Property[]>("/properties");
  return res.data;
};

/**
 * GET SINGLE PROPERTY
 * Includes nested units if the backend is configured for eager loading.
 */
export const getPropertyById = async (id: number): Promise<Property> => {
  const res = await axiosClient.get<Property>(`/properties/${id}`);
  return res.data;
};

/**
 * CREATE PROPERTY
 */
export const createProperty = async (data: CreatePropertyPayload): Promise<PropertyResponse> => {
  const res = await axiosClient.post<PropertyResponse>("/properties", data);
  return res.data;
};

/**
 * UPDATE PROPERTY
 */
export const updateProperty = async (
  id: number,
  data: Partial<CreatePropertyPayload>
): Promise<PropertyResponse> => {
  const res = await axiosClient.put<PropertyResponse>(`/properties/${id}`, data);
  return res.data;
};

/**
 * DELETE PROPERTY
 */
export const deleteProperty = async (id: number): Promise<DeletePropertyResponse> => {
  const res = await axiosClient.delete<DeletePropertyResponse>(`/properties/${id}`);
  return res.data;
};