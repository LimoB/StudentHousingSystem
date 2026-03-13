import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Lease {
  id: number;
  studentId: number;
  unitId: number;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
}

export interface CreateLeasePayload {
  studentId?: number; // optional, backend might auto-assign
  unitId: number;
  startDate: string;
  endDate?: string;
}

/* =========================
   GET ALL LEASES (ADMIN / LANDLORD)
========================= */

export const getLeases = async () => {
  const res = await axiosClient.get("/leases");
  return res.data;
};

/* =========================
   GET MY LEASES (STUDENT)
========================= */

export const getMyLeases = async () => {
  const res = await axiosClient.get("/leases/my-leases");
  return res.data;
};

/* =========================
   GET LEASE BY ID
========================= */

export const getLeaseById = async (id: number) => {
  const res = await axiosClient.get(`/leases/${id}`);
  return res.data;
};

/* =========================
   CREATE LEASE (ADMIN / LANDLORD)
========================= */

export const createLease = async (data: CreateLeasePayload) => {
  const res = await axiosClient.post("/leases", data);
  return res.data;
};

/* =========================
   END LEASE
========================= */

export const endLease = async (id: number) => {
  const res = await axiosClient.put(`/leases/${id}/end`);
  return res.data;
};

/* =========================
   DELETE LEASE
========================= */

export const deleteLease = async (id: number) => {
  const res = await axiosClient.delete(`/leases/${id}`);
  return res.data;
};