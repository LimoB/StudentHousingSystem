// src/api/properties.ts
import axiosClient from "./axios";

/* =========================
   TYPES
========================= */
export interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyPayload {
  name: string;
  location: string;
  description: string;
}

/* =========================
   GET ALL PROPERTIES
========================= */
export const getProperties = async () => {
  const res = await axiosClient.get("/properties");
  return res.data;
};

/* =========================
   GET PROPERTY BY ID
========================= */
export const getPropertyById = async (id: number) => {
  const res = await axiosClient.get(`/properties/${id}`);
  return res.data;
};

/* =========================
   CREATE PROPERTY
========================= */
export const createProperty = async (data: CreatePropertyPayload) => {
  const res = await axiosClient.post("/properties", data);
  return res.data;
};

/* =========================
   UPDATE PROPERTY
========================= */
export const updateProperty = async (id: number, data: Partial<CreatePropertyPayload>) => {
  const res = await axiosClient.put(`/properties/${id}`, data);
  return res.data;
};

/* =========================
   DELETE PROPERTY
========================= */
export const deleteProperty = async (id: number) => {
  const res = await axiosClient.delete(`/properties/${id}`);
  return res.data;
};