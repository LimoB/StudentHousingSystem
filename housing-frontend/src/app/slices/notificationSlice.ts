import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getNotifications,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  Notification,
} from "../../api/notifications";

/* =========================
   STATE
========================= */
interface NotificationState {
  notifications: Notification[];
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch");
    }
  }
);

export const fetchMyNotifications = createAsyncThunk(
  "notifications/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await getMyNotifications();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch");
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Action failed");
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

/* =========================
   SLICE
========================= */
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL (ADMIN) */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH MY NOTIFICATIONS */
      .addCase(fetchMyNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })

      /* MARK AS READ */
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const index = state.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          state.notifications[index].isRead = true;
        }
      })

      /* DELETE */
      .addCase(deleteNotificationAction.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      });
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;