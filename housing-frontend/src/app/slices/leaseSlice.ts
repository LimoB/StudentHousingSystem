import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLeases,
  getMyLeases,
  getLeaseById,
  createLease,
  deleteLease,
  endLease,
  Lease,
  CreateLeasePayload,
} from "../../api/leases";

/* =========================
   STATE
========================= */

interface LeaseState {
  leases: Lease[];
  selectedLease: Lease | null;
  loading: boolean;
  error: string | null;
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

/* FETCH ALL LEASES */

export const fetchLeases = createAsyncThunk(
  "leases/fetchLeases",
  async (_, thunkAPI) => {
    try {
      return await getLeases();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch leases"
      );
    }
  }
);

/* FETCH MY LEASES */

export const fetchMyLeases = createAsyncThunk(
  "leases/fetchMyLeases",
  async (_, thunkAPI) => {
    try {
      return await getMyLeases();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch leases"
      );
    }
  }
);

/* FETCH LEASE BY ID */

export const fetchLeaseById = createAsyncThunk(
  "leases/fetchLeaseById",
  async (id: number, thunkAPI) => {
    try {
      return await getLeaseById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch lease"
      );
    }
  }
);

/* CREATE LEASE */

export const createLeaseAction = createAsyncThunk(
  "leases/createLease",
  async (payload: CreateLeasePayload, thunkAPI) => {
    try {
      return await createLease(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to create lease"
      );
    }
  }
);

/* DELETE LEASE */

export const deleteLeaseAction = createAsyncThunk(
  "leases/deleteLease",
  async (id: number, thunkAPI) => {
    try {
      await deleteLease(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to delete lease"
      );
    }
  }
);

/* END LEASE */

export const endLeaseAction = createAsyncThunk(
  "leases/endLease",
  async (id: number, thunkAPI) => {
    try {
      return await endLease(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to end lease"
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const leaseSlice = createSlice({
  name: "leases",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH LEASES */

      .addCase(fetchLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLeases.fulfilled, (state, action) => {
        state.loading = false;
        state.leases = action.payload;
      })

      .addCase(fetchLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH MY LEASES */

      .addCase(fetchMyLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyLeases.fulfilled, (state, action) => {
        state.loading = false;
        state.leases = action.payload;
      })

      .addCase(fetchMyLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH LEASE BY ID */

      .addCase(fetchLeaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLeaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLease = action.payload;
      })

      .addCase(fetchLeaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE LEASE */

      .addCase(createLeaseAction.fulfilled, (state, action) => {
        state.leases.push(action.payload);
      })

      /* END LEASE */

      .addCase(endLeaseAction.fulfilled, (state, action) => {
        const id = action.meta.arg;

        state.leases = state.leases.map((lease) =>
          lease.id === id
            ? { ...lease, status: "ended", endDate: new Date().toISOString() }
            : lease
        );

        if (state.selectedLease?.id === id) {
          state.selectedLease = {
            ...state.selectedLease,
            status: "ended",
            endDate: new Date().toISOString(),
          };
        }
      })

      /* DELETE LEASE */

      .addCase(deleteLeaseAction.fulfilled, (state, action) => {
        state.leases = state.leases.filter(
          (lease) => lease.id !== action.payload
        );

        if (state.selectedLease?.id === action.payload) {
          state.selectedLease = null;
        }
      });
  },
});

export default leaseSlice.reducer;