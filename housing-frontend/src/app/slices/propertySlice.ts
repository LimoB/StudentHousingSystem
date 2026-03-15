// src/app/slices/propertySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  Property,
  CreatePropertyPayload,
} from "../../api/properties";

/* =========================
   STATE
========================= */
interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
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
export const fetchProperties = createAsyncThunk<
  Property[],
  void,
  { rejectValue: string }
>("properties/fetchAll", async (_, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No auth token, please login");

  try {
    const result = await getProperties();
    console.log("✅ Fetched all properties:", result.length);
    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch properties:", error.message);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch properties"
    );
  }
});

// Fetch property by ID
export const fetchPropertyById = createAsyncThunk<
  Property,
  number,
  { rejectValue: string }
>("properties/fetchById", async (id, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No auth token, please login");

  try {
    const result = await getPropertyById(id);
    console.log("✅ Fetched property by ID:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch property:", error.message);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch property"
    );
  }
});

// Create property
export const createPropertyAction = createAsyncThunk<
  Property,
  CreatePropertyPayload,
  { rejectValue: string }
>("properties/create", async (payload, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No auth token, please login");

  try {
    const result = await createProperty(payload);
    console.log("✅ Created property:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Failed to create property:", error.message);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to create property"
    );
  }
});

// Update property
export const updatePropertyAction = createAsyncThunk<
  Property,
  { id: number; data: Partial<CreatePropertyPayload> },
  { rejectValue: string }
>("properties/update", async ({ id, data }, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No auth token, please login");

  try {
    const result = await updateProperty(id, data);
    console.log("✅ Updated property:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Failed to update property:", error.message);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to update property"
    );
  }
});

// Delete property
export const deletePropertyAction = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("properties/delete", async (id, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No auth token, please login");

  try {
    await deleteProperty(id);
    console.log("✅ Deleted property:", id);
    return id;
  } catch (error: any) {
    console.error("❌ Failed to delete property:", error.message);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to delete property"
    );
  }
});

/* =========================
   SLICE
========================= */
const propertySlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch properties";
      })

      // FETCH BY ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.selectedProperty = null;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.selectedProperty = null;
        state.error = action.payload || "Failed to fetch property";
      })

      // CREATE
      .addCase(createPropertyAction.fulfilled, (state, action) => {
        if (action.payload) {
          state.properties.push(action.payload);
        }
      })

      // UPDATE
      .addCase(updatePropertyAction.fulfilled, (state, action) => {
        const updated = action.payload;
        state.properties = state.properties.map((p) =>
          p.id === updated.id ? { ...p, ...updated } : p
        );
      })

      // DELETE
      .addCase(deletePropertyAction.fulfilled, (state, action) => {
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export default propertySlice.reducer;