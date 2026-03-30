import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  initiateSTKPush, 
  checkPaymentStatus, 
  getPaymentsApi,
  STKPushPayload,
  PaymentStatusResponse,
  Payment
} from "../../api/payments";

interface PaymentState {
  payments: Payment[];
  currentTransaction: {
    checkoutID: string | null;
    status: "idle" | "pending" | "success" | "failed";
    error: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  currentTransaction: {
    checkoutID: null,
    status: "idle",
    error: null,
  },
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

// 1. Start STK Push & Trigger Polling
export const startSTKPush = createAsyncThunk<string, STKPushPayload, { rejectValue: string }>(
  "payments/startSTK",
  async (payload, thunkAPI) => {
    try {
      const response = await initiateSTKPush(payload);
      // Ensure we use the correct key from your controller response
      const checkoutID = response.CheckoutRequestID || (response as any).checkoutRequestID;
      
      thunkAPI.dispatch(pollPaymentStatus(checkoutID));
      return checkoutID;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to initiate payment";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// 2. Recursive Polling Logic
export const pollPaymentStatus = createAsyncThunk<PaymentStatusResponse, string, { rejectValue: string }>(
  "payments/pollStatus",
  async (checkoutID, thunkAPI) => {
    const maxAttempts = 25; 
    let attempts = 0;

    return new Promise<PaymentStatusResponse>((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject("Payment timeout. Please check your transaction history.");
          return;
        }

        try {
          const data = await checkPaymentStatus(checkoutID);
          const normalizedStatus = data.status?.toLowerCase();

          if (["paid", "success", "completed"].includes(normalizedStatus)) {
            clearInterval(interval);
            thunkAPI.dispatch(fetchAllPayments()); // Refresh table data
            resolve(data);
          } 
          else if (["failed", "cancelled"].includes(normalizedStatus)) {
            clearInterval(interval);
            reject(data.message || "Transaction was declined.");
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.warn("Polling attempt failed, retrying...");
        }
      }, 4000); 
    });
  }
);

// 3. Fetch History (Landlord/Student/Admin)
export const fetchAllPayments = createAsyncThunk<Payment[], void, { rejectValue: string }>(
  "payments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getPaymentsApi();
      /**
       * CRITICAL: Some Axios configurations return the raw data, 
       * others return the full response object. This check handles both.
       */
      const data = Array.isArray(response) ? response : (response as any).data;
      return data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to load payment records";
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

/* =========================
   SLICE
========================= */

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    resetTransaction: (state) => {
      state.currentTransaction = initialState.currentTransaction;
    },
    clearPayments: (state) => {
      state.payments = [];
    }
  },
  extraReducers: (builder) => {
    builder
      /* STK PUSH */
      .addCase(startSTKPush.pending, (state) => {
        state.currentTransaction.status = "pending";
        state.currentTransaction.error = null;
      })
      .addCase(startSTKPush.fulfilled, (state, action) => {
        state.currentTransaction.checkoutID = action.payload;
      })
      .addCase(startSTKPush.rejected, (state, action) => {
        state.currentTransaction.status = "failed";
        state.currentTransaction.error = action.payload || "Failed to start";
      })

      /* POLLING */
      .addCase(pollPaymentStatus.fulfilled, (state) => {
        state.currentTransaction.status = "success";
        state.currentTransaction.error = null;
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.currentTransaction.status = "failed";
        state.currentTransaction.error = action.payload || "Transaction failed";
      })

      /* HISTORY LIST */
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        // Ensure we are saving an array
        state.payments = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
        console.log("✅ Redux Store Updated with", state.payments.length, "payments");
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching history";
      });
  },
});

export const { resetTransaction, clearPayments } = paymentSlice.actions;
export default paymentSlice.reducer;