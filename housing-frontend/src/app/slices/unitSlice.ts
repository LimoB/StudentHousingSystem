import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUnits,
  getUnitsByProperty,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../api/units";

/* =========================
   STATE
========================= */
interface UnitState {
  units: any[];
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
      return await getUnits();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch units");
    }
  }
);

export const fetchUnitsByProperty = createAsyncThunk(
  "units/fetchByProperty",
  async (propertyId: number, thunkAPI) => {
    try {
      return await getUnitsByProperty(propertyId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch property units");
    }
  }
);

export const createUnitAction = createAsyncThunk(
  "units/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createUnit(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create unit");
    }
  }
);

export const updateUnitAction = createAsyncThunk(
  "units/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      return await updateUnit(id, data);
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
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH BY PROPERTY */
      .addCase(fetchUnitsByProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitsByProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnitsByProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE */
      .addCase(createUnitAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        // Adjusting based on common API response structures
        const newUnit = action.payload.unit || action.payload;
        state.units.push(newUnit);
      })
      .addCase(createUnitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE */
      .addCase(updateUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUnit = action.payload.unit || action.payload;
        state.units = state.units.map((u) =>
          u.id === updatedUnit.id ? updatedUnit : u
        );
      })

      /* DELETE */
      .addCase(deleteUnitAction.fulfilled, (state, action) => {
        state.loading = false;
        state.units = state.units.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUnitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUnitError } = unitSlice.actions;
export default unitSlice.reducer;