import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
  MaintenanceRequest,
  CreateMaintenancePayload,
} from "../../api/maintenance";

/* =========================
   STATE
========================= */

interface MaintenanceState {
  requests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;
  loading: boolean;
  error: string | null;
}

const initialState: MaintenanceState = {
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

/* FETCH ALL REQUESTS */

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getMaintenanceRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch maintenance requests"
      );
    }
  }
);

/* FETCH MY REQUESTS */

export const fetchMyMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await getMyMaintenanceRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch maintenance requests"
      );
    }
  }
);

/* FETCH REQUEST BY ID */

export const fetchRequestById = createAsyncThunk(
  "maintenance/fetchById",
  async (id: number, thunkAPI) => {
    try {
      return await getMaintenanceRequestById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch request"
      );
    }
  }
);

/* CREATE REQUEST */

export const createMaintenanceRequestAction = createAsyncThunk(
  "maintenance/create",
  async (payload: CreateMaintenancePayload, thunkAPI) => {
    try {
      return await createMaintenanceRequest(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to create request"
      );
    }
  }
);

/* UPDATE STATUS */

export const updateMaintenanceStatusAction = createAsyncThunk(
  "maintenance/updateStatus",
  async ({ id, status }: { id: number; status: string }, thunkAPI) => {
    try {
      return await updateMaintenanceStatus(id, status);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to update status"
      );
    }
  }
);

/* DELETE REQUEST */

export const deleteMaintenanceRequestAction = createAsyncThunk(
  "maintenance/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteMaintenanceRequest(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to delete request"
      );
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

      /* FETCH ALL REQUESTS */

      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
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

      .addCase(fetchMyMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })

      .addCase(fetchMyMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH REQUEST BY ID */

      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload;
      })

      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE REQUEST */

      .addCase(createMaintenanceRequestAction.fulfilled, (state, action) => {
        state.requests.push(action.payload);
      })

      /* UPDATE STATUS */

      .addCase(updateMaintenanceStatusAction.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;

        state.requests = state.requests.map((req) =>
          req.id === id ? { ...req, status } : req
        );

        if (state.selectedRequest?.id === id) {
          state.selectedRequest = {
            ...state.selectedRequest,
            status,
          };
        }
      })

      /* DELETE REQUEST */

      .addCase(deleteMaintenanceRequestAction.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (req) => req.id !== action.payload
        );

        if (state.selectedRequest?.id === action.payload) {
          state.selectedRequest = null;
        }
      });
  },
});

export default maintenanceSlice.reducer;