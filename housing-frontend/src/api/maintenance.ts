import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface MaintenanceRequest {
  id: number;
  description: string;
  status: "pending" | "in-progress" | "resolved" | "cancelled";
  priority?: "low" | "medium" | "high";
  createdAt: string;
  // Nested Student Info
  student: {
    fullName: string;
    phone?: string;
    email?: string;
  };
  // Nested Unit & Property Info
  unit: {
    unitNumber: string;
    property: {
      name: string;
      location?: string;
    };
  };
}

export interface CreateMaintenancePayload {
  unitId: number;
  description: string;
  priority?: string;
}

/* =========================
   GET ALL REQUESTS (ADMIN / LANDLORD)
   Note: The backend now automatically filters 
   by landlordId if the user is a landlord.
========================= */

export const getMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  const res = await axiosClient.get("/maintenance");
  return res.data;
};

/* =========================
   GET MY REQUESTS (STUDENT)
========================= */

export const getMyMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  const res = await axiosClient.get("/maintenance/my-requests");
  return res.data;
};

/* =========================
   GET REQUEST BY ID
========================= */

export const getMaintenanceRequestById = async (id: number): Promise<MaintenanceRequest> => {
  const res = await axiosClient.get(`/maintenance/${id}`);
  return res.data;
};

/* =========================
   CREATE REQUEST (STUDENT)
========================= */

export const createMaintenanceRequest = async (data: CreateMaintenancePayload) => {
  const res = await axiosClient.post("/maintenance", data);
  return res.data;
};

/* =========================
   UPDATE STATUS (ADMIN / LANDLORD)
========================= */

export const updateMaintenanceStatus = async (id: number, status: string) => {
  const res = await axiosClient.put(`/maintenance/${id}/status`, { status });
  return res.data;
};

/* =========================
   DELETE REQUEST (ADMIN / LANDLORD)
========================= */

export const deleteMaintenanceRequest = async (id: number) => {
  const res = await axiosClient.delete(`/maintenance/${id}`);
  return res.data;
};