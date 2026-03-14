// src/app/slices/propertySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../api/properties";

/* =========================
   STATE
========================= */
interface PropertyState {
  properties: any[];
  selectedProperty: any | null; // added for property by ID
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

// Fetch all properties
export const fetchProperties = createAsyncThunk(
  "properties/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getProperties();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch properties");
    }
  }
);

// Fetch a single property by ID
export const fetchPropertyById = createAsyncThunk(
  "properties/fetchById",
  async (id: number, thunkAPI) => {
    try {
      return await getPropertyById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch property");
    }
  }
);

// Create a property
export const createPropertyAction = createAsyncThunk(
  "properties/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createProperty(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create property");
    }
  }
);

// Update a property
export const updatePropertyAction = createAsyncThunk(
  "properties/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      return await updateProperty(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update property");
    }
  }
);

// Delete a property
export const deletePropertyAction = createAsyncThunk(
  "properties/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteProperty(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete property");
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
      /* =========================
         FETCH ALL
      ========================== */
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

      /* =========================
         FETCH BY ID
      ========================== */
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.selectedProperty = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedProperty = null;
      })

      /* =========================
         CREATE
      ========================== */
      .addCase(createPropertyAction.fulfilled, (state, action) => {
        state.properties.push(action.payload.property);
      })

      /* =========================
         UPDATE
      ========================== */
      .addCase(updatePropertyAction.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.properties = state.properties.map((p) =>
          p.id === id ? { ...p, ...action.meta.arg.data } : p
        );
      })

      /* =========================
         DELETE
      ========================== */
      .addCase(deletePropertyAction.fulfilled, (state, action) => {
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export default propertySlice.reducer;