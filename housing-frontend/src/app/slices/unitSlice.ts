/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUnits,
  getUnitsByProperty,
  createUnit,
  updateUnit,
  deleteUnit,
  Unit,
  CreateUnitPayload
} from "../../api/units";
import { RootState } from "../../app/store";

/* =========================
   STATE
========================= */
interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; 
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
  lastFetched: null,
};

/* =========================
   THUNKS
========================= */

/**
 * FETCH ALL UNITS
 */
export const fetchUnits = createAsyncThunk<
  Unit[], 
  void, 
  { state: RootState; rejectValue: string }
>(
  "units/fetchAll",
  async (_, thunkAPI) => {
    try {
      const data = await getUnits();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch units");
    }
  },
  {
    condition: (_, { getState }) => {
      const { units } = getState() as RootState;
      const isRecentlyFetched = units.lastFetched && Date.now() - units.lastFetched < 2000;
      if (units.loading || isRecentlyFetched) return false;
    },
  }
);

/**
 * FETCH UNITS BY PROPERTY
 */
export const fetchUnitsByProperty = createAsyncThunk<
  Unit[], 
  number, 
  { state: RootState; rejectValue: string }
>(
  "units/fetchByProperty",
  async (propertyId: number, thunkAPI) => {
    try {
      return await getUnitsByProperty(propertyId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch property units");
    }
  }
);

/**
 * CREATE UNIT ACTION
 * Accepts FormData for multipart/form-data support
 */
export const createUnitAction = createAsyncThunk<Unit, any, { rejectValue: string }>(
  "units/create",
  async (payload, thunkAPI) => {
    try {
      const response = await createUnit(payload);
      
      // Robust extraction: Backend should now return the object directly
      const unitData = response?.data?.unit || response?.unit || response?.data || response;
      
      if (!unitData || (!unitData.id && !unitData.unitNumber)) {
        throw new Error("Server returned an invalid unit format");
      }
      return unitData;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Failed to create unit");
    }
  }
);

/**
 * UPDATE UNIT ACTION
 * Matches the updated controller returning the full unit object
 */
export const updateUnitAction = createAsyncThunk<
  Unit, 
  { id: number; data: any }, 
  { rejectValue: string }
>(
  "units/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateUnit(id, data);
      
      // Since backend was fixed to return the object, we extract it here
      const unitData = response?.data?.unit || response?.unit || response?.data || response;

      // Validation check to prevent "Server Error" toast on malformed response
      if (!unitData || (typeof unitData !== 'object') || !unitData.id) {
        console.error("[Redux Error] Expected Unit Object, got:", unitData);
        throw new Error("Update failed: Invalid server response format");
      }
      
      return unitData;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Failed to update unit");
    }
  }
);

/**
 * DELETE UNIT ACTION
 */
export const deleteUnitAction = createAsyncThunk<number, number, { rejectValue: string }>(
  "units/delete",
  async (id, thunkAPI) => {
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
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE UNIT */
      .addCase(createUnitAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.units.find(u => u.id === action.payload.id);
        if (!exists) {
          state.units.unshift(action.payload);
        }
      })
      .addCase(createUnitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE UNIT */
      .addCase(updateUnitAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUnit = action.payload;
        const index = state.units.findIndex((u) => u.id === updatedUnit.id);
        if (index !== -1) {
          // Merge logic preserves fields not returned by partial update (like property info)
          state.units[index] = { ...state.units[index], ...updatedUnit };
        }
      })
      .addCase(updateUnitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* DELETE UNIT */
      .addCase(deleteUnitAction.fulfilled, (state, action) => {
        state.units = state.units.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearUnitError, resetUnits } = unitSlice.actions;
export default unitSlice.reducer;