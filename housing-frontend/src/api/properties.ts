import axiosClient from "./axios";
import { Unit } from "./units";

/* =========================
   TYPES
========================= */

export interface Property {
  id: number;
  name: string;
  location: string;
  description: string | null;
  landlordId: number; 
  status: "available" | "occupied" | "maintenance" | null;
  
  // --- Cloudinary Fields ---
  imageUrl: string | null;
  imagePublicId: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  units?: Unit[]; 
  
  _count?: {
    units: number;
  };
}

/**
 * Payload Interface
 * image: File (for new uploads) | string (if sending a URL) | null
 */
export interface CreatePropertyPayload {
  name: string;
  location: string;
  description?: string;
  status?: "available" | "occupied" | "maintenance";
  image?: File | string | null; 
}

export interface PropertyResponse {
  message: string;
  property: Property;
}

export interface DeletePropertyResponse {
  message: string;
}

/* =========================
   HELPER: CONVERT TO FORMDATA
   Critical for Multer/Binary support
========================= */
const prepareFormData = (data: Partial<CreatePropertyPayload>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    // 1. Skip undefined values (don't send them)
    if (value === undefined) return;

    // 2. Handle the Image specifically
    if (key === 'image') {
      if (value instanceof File) {
        formData.append('image', value);
      }
      // If image is a string (existing URL) or null, we usually don't 
      // append it to FormData unless the backend expects a 'clear' command.
      return;
    }

    // 3. Handle standard fields (Strings/Numbers/Nulls)
    if (value === null) {
      formData.append(key, ""); // Send empty string for null to clear fields
    } else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

/* =========================
   API FUNCTIONS
========================= */

/**
 * GET ALL PROPERTIES
 */
export const getProperties = async (): Promise<Property[]> => {
  const res = await axiosClient.get<Property[]>("/properties");
  return res.data;
};

/**
 * GET SINGLE PROPERTY
 */
export const getPropertyById = async (id: number): Promise<Property> => {
  const res = await axiosClient.get<Property>(`/properties/${id}`);
  return res.data;
};

/**
 * CREATE PROPERTY
 * Content-Type is automatically handled by the browser when passing FormData,
 * but explicitly setting it is fine.
 */
export const createProperty = async (data: CreatePropertyPayload): Promise<PropertyResponse> => {
  const formData = prepareFormData(data);
  const res = await axiosClient.post<PropertyResponse>("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * UPDATE PROPERTY
 * Uses PUT with FormData to allow updating descriptions/names OR the image itself.
 */
export const updateProperty = async (
  id: number,
  data: Partial<CreatePropertyPayload>
): Promise<PropertyResponse> => {
  const formData = prepareFormData(data);
  
  // LOG FOR DEBUGGING: Ensure 'id' is correct and formData isn't empty
  console.log(`[API] Patching Property ${id}...`);

  const res = await axiosClient.put<PropertyResponse>(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * DELETE PROPERTY
 */
export const deleteProperty = async (id: number): Promise<DeletePropertyResponse> => {
  const res = await axiosClient.delete<DeletePropertyResponse>(`/properties/${id}`);
  return res.data;
};