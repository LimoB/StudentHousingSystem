import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
} from "../../api/maintenance";

/* =========================
   STATE
========================= */

interface MaintenanceState {
  requests: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MaintenanceState = {
  requests: [],
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getMaintenanceRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMyMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await getMyMaintenanceRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createMaintenanceRequestAction = createAsyncThunk(
  "maintenance/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createMaintenanceRequest(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateMaintenanceStatusAction = createAsyncThunk(
  "maintenance/updateStatus",
  async ({ id, status }: { id: number; status: string }, thunkAPI) => {
    try {
      return await updateMaintenanceStatus(id, status);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteMaintenanceRequestAction = createAsyncThunk(
  "maintenance/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteMaintenanceRequest(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

/* =========================
   SLICE
========================= */

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH MY REQUESTS */
      .addCase(fetchMyMaintenanceRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })

      /* CREATE REQUEST */
      .addCase(createMaintenanceRequestAction.fulfilled, (state, action) => {
        state.requests.push(action.payload.request);
      })

      /* UPDATE STATUS */
      .addCase(updateMaintenanceStatusAction.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.requests = state.requests.map((r) =>
          r.id === id ? { ...r, status: action.meta.arg.status } : r
        );
      })

      /* DELETE REQUEST */
      .addCase(deleteMaintenanceRequestAction.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      });
  },
});

export default maintenanceSlice.reducer;