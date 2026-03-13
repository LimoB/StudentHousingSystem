// src/app/slices/unitSlice.ts
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUnitsByProperty = createAsyncThunk(
  "units/fetchByProperty",
  async (propertyId: number, thunkAPI) => {
    try {
      return await getUnitsByProperty(propertyId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createUnitAction = createAsyncThunk(
  "units/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createUnit(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateUnitAction = createAsyncThunk(
  "units/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      return await updateUnit(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

/* =========================
   SLICE
========================= */
const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
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
      .addCase(fetchUnitsByProperty.fulfilled, (state, action) => {
        state.units = action.payload;
      })

      /* CREATE */
      .addCase(createUnitAction.fulfilled, (state, action) => {
        state.units.push(action.payload.unit);
      })

      /* UPDATE */
      .addCase(updateUnitAction.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.units = state.units.map((u) =>
          u.id === id ? { ...u, ...action.meta.arg.data } : u
        );
      })

      /* DELETE */
      .addCase(deleteUnitAction.fulfilled, (state, action) => {
        state.units = state.units.filter((u) => u.id !== action.payload);
      });
  },
});

export default unitSlice.reducer;