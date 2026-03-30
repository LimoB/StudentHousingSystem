import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  initiateSTKPush, 
  checkPaymentStatus, 
  getPayments, 
  Payment, 
  STKPushPayload 
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

// 1. Start the Payment
export const startSTKPush = createAsyncThunk<
  string, 
  STKPushPayload, 
  { rejectValue: string }
>(
  "payments/startSTK",
  async (payload, thunkAPI) => {
    try {
      const response = await initiateSTKPush(payload);
      // Automatically trigger polling
      thunkAPI.dispatch(pollPaymentStatus(response.CheckoutRequestID));
      return response.CheckoutRequestID;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to initiate payment";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// 2. Poll Status (Standardized Recursive Logic)
export const pollPaymentStatus = createAsyncThunk<
  { status: string; mpesaReceiptNumber?: string }, 
  string,                                          
  { rejectValue: string }                          
>(
  "payments/pollStatus",
  async (checkoutID, thunkAPI) => {
    const maxAttempts = 30; 
    let attempts = 0;

    try {
      // Return the result of the promise to the thunk
      return await new Promise<{ status: string; mpesaReceiptNumber?: string }>((resolve, reject) => {
        const interval = setInterval(async () => {
          attempts++;
          
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            return reject("Payment timeout. If you paid, it will reflect shortly.");
          }

          try {
            const data = await checkPaymentStatus(checkoutID);
            const status = data.status?.toLowerCase();

            if (status === "paid" || status === "success") {
              clearInterval(interval);
              thunkAPI.dispatch(fetchAllPayments());
              return resolve(data);
            } else if (status === "failed") {
              clearInterval(interval);
              return reject("Transaction was cancelled or failed.");
            }
          } catch {
            // Error variable omitted to satisfy ESLint no-unused-vars
            console.log("Polling for payment status...");
          }
        }, 4000);
      });
    } catch (error) {
      // Map the promise rejection to Redux's rejectWithValue
      return thunkAPI.rejectWithValue(error as string);
    }
  }
);

// 3. Fetch History
export const fetchAllPayments = createAsyncThunk<
  Payment[],
  void,
  { rejectValue: string }
>(
  "payments/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getPayments();
    } catch {
      return thunkAPI.rejectWithValue("Failed to fetch payment history");
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
        state.currentTransaction.error = action.payload || "Polling failed";
      })

      /* HISTORY */
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load history";
      });
  },
});

export const { resetTransaction } = paymentSlice.actions;
export default paymentSlice.reducer;