import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

// Fetches all (Admin) or filtered (Landlord) requests
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

// Student view
export const fetchMyMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await getMyMaintenanceRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch your requests"
      );
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  "maintenance/fetchById",
  async (id: number, thunkAPI) => {
    try {
      return await getMaintenanceRequestById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch request details"
      );
    }
  }
);

export const createMaintenanceRequestAction = createAsyncThunk(
  "maintenance/create",
  async (payload: CreateMaintenancePayload, thunkAPI) => {
    try {
      return await createMaintenanceRequest(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to submit request"
      );
    }
  }
);

export const updateMaintenanceStatusAction = createAsyncThunk(
  "maintenance/updateStatus",
  async ({ id, status }: { id: number; status: string }, thunkAPI) => {
    try {
      await updateMaintenanceStatus(id, status);
      return { id, status };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to update status"
      );
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
  reducers: {
    clearMaintenanceError: (state) => {
      state.error = null;
    },
    setSelectedRequest: (state, action: PayloadAction<MaintenanceRequest | null>) => {
      state.selectedRequest = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      /* FETCH ALL/LANDLORD REQUESTS */
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

      /* FETCH MY REQUESTS (STUDENT) */
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

      /* FETCH BY ID */
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload;
      })

      /* CREATE */
      .addCase(createMaintenanceRequestAction.fulfilled, (state, action) => {
        // action.payload is the new request from the server
        state.requests.unshift(action.payload); 
      })

      /* UPDATE STATUS */
      .addCase(updateMaintenanceStatusAction.fulfilled, (state, action) => {
        const { id, status } = action.payload;

        state.requests = state.requests.map((req) =>
          req.id === id ? { ...req, status: status as any } : req
        );

        if (state.selectedRequest?.id === id) {
          state.selectedRequest.status = status as any;
        }
      })

      /* DELETE */
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

export const { clearMaintenanceError, setSelectedRequest } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;