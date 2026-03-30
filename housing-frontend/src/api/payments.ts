import axiosClient from "./axios";

/* =========================
   TYPES (Synced with Curl Output)
========================= */

export interface Payment {
  id: number;
  studentId: number;
  bookingId: number;
  amount: string; // Keep as string; M-Pesa returns "1.00"
  status: string; 
  phone: string;
  checkoutRequestID: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
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
        name?: string; 
        location: string;
        landlordId: number;
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

export interface PaymentStatusResponse {
  status: string;
  message?: string; 
  mpesaReceiptNumber?: string;
}

/* =========================
   API CALLS
========================= */

// 1. INITIATE STK PUSH
export const initiateSTKPush = async (data: STKPushPayload): Promise<STKPushResponse> => {
  const res = await axiosClient.post("/payments/stkpush", data);
  // Your controller sends { checkoutRequestID, data: result }
  // This extracts the nested 'result' which contains CheckoutRequestID
  return res.data.data || res.data; 
};

// 2. CHECK PAYMENT STATUS
export const checkPaymentStatus = async (checkoutID: string): Promise<PaymentStatusResponse> => {
  const res = await axiosClient.get(`/payments/status/${checkoutID}`);
  // Returns { status, message } or the full DB record
  return res.data;
};

// 3. GET ALL PAYMENTS (The Dashboard Source)
export const getPaymentsApi = async (): Promise<Payment[]> => {
  const res = await axiosClient.get("/payments");
  // If backend sends [ {...} ], return res.data. 
  // If backend sends { data: [...] }, return res.data.data.
  return Array.isArray(res.data) ? res.data : res.data.data || [];
};

// 4. GET BY ID
export const getPaymentById = async (id: number): Promise<Payment> => {
  const res = await axiosClient.get(`/payments/${id}`);
  return res.data;
};