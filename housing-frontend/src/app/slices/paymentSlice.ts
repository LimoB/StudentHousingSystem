import { createSlice, createAsyncThunk, PayloadAction, Action } from "@reduxjs/toolkit";
import { initiateSTKPush, checkPaymentStatus, getPayments, Payment, STKPushPayload } from "../../api/payments";

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

interface RejectedAction extends Action {
  payload: string;
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
export const startSTKPush = createAsyncThunk(
  "payments/startSTK",
  async (payload: STKPushPayload, thunkAPI) => {
    try {
      const response = await initiateSTKPush(payload);
      // Automatically trigger polling using the ID returned from Safaricom
      thunkAPI.dispatch(pollPaymentStatus(response.CheckoutRequestID));
      return response.CheckoutRequestID;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.error || "Failed to initiate payment");
    }
  }
);

// 2. Poll Status (Recursive Thunk with enhanced reliability)
export const pollPaymentStatus = createAsyncThunk(
  "payments/pollStatus",
  async (checkoutID: string, thunkAPI) => {
    const poll = async (resolve: any, reject: any, attempts = 0): Promise<void> => {
      // Allow for ~2 minutes (30 attempts * 4 seconds)
      if (attempts >= 30) {
        return reject("Payment timeout. Please check your M-Pesa app.");
      }

      try {
        const data = await checkPaymentStatus(checkoutID);
        const status = data.status?.toLowerCase();

        console.log(`[Polling Attempt ${attempts}] CheckoutID: ${checkoutID} | Status: ${status}`);

        if (status === "paid" || status === "success") {
          return resolve(data);
        } else if (status === "failed") {
          return reject("Payment was declined or cancelled.");
        } else {
          // Keep polling every 4 seconds
          setTimeout(() => poll(resolve, reject, attempts + 1), 4000);
        }
      } catch (err) {
        // If it's a 404 because the DB hasn't created the record yet, just retry
        setTimeout(() => poll(resolve, reject, attempts + 1), 4000);
      }
    };

    return new Promise((resolve, reject) => poll(resolve, reject));
  }
);

// 3. Fetch History (Backend filters this by student automatically)
export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getPayments();
    } catch (error: any) {
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
      /* STK PUSH INITIATION */
      .addCase(startSTKPush.pending, (state) => {
        state.currentTransaction.status = "pending";
        state.currentTransaction.error = null;
      })
      .addCase(startSTKPush.fulfilled, (state, action) => {
        state.currentTransaction.checkoutID = action.payload;
      })

      /* POLLING RESULTS */
      .addCase(pollPaymentStatus.fulfilled, (state) => {
        state.currentTransaction.status = "success";
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.currentTransaction.status = "failed";
        state.currentTransaction.error = action.payload as string;
      })

      /* FETCH HISTORY */
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTransaction } = paymentSlice.actions;
export default paymentSlice.reducer;