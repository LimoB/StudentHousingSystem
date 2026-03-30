import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getUnits,
  getUnitsByProperty,
  createUnit,
  updateUnit,
  deleteUnit,
  Unit,
  CreateUnitPayload
} from "../../api/units";

/* =========================
   STATE
========================= */
interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const fetchUnits = createAsyncThunk(
  "units/fetchAll",
  async (_, thunkAPI) => {
    try {
      const data = await getUnits();
      console.log("📡 API Raw Response (fetchAll):", data); // DEBUG
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch units");
    }
  }
);

export const fetchUnitsByProperty = createAsyncThunk(
  "units/fetchByProperty",
  async (propertyId: number, thunkAPI) => {
    try {
      const data = await getUnitsByProperty(propertyId);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch property units");
    }
  }
);

export const createUnitAction = createAsyncThunk(
  "units/create",
  async (payload: CreateUnitPayload, thunkAPI) => {
    try {
      return await createUnit(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create unit");
    }
  }
);

export const updateUnitAction = createAsyncThunk(
  "units/update",
  async ({ id, data }: { id: number; data: Partial<CreateUnitPayload> }, thunkAPI) => {
    try {
      await updateUnit(id, data);
      return { id, updates: data }; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update unit");
    }
  }
);

export const deleteUnitAction = createAsyncThunk(
  "units/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteUnit(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete unit");
    }
  }
);

/* =========================
   SLICE
========================= */
const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    clearUnitError: (state) => {
      state.error = null;
    },
    resetUnits: (state) => {
      state.units = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // DEFENSIVE CHECK: Handle if backend sends { units: [...] } or just [...]
        const incomingData = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.units || []);
        
        console.log("✅ Slice processed units:", incomingData.length);
        state.units = incomingData;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnitsByProperty.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // DEFENSIVE CHECK
        const incomingUnits = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.units || []);

        const otherUnits = state.units.filter(
          (existing) => !incomingUnits.some((incoming: any) => incoming.id === existing.id)
        );
        state.units = [...otherUnits, ...incomingUnits];
      })
      .addCase(createUnitAction.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const newUnit = action.payload.unit || action.payload;
        if (newUnit) state.units.unshift(newUnit); 
      })
      .addCase(updateUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        state.units = state.units.map((u) =>
          u.id === id ? { ...u, ...updates } : u
        );
      })
      .addCase(deleteUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearUnitError, resetUnits } = unitSlice.actions;
export default unitSlice.reducer;