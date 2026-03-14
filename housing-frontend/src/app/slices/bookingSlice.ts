import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  deleteBooking,
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

/* GET ALL BOOKINGS */

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, thunkAPI) => {
    try {
      return await getBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

/* GET MY BOOKINGS */

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      return await getMyBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch my bookings"
      );
    }
  }
);

/* GET BOOKING BY ID */

export const fetchBookingById = createAsyncThunk(
  "bookings/fetchBookingById",
  async (id: number, thunkAPI) => {
    try {
      return await getBookingById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch booking"
      );
    }
  }
);

/* CREATE BOOKING */

export const createBookingAction = createAsyncThunk(
  "bookings/createBooking",
  async (payload: CreateBookingPayload, thunkAPI) => {
    try {
      return await createBooking(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to create booking"
      );
    }
  }
);

/* DELETE BOOKING */

export const deleteBookingAction = createAsyncThunk(
  "bookings/deleteBooking",
  async (id: number, thunkAPI) => {
    try {
      await deleteBooking(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to delete booking"
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH BOOKINGS */

      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })

      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH MY BOOKINGS */

      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })

      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH BOOKING BY ID */

      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })

      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE BOOKING */

      .addCase(createBookingAction.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
      })

      /* DELETE BOOKING */

      .addCase(deleteBookingAction.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(
          (b) => b.id !== action.payload
        );
      });
  },
});

export default bookingSlice.reducer;