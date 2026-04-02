import axiosClient from "./axios";

/* =========================
   TYPES
========================= */
export interface Unit {
  id: number;
  propertyId: number;
  unitNumber: string;
  price: number; 
  size: string;
  isAvailable: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    name: string;
    location: string;
    landlordId?: number; // Added to match your controller ownership checks
  };
}

/** * When using FormData, we typically treat the payload as 'any' or 'FormData' 
 * because everything (numbers, booleans) gets converted to strings 
 * during the append process.
 */
export interface CreateUnitPayload {
  propertyId: number;
  unitNumber: string;
  price: number; 
  size: string;
  isAvailable: boolean;
  image?: File | Blob | string | null; 
}

/* =========================
   API METHODS
========================= */

export const getUnits = async (): Promise<Unit[]> => {
  const res = await axiosClient.get<Unit[]>("/units");
  return res.data;
};

export const getUnitById = async (id: number): Promise<Unit> => {
  const res = await axiosClient.get<Unit>(`/units/${id}`);
  return res.data;
};

export const getUnitsByProperty = async (propertyId: number): Promise<Unit[]> => {
  const res = await axiosClient.get<Unit[]>(`/units/property/${propertyId}`);
  return res.data;
};

/**
 * CREATE UNIT
 * Handles FormData for multipart/form-data (image uploads)
 */
export const createUnit = async (data: FormData | CreateUnitPayload) => {
  const res = await axiosClient.post("/units", data, {
    headers: {
      // Axios will automatically set the correct boundary for FormData
      "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return res.data; 
};

/**
 * UPDATE UNIT
 * Handles FormData for updating units with optional new images
 */
export const updateUnit = async (id: number, data: FormData | Partial<CreateUnitPayload>) => {
  const res = await axiosClient.put(`/units/${id}`, data, {
    headers: {
      "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return res.data;
};

export const deleteUnit = async (id: number) => {
  const res = await axiosClient.delete(`/units/${id}`);
  return res.data;
};