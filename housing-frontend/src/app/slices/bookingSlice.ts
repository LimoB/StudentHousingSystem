import { createSlice, createAsyncThunk, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  getBookings,
  getLandlordBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  deleteBooking,
  updateBookingStatus,
} from "../../api/bookings";
import type { Booking, CreateBookingPayload } from "../../api/bookings";

/* =========================
   STATE
========================= */

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, thunkAPI) => {
    try {
      return await getBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch all bookings");
    }
  }
);

export const fetchLandlordBookings = createAsyncThunk(
  "bookings/fetchLandlordBookings",
  async (_, thunkAPI) => {
    try {
      return await getLandlordBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch landlord bookings");
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      return await getMyBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch student bookings");
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "bookings/fetchBookingById",
  async (id: number, thunkAPI) => {
    try {
      return await getBookingById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch booking details");
    }
  }
);

export const createBookingAction = createAsyncThunk(
  "bookings/createBooking",
  async (payload: CreateBookingPayload, thunkAPI) => {
    try {
      const response = await createBooking(payload);
      return response.booking; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to create booking");
    }
  }
);

export const updateBookingStatusAction = createAsyncThunk(
  "bookings/updateStatus",
  async ({ id, status }: { id: number; status: "pending" | "approved" | "rejected" }, thunkAPI) => {
    try {
      await updateBookingStatus(id, status);
      return { id, status }; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to update status");
    }
  }
);

export const deleteBookingAction = createAsyncThunk(
  "bookings/deleteBooking",
  async (id: number, thunkAPI) => {
    try {
      await deleteBooking(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to delete booking");
    }
  }
);

/* =========================
   SLICE
========================= */

interface RejectedAction extends Action {
  payload: string;
}

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    // FIX: clearSelectedBooking now also clears the error state
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL / LANDLORD / STUDENT BOOKINGS
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null; // Clear error on success
      })
      .addCase(fetchLandlordBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null; // Clear error on success
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null; // Clear error on success
      })

      // FETCH BY ID
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.selectedBooking = action.payload;
        state.error = null;
      })

      // CREATE
      .addCase(createBookingAction.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.error = null;
      })

      // UPDATE STATUS
      .addCase(updateBookingStatusAction.fulfilled, (state, action: PayloadAction<{id: number, status: any}>) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index].status = action.payload.status;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking.status = action.payload.status;
        }
        state.error = null;
      })

      // DELETE
      .addCase(deleteBookingAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
        state.error = null;
      })

      /* MATCHERS */
      .addMatcher(
        (action): action is Action => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null; // Clear previous errors when a new request starts
        }
      )
      .addMatcher(
        (action): action is RejectedAction => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { clearSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;