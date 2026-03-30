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

export const fetchProperties = createAsyncThunk<Property[], void, { rejectValue: string }>(
  "properties/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getProperties();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch properties");
    }
  }
);

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

export const createPropertyAction = createAsyncThunk<Property, CreatePropertyPayload, { rejectValue: string }>(
  "properties/create",
  async (payload, thunkAPI) => {
    try {
      const response = await createProperty(payload);
      // Ensure we return the 'property' object inside the response
      return response.property; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create property");
    }
  }
);

export const updatePropertyAction = createAsyncThunk<
  Property, // Return the updated property from backend
  { id: number; data: Partial<CreatePropertyPayload> },
  { rejectValue: string }
>("properties/update", async (payload, thunkAPI) => {
  try {
    const response = await updateProperty(payload.id, payload.data);
    return response.property; 
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update property");
  }
});

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
        // Backend returns a single property, we add it to our list
        state.properties.unshift({ ...action.payload, units: [] });
      })

      /* UPDATE */
      .addCase(updatePropertyAction.fulfilled, (state, action: PayloadAction<Property>) => {
        const updated = action.payload;
        state.properties = state.properties.map((p) => p.id === updated.id ? updated : p);
        if (state.selectedProperty?.id === updated.id) {
          state.selectedProperty = updated;
        }
      })

      /* DELETE */
      .addCase(deletePropertyAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.properties = state.properties.filter((p) => p.id !== action.payload);
        if (state.selectedProperty?.id === action.payload) {
          state.selectedProperty = null;
        }
      })

      /* CROSS-SLICE LISTENERS: UNITS */
      // When a unit is added, inject it into the local units array of the parent property
      .addCase(createUnitAction.fulfilled, (state, action: any) => {
        const newUnit = action.payload.unit || action.payload;
        const targetId = newUnit.propertyId;

        // Update in the list
        const propertyInList = state.properties.find(p => p.id === targetId);
        if (propertyInList) {
          propertyInList.units = propertyInList.units ? [...propertyInList.units, newUnit] : [newUnit];
        }

        // Update in the selected property view
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

        if (state.selectedProperty?.units) {
          state.selectedProperty.units = updateInArray(state.selectedProperty.units);
        }
      })

      .addCase(deleteUnitAction.fulfilled, (state, action: any) => {
        const deletedId = action.payload;
        const filterArray = (units: any[]) => units.filter(u => u.id !== deletedId);

        state.properties.forEach(p => {
          if (p.units) p.units = filterArray(p.units);
        });

        if (state.selectedProperty?.units) {
          state.selectedProperty.units = filterArray(state.selectedProperty.units);
        }
      });
  },
});

export const { clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;