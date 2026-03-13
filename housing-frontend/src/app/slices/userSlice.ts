// src/app/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
} from "../../api/users";

/* =========================
   STATE
========================= */
interface UserState {
  users: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await getUsers();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createUserAction = createAsyncThunk(
  "users/create",
  async (payload: any, thunkAPI) => {
    try {
      return await createUser(payload);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateUserAction = createAsyncThunk(
  "users/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      return await updateUser(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteUserAction = createAsyncThunk(
  "users/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteUser(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateProfileAction = createAsyncThunk(
  "users/updateProfile",
  async (data: any, thunkAPI) => {
    try {
      return await updateProfile(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

/* =========================
   SLICE
========================= */
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE */
      .addCase(createUserAction.fulfilled, (state, action) => {
        state.users.push(action.payload.user);
      })

      /* UPDATE */
      .addCase(updateUserAction.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.users = state.users.map((u) =>
          u.id === id ? { ...u, ...action.meta.arg.data } : u
        );
      })

      /* DELETE */
      .addCase(deleteUserAction.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })

      /* UPDATE PROFILE */
      .addCase(updateProfileAction.fulfilled, (state, action) => {
        // update current user in users array if needed
        const updatedUser = action.payload.user;
        state.users = state.users.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );
      });
  },
});

export default userSlice.reducer;