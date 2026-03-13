// src/app/slices/propertySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../api/properties";

/* =========================
   STATE
========================= */
interface PropertyState {
  properties: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */
export const fetchProperties = createAsyncThunk(
  "properties/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getProperties();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createPropertyAction = createAsyncThunk(
  "properties/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createProperty(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updatePropertyAction = createAsyncThunk(
  "properties/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      return await updateProperty(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deletePropertyAction = createAsyncThunk(
  "properties/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteProperty(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

/* =========================
   SLICE
========================= */
const propertySlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE */
      .addCase(createPropertyAction.fulfilled, (state, action) => {
        state.properties.push(action.payload.property);
      })

      /* UPDATE */
      .addCase(updatePropertyAction.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.properties = state.properties.map((p) =>
          p.id === id ? { ...p, ...action.meta.arg.data } : p
        );
      })

      /* DELETE */
      .addCase(deletePropertyAction.fulfilled, (state, action) => {
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export default propertySlice.reducer;