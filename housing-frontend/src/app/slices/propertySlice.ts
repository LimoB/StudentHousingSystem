import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  Property,
  CreatePropertyPayload,
} from "../../api/properties";
import { createUnitAction, deleteUnitAction, updateUnitAction } from "./unitSlice";
import { RootState } from "../../app/store";

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

/**
 * FETCH ALL PROPERTIES
 */
export const fetchProperties = createAsyncThunk<Property[], void, { rejectValue: string; state: RootState }>(
  "properties/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getProperties();
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch properties");
    }
  }
);

/**
 * FETCH SINGLE PROPERTY
 */
export const fetchPropertyById = createAsyncThunk<Property, number, { rejectValue: string }>(
  "properties/fetchById",
  async (id, thunkAPI) => {
    try {
      return await getPropertyById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch property");
    }
  }
);

/**
 * CREATE PROPERTY
 */
export const createPropertyAction = createAsyncThunk<Property, CreatePropertyPayload, { rejectValue: string }>(
  "properties/create",
  async (payload, thunkAPI) => {
    try {
      const response = await createProperty(payload);
      // Fixed: Fallback to response if response.property is undefined (flat response)
      return (response as any).property || response; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create property");
    }
  }
);

/**
 * UPDATE PROPERTY
 * This fix addresses the "reading id of undefined" error
 */
export const updatePropertyAction = createAsyncThunk<
  Property, 
  { id: number; data: Partial<CreatePropertyPayload> },
  { rejectValue: string }
>("properties/update", async (payload, thunkAPI) => {
  try {
    const response = await updateProperty(payload.id, payload.data);
    
    /**
     * YOUR BACKEND LOG SHOWS: 
     * Success Response: { id: 9, name: 'Neema Hostel', ... } 
     * It does NOT have a .property wrapper. 
     */
    const updatedProperty = (response as any).property || response;

    if (!updatedProperty || !updatedProperty.id) {
        throw new Error("Server returned an invalid property format");
    }

    return updatedProperty; 
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to update property";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * DELETE PROPERTY
 */
export const deletePropertyAction = createAsyncThunk<number, number, { rejectValue: string }>(
  "properties/delete",
  async (id, thunkAPI) => {
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
  reducers: {
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })

      /* FETCH BY ID */
      .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<Property>) => {
        state.selectedProperty = action.payload;
      })

      /* CREATE */
      .addCase(createPropertyAction.fulfilled, (state, action: PayloadAction<Property>) => {
        state.properties.unshift({ ...action.payload, units: [] });
      })

      /* UPDATE (CRITICAL FIX) */
      .addCase(updatePropertyAction.fulfilled, (state, action: PayloadAction<Property>) => {
        const updated = action.payload;
        
        // Ensure state.properties exists
        if (state.properties) {
          state.properties = state.properties.map((p) => 
            p.id === updated.id ? { ...p, ...updated } : p
          );
        }
        
        // Update selection if it matches
        if (state.selectedProperty?.id === updated.id) {
          state.selectedProperty = { ...state.selectedProperty, ...updated };
        }
      })

      /* DELETE */
      .addCase(deletePropertyAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.properties = state.properties.filter((p) => p.id !== action.payload);
        if (state.selectedProperty?.id === action.payload) {
          state.selectedProperty = null;
        }
      })

      /* --- UNIT LISTENERS --- */
      .addCase(createUnitAction.fulfilled, (state, action: any) => {
        const newUnit = action.payload.unit || action.payload;
        const targetId = newUnit.propertyId;
        
        const propertyInList = state.properties.find(p => p.id === targetId);
        if (propertyInList) {
          propertyInList.units = propertyInList.units ? [...propertyInList.units, newUnit] : [newUnit];
          if (propertyInList._count) propertyInList._count.units += 1;
        }

        if (state.selectedProperty && state.selectedProperty.id === targetId) {
          state.selectedProperty.units = state.selectedProperty.units 
            ? [...state.selectedProperty.units, newUnit] 
            : [newUnit];
        }
      })

      .addCase(updateUnitAction.fulfilled, (state, action: any) => {
        const updatedUnit = action.payload.unit || action.payload;
        const updateInArray = (units: any[]) => units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
        
        state.properties.forEach(p => {
          if (p.units) p.units = updateInArray(p.units);
        });
        
        if (state.selectedProperty?.id === updatedUnit.propertyId && state.selectedProperty.units) {
          state.selectedProperty.units = updateInArray(state.selectedProperty.units);
        }
      })

      .addCase(deleteUnitAction.fulfilled, (state, action: any) => {
        const deletedId = action.payload;
        const filterArray = (units: any[]) => units.filter(u => u.id !== deletedId);
        
        state.properties.forEach(p => {
          if (p.units) {
            const originalLength = p.units.length;
            p.units = filterArray(p.units);
            if (p._count && p.units.length < originalLength) p._count.units -= 1;
          }
        });
        
        if (state.selectedProperty?.units) {
          state.selectedProperty.units = filterArray(state.selectedProperty.units);
        }
      });
  },
});

export const { clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;