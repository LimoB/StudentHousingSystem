import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Lease {
  id: number;
  studentId?: number; // Optional because joined results might omit the raw ID
  unitId?: number;
  startDate: string;
  endDate?: string;
  status: "active" | "ended" | string;
  createdAt: string;
  // Nested relational data sent by the Service mapping
  student: {
    id: number;
    createdAt: any;
    fullName: string;
    email: string;
    phone?: string;
  };
  unit: {
    unitNumber: string;
    property: {
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
  status?: "active" | "ended";
}

/* =========================
   API CALLS
========================= */

// 1. ADMIN: Get all leases in the system
export const getLeases = async (): Promise<Lease[]> => {
  const res = await axiosClient.get<Lease[]>("/leases");
  return res.data;
};

// 2. LANDLORD: Get leases for their properties only
export const getLandlordLeases = async (): Promise<Lease[]> => {
  const res = await axiosClient.get<Lease[]>("/leases/landlord");
  return res.data;
};

// 3. STUDENT: Get their personal leases
export const getMyLeases = async (): Promise<Lease[]> => {
  const res = await axiosClient.get<Lease[]>("/leases/my-leases");
  return res.data;
};

// 4. COMMON: Get a specific lease by ID
export const getLeaseById = async (id: number): Promise<Lease> => {
  const res = await axiosClient.get<Lease>(`/leases/${id}`);
  return res.data;
};

// 5. CREATE: Backend returns { message: string, lease: Lease }
export const createLease = async (data: CreateLeasePayload): Promise<{ message: string; lease: Lease }> => {
  const res = await axiosClient.post("/leases", data);
  return res.data;
};

// 6. END: Marks lease as 'ended' and frees up the unit
export const endLease = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.put(`/leases/${id}/end`);
  return res.data;
};

// 7. DELETE: Permanent removal
export const deleteLease = async (id: number): Promise<{ message: string }> => {
  const res = await axiosClient.delete(`/leases/${id}`);
  return res.data;
};