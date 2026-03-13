import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookings,
  getMyBookings,
  createBooking,
  deleteBooking,
} from "../../api/bookings";

/* =========================
   STATE
========================= */

interface BookingState {
  bookings: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      return await getMyBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createBookingAction = createAsyncThunk(
  "bookings/createBooking",
  async (payload: any, thunkAPI) => {
    try {
      return await createBooking(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
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

      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })

      /* CREATE BOOKING */

      .addCase(createBookingAction.fulfilled, (state, action) => {
        state.bookings.push(action.payload.booking);
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