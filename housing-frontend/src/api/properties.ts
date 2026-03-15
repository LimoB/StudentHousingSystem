import axiosClient from "./axios";

/* =========================
   TYPES
========================= */
export interface Property {
  updatedAt: string | null;
  id: number;
  name: string;
  location: string;
  description: string | null;
  landlordId: number;
  status: "available" | "occupied" | null;
  createdAt: string | null;
}

export interface CreatePropertyPayload {
  name: string;
  location: string;
  description?: string;
  landlordId?: number;
  status?: "available" | "occupied";
}

/* =========================
   API FUNCTIONS
========================= */
export const getProperties = async (): Promise<Property[]> => {
  console.log("API: getProperties");
  const res = await axiosClient.get("/properties");
  return res.data;
};

export const getPropertyById = async (id: number): Promise<Property> => {
  console.log("API: getPropertyById", id);
  const res = await axiosClient.get(`/properties/${id}`);
  return res.data;
};

export const createProperty = async (data: CreatePropertyPayload) => {
  console.log("API: createProperty", data);
  const res = await axiosClient.post("/properties", data);
  return res.data;
};

export const updateProperty = async (
  id: number,
  data: Partial<CreatePropertyPayload>
) => {
  console.log("API: updateProperty", id, data);
  const res = await axiosClient.put(`/properties/${id}`, data);
  return res.data;
};

export const deleteProperty = async (id: number) => {
  console.log("API: deleteProperty", id);
  const res = await axiosClient.delete(`/properties/${id}`);
  return res.data;
};