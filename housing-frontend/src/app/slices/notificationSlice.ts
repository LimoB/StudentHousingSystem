// src/app/slices/notificationSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  getMyNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} from "../../api/notifications";

/* =========================
   STATE
========================= */
interface NotificationState {
  notifications: any[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getNotifications();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMyNotifications = createAsyncThunk(
  "notifications/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await getMyNotifications();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createNotificationAction = createAsyncThunk(
  "notifications/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createNotification(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: number, thunkAPI) => {
    try {
      await markAsRead(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteNotificationAction = createAsyncThunk(
  "notifications/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteNotification(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

/* =========================
   SLICE
========================= */
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH MY NOTIFICATIONS */
      .addCase(fetchMyNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })

      /* CREATE */
      .addCase(createNotificationAction.fulfilled, (state, action) => {
        state.notifications.push(action.payload.notification);
      })

      /* MARK AS READ */
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
      })

      /* DELETE */
      .addCase(deleteNotificationAction.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      });
  },
});

export default notificationSlice.reducer;