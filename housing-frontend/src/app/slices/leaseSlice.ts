import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLeases,
  getMyLeases,
  createLease,
  deleteLease,
  endLease,
} from "../../api/leases";

/* =========================
   STATE
========================= */

interface LeaseState {
  leases: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaseState = {
  leases: [],
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMyLeases = createAsyncThunk(
  "leases/fetchMyLeases",
  async (_, thunkAPI) => {
    try {
      return await getMyLeases();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createLeaseAction = createAsyncThunk(
  "leases/createLease",
  async (payload: any, thunkAPI) => {
    try {
      return await createLease(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const endLeaseAction = createAsyncThunk(
  "leases/endLease",
  async (id: number, thunkAPI) => {
    try {
      return await endLease(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      .addCase(fetchMyLeases.fulfilled, (state, action) => {
        state.leases = action.payload;
      })

      /* CREATE LEASE */
      .addCase(createLeaseAction.fulfilled, (state, action) => {
        state.leases.push(action.payload.lease);
      })

      /* END LEASE */
      .addCase(endLeaseAction.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.leases = state.leases.map((l) =>
          l.id === id ? { ...l, status: "ended" } : l
        );
      })

      /* DELETE LEASE */
      .addCase(deleteLeaseAction.fulfilled, (state, action) => {
        state.leases = state.leases.filter((l) => l.id !== action.payload);
      });
  },
});

export default leaseSlice.reducer;