// src/api/units.ts
import axiosClient from "./axios";

/* =========================
   TYPES
========================= */
export interface Unit {
  id: number;
  name: string;
  propertyId: number;
  size: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitPayload {
  name: string;
  propertyId: number;
  size: string;
  status: string;
}

/* =========================
   GET ALL UNITS
========================= */
export const getUnits = async () => {
  const res = await axiosClient.get("/units");
  return res.data;
};

/* =========================
   GET UNIT BY ID
========================= */
export const getUnitById = async (id: number) => {
  const res = await axiosClient.get(`/units/${id}`);
  return res.data;
};

/* =========================
   GET UNITS BY PROPERTY
========================= */
export const getUnitsByProperty = async (propertyId: number) => {
  const res = await axiosClient.get(`/units/property/${propertyId}`);
  return res.data;
};

/* =========================
   CREATE UNIT
========================= */
export const createUnit = async (data: CreateUnitPayload) => {
  const res = await axiosClient.post("/units", data);
  return res.data;
};

/* =========================
   UPDATE UNIT
========================= */
export const updateUnit = async (id: number, data: Partial<CreateUnitPayload>) => {
  const res = await axiosClient.put(`/units/${id}`, data);
  return res.data;
};

/* =========================
   DELETE UNIT
========================= */
export const deleteUnit = async (id: number) => {
  const res = await axiosClient.delete(`/units/${id}`);
  return res.data;
};