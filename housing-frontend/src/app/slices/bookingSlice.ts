import { createSlice, createAsyncThunk, PayloadAction, Action } from "@reduxjs/toolkit";
import {
  getBookings,
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
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      return await getMyBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch my bookings");
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "bookings/fetchBookingById",
  async (id: number, thunkAPI) => {
    try {
      return await getBookingById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch booking");
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

// Helper type for matcher payloads
interface RejectedAction extends Action {
  payload: string;
}

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    }
  },

  extraReducers: (builder) => {
    builder
      /* 1. SPECIFIC CASES (MUST BE FIRST) */

      // FETCH ALL/MY BOOKINGS
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })

      // CREATE BOOKING
      .addCase(createBookingAction.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
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
      })

      // DELETE BOOKING
      .addCase(deleteBookingAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
      })

      /* 2. MATCHERS (MUST BE LAST) */

      .addMatcher(
        (action): action is Action => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
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