import axiosClient from "./axios";

/* =========================
   TYPES
========================= */

export interface Payment {
  id: number;
  studentId: number;
  bookingId: number;
  amount: string;
  status: "pending" | "paid" | "failed";
  phone: string;
  checkoutRequestID: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  // Added nested relations for Landlord/Admin views
  student?: {
    fullName: string;
    email: string;
  };
  booking?: {
    id: number;
    status: string;
    unit?: {
      unitNumber: string;
      property?: {
        title: string;
        location: string;
      }
    }
  };
}

export interface STKPushPayload {
  phone: string;
  amount: number;
  bookingId: number;
  studentId: number;
}

export interface STKPushResponse {
  CustomerMessage: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

/* =========================
   API CALLS
========================= */

// INITIATE STK PUSH
export const initiateSTKPush = async (data: STKPushPayload): Promise<STKPushResponse> => {
  const res = await axiosClient.post("/payments/stkpush", data);
  // Matches backend: res.status(200).json({ ..., data: result })
  return res.data.data; 
};

// CHECK PAYMENT STATUS (For Polling)
export const checkPaymentStatus = async (checkoutID: string): Promise<{ status: string; mpesaReceiptNumber?: string }> => {
  const res = await axiosClient.get(`/payments/status/${checkoutID}`);
  return res.data;
};

// GET PAYMENTS (Now context-aware: Student gets theirs, Landlord gets their property payments)
export const getPayments = async (): Promise<Payment[]> => {
  const res = await axiosClient.get("/payments");
  return res.data;
};

// GET PAYMENT BY ID
export const getPaymentById = async (id: number): Promise<Payment> => {
  const res = await axiosClient.get(`/payments/${id}`);
  return res.data;
};