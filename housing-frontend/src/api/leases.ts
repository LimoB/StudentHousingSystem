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
  status: "active" | "ended" | string;
  createdAt: string;
  // Relational data from Drizzle
  student?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  unit?: {
    unitNumber: string;
    type: string;
    price: number;
    property?: {
      name: string;
      location: string;
    };
  };
}

export interface CreateLeasePayload {
  studentId: number;
  unitId: number;
  startDate: string;
  endDate?: string;
}

/* =========================
   API CALLS
========================= */

export const getLeases = async (): Promise<Lease[]> => {
  const res = await axiosClient.get<Lease[]>("/leases");
  return res.data;
};

export const getMyLeases = async (): Promise<Lease[]> => {
  const res = await axiosClient.get<Lease[]>("/leases/my-leases");
  return res.data;
};

export const getLeaseById = async (id: number): Promise<Lease> => {
  const res = await axiosClient.get<Lease>(`/leases/${id}`);
  return res.data;
};

// Backend returns { message: string, lease: Lease }
export const createLease = async (data: CreateLeasePayload): Promise<{ message: string; lease: Lease }> => {
  const res = await axiosClient.post("/leases", data);
  return res.data;
};

export const endLease = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.put(`/leases/${id}/end`);
  return res.data;
};

export const deleteLease = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.delete(`/leases/${id}`);
  return res.data;
};