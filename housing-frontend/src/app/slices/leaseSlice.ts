import { createSlice, createAsyncThunk, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  getLeases,
  getMyLeases,
  getLeaseById,
  createLease,
  deleteLease,
  endLease,
} from "../../api/leases";
import type { Lease, CreateLeasePayload } from "../../api/leases";

/* =========================
   STATE & HELPER TYPES
========================= */

interface LeaseState {
  leases: Lease[];
  selectedLease: Lease | null;
  loading: boolean;
  error: string | null;
}

interface RejectedAction extends Action {
  payload: string;
}

const initialState: LeaseState = {
  leases: [],
  selectedLease: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const fetchLeases = createAsyncThunk(
  "leases/fetchLeases",
  async (_, thunkAPI) => {
    try {
      return await getLeases();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch leases");
    }
  }
);

export const fetchMyLeases = createAsyncThunk(
  "leases/fetchMyLeases",
  async (_, thunkAPI) => {
    try {
      return await getMyLeases();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch your leases");
    }
  }
);

export const fetchLeaseById = createAsyncThunk(
  "leases/fetchLeaseById",
  async (id: number, thunkAPI) => {
    try {
      return await getLeaseById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch lease details");
    }
  }
);

export const createLeaseAction = createAsyncThunk(
  "leases/createLease",
  async (payload: CreateLeasePayload, thunkAPI) => {
    try {
      const response = await createLease(payload);
      return response.lease; // Return only the lease object
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to create lease");
    }
  }
);

export const endLeaseAction = createAsyncThunk(
  "leases/endLease",
  async (id: number, thunkAPI) => {
    try {
      await endLease(id);
      return id; // Return ID to update local state
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to end lease");
    }
  }
);

export const deleteLeaseAction = createAsyncThunk(
  "leases/deleteLease",
  async (id: number, thunkAPI) => {
    try {
      await deleteLease(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to delete lease");
    }
  }
);

/* =========================
   SLICE
========================= */

const leaseSlice = createSlice({
  name: "leases",
  initialState,
  reducers: {
    clearSelectedLease: (state) => {
      state.selectedLease = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* 1. SPECIFIC CASES */

      // FETCH ALL / MY LEASES
      .addCase(fetchLeases.fulfilled, (state, action: PayloadAction<Lease[]>) => {
        state.loading = false;
        state.leases = action.payload;
      })
      .addCase(fetchMyLeases.fulfilled, (state, action: PayloadAction<Lease[]>) => {
        state.loading = false;
        state.leases = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchLeaseById.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        state.selectedLease = action.payload;
      })

      // CREATE LEASE
      .addCase(createLeaseAction.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        state.leases.unshift(action.payload);
      })

      // END LEASE
      .addCase(endLeaseAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const id = action.payload;
        const now = new Date().toISOString();

        state.leases = state.leases.map((lease) =>
          lease.id === id ? { ...lease, status: "ended", endDate: now } : lease
        );

        if (state.selectedLease?.id === id) {
          state.selectedLease = { ...state.selectedLease, status: "ended", endDate: now };
        }
      })

      // DELETE LEASE
      .addCase(deleteLeaseAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.leases = state.leases.filter((l) => l.id !== action.payload);
        if (state.selectedLease?.id === action.payload) {
          state.selectedLease = null;
        }
      })

      /* 2. MATCHERS (Ordering matters!) */

      .addMatcher(
        (action): action is Action => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is RejectedAction => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { clearSelectedLease } = leaseSlice.actions;
export default leaseSlice.reducer;