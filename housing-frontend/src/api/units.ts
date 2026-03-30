import axiosClient from "./axios";

/* =========================
   TYPES (Strictly matching Schema)
========================= */
/* =========================
   TYPES
========================= */
export interface Unit {
  id: number;
  propertyId: number;
  unitNumber: string;
  price: string | number; // Allow both to fix the assignment error
  size: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  property?: {
    name: string;
    location: string;
  };
}

export interface CreateUnitPayload {
  propertyId: number;
  unitNumber: string;
  price: number; // Form sends number
  size: string;
  isAvailable: boolean;
}

/* =========================
   API METHODS
========================= */

export const getUnits = async (): Promise<Unit[]> => {
  const res = await axiosClient.get("/units");
  return res.data;
};

export const getUnitById = async (id: number): Promise<Unit> => {
  const res = await axiosClient.get(`/units/${id}`);
  return res.data;
};

export const getUnitsByProperty = async (propertyId: number): Promise<Unit[]> => {
  const res = await axiosClient.get(`/units/property/${propertyId}`);
  return res.data;
};

export const createUnit = async (data: CreateUnitPayload) => {
  const res = await axiosClient.post("/units", data);
  return res.data; 
};

export const updateUnit = async (id: number, data: Partial<CreateUnitPayload>) => {
  const res = await axiosClient.put(`/units/${id}`, data);
  return res.data;
};

export const deleteUnit = async (id: number) => {
  const res = await axiosClient.delete(`/units/${id}`);
  return res.data;
};