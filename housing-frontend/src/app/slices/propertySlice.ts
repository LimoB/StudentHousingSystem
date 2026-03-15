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
// Import unit actions to listen for changes
import { createUnitAction, deleteUnitAction, updateUnitAction } from "./unitSlice";

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

// Fetch all properties (includes nested units from our relational backend)
export const fetchProperties = createAsyncThunk<
  Property[],
  void,
  { rejectValue: string }
>("properties/fetchAll", async (_, thunkAPI) => {
  try {
    const result = await getProperties();
    console.log("✅ Fetched all properties with units:", result.length);
    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch properties"
    );
  }
});

export const fetchPropertyById = createAsyncThunk<
  Property,
  number,
  { rejectValue: string }
>("properties/fetchById", async (id, thunkAPI) => {
  try {
    const result = await getPropertyById(id);
    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch property"
    );
  }
});

export const createPropertyAction = createAsyncThunk<
  Property,
  CreatePropertyPayload,
  { rejectValue: string }
>("properties/create", async (payload, thunkAPI) => {
  try {
    const result = await createProperty(payload);
    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to create property"
    );
  }
});

export const updatePropertyAction = createAsyncThunk<
  Property,
  { id: number; data: Partial<CreatePropertyPayload> },
  { rejectValue: string }
>("properties/update", async ({ id, data }, thunkAPI) => {
  try {
    const result = await updateProperty(id, data);
    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to update property"
    );
  }
});

export const deletePropertyAction = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("properties/delete", async (id, thunkAPI) => {
  try {
    await deleteProperty(id);
    return id;
  } catch (error: any) {
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
      /* --- FETCH ALL --- */
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

      /* --- FETCH BY ID --- */
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.selectedProperty = action.payload;
      })

      /* --- CREATE PROPERTY --- */
      .addCase(createPropertyAction.fulfilled, (state, action) => {
        state.properties.push({ ...action.payload, units: [] });
      })

      /* --- UPDATE PROPERTY --- */
      .addCase(updatePropertyAction.fulfilled, (state, action) => {
        const updated = action.payload;
        state.properties = state.properties.map((p) =>
          p.id === updated.id ? { ...p, ...updated } : p
        );
      })

      /* --- DELETE PROPERTY --- */
      .addCase(deletePropertyAction.fulfilled, (state, action) => {
        state.properties = state.properties.filter((p) => p.id !== action.payload);
      })

      /* ========================================================
         CROSS-SLICE LISTENERS (Reacting to Unit Changes)
      ======================================================== */

      // 1. When a NEW UNIT is created, add it to the correct property group
      .addCase(createUnitAction.fulfilled, (state, action) => {
        const newUnit = action.payload.unit || action.payload;
        const parentProperty = state.properties.find(p => p.id === newUnit.propertyId);
        if (parentProperty) {
          if (!parentProperty.units) parentProperty.units = [];
          parentProperty.units.push(newUnit);
        }
      })

      // 2. When a UNIT is updated (e.g., status changed), update it inside the property
      .addCase(updateUnitAction.fulfilled, (state, action) => {
        const updatedUnit = action.payload.unit || action.payload;
        state.properties.forEach(p => {
          if (p.units) {
            p.units = p.units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
          }
        });
      })

      // 3. When a UNIT is deleted, remove it from its property group
      .addCase(deleteUnitAction.fulfilled, (state, action) => {
        const deletedUnitId = action.payload;
        state.properties.forEach(p => {
          if (p.units) {
            p.units = p.units.filter(u => u.id !== deletedUnitId);
          }
        });
      });
  },
});

export default propertySlice.reducer;