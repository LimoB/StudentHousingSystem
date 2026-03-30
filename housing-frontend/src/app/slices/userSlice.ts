import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../api/users";
import { User } from "./authSlice"; 

/* =========================
   TYPES & STATE
========================= */

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface UserState {
  users: User[]; 
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

/* =========================
   HELPER: ID MAPPER
   Standardizes backend 'id' to frontend 'userId'
========================= */
const mapUser = (u: any): User => ({
  ...u,
  userId: u.userId || u.id 
});

/* =========================
   THUNKS
========================= */

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getUsers();
      return response.map(mapUser);
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const createUserAction = createAsyncThunk(
  "users/create",
  async (payload: CreateUserPayload, thunkAPI) => {
    try {
      const response = await createUser(payload);
      // Backend returns { message: string, user: Object }
      return mapUser(response.user);
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create user");
    }
  }
);

export const updateUserAction = createAsyncThunk(
  "users/update",
  async ({ id, data }: { id: number; data: UpdateUserPayload }, thunkAPI) => {
    try {
      const response = await updateUser(id, data);
      // Backend returns { message: string, user: Object }
      return mapUser(response.user);
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUserAction = createAsyncThunk(
  "users/delete",
  async (id: number, thunkAPI) => {
    try {
      await deleteUser(id);
      return id; // Returns the ID to filter out of the state
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

export const updateProfileAction = createAsyncThunk(
  "users/updateProfile",
  async (data: UpdateUserPayload, thunkAPI) => {
    try {
      const response = await updateProfile(data);
      return mapUser(response.user);
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
  }
);

/* =========================
   SLICE
========================= */
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE */
      .addCase(createUserAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUserAction.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE */
      .addCase(updateUserAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAction.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users = state.users.map((u) =>
          u.userId === action.payload.userId ? action.payload : u
        );
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* DELETE */
      .addCase(deleteUserAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.userId !== action.payload);
      })
      .addCase(deleteUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE PROFILE */
      .addCase(updateProfileAction.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const updatedUser = action.payload;
        state.users = state.users.map((u) =>
          u.userId === updatedUser.userId ? updatedUser : u
        );
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;