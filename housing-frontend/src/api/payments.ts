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
  CheckoutRequestID: string; // Note: Big 'C' and 'R'
  ResponseCode: string;
  ResponseDescription: string;
}

// Added 'message' to the return type to fix the TS error in pollPaymentStatus
export interface PaymentStatusResponse {
  status: string;
  message?: string; 
  mpesaReceiptNumber?: string;
}

/* =========================
   API CALLS
========================= */

// INITIATE STK PUSH
export const initiateSTKPush = async (data: STKPushPayload): Promise<STKPushResponse> => {
  const res = await axiosClient.post("/payments/stkpush", data);
  // Backend returns { data: result }. 'result' is the STKPushResponse.
  return res.data.data; 
};

// CHECK PAYMENT STATUS
export const checkPaymentStatus = async (checkoutID: string): Promise<PaymentStatusResponse> => {
  const res = await axiosClient.get(`/payments/status/${checkoutID}`);
  return res.data;
};

// GET PAYMENTS
export const getPayments = async (): Promise<Payment[]> => {
  const res = await axiosClient.get("/payments");
  return res.data;
};

// GET PAYMENT BY ID
export const getPaymentById = async (id: number): Promise<Payment> => {
  const res = await axiosClient.get(`/payments/${id}`);
  return res.data;
};