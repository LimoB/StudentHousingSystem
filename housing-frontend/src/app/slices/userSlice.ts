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
// Use the User interface from authSlice
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
   THUNKS
========================= */

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getUsers();
      // Map 'id' from API to 'userId' for Redux if they differ
      return response.map((u: any) => ({
        ...u,
        userId: u.userId || u.id 
      })) as User[];
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const createUserAction = createAsyncThunk(
  "users/create",
  async (payload: CreateUserPayload, thunkAPI) => { // Use specific payload type
    try {
      const response = await createUser(payload);
      return {
        ...response.user,
        userId: (response.user as any).id || response.user.userId
      } as User;
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
      return {
        ...response.user,
        userId: (response.user as any).id || response.user.userId
      } as User;
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
      return id;
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
      return {
        ...response.user,
        userId: (response.user as any).id || response.user.userId
      } as User;
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
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
      .addCase(createUserAction.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })

      /* UPDATE */
      .addCase(updateUserAction.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.map((u) =>
          u.userId === action.payload.userId ? action.payload : u
        );
      })

      /* DELETE */
      .addCase(deleteUserAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter((u) => u.userId !== action.payload);
      })

      /* UPDATE PROFILE */
      .addCase(updateProfileAction.fulfilled, (state, action: PayloadAction<User>) => {
        const updatedUser = action.payload;
        state.users = state.users.map((u) =>
          u.userId === updatedUser.userId ? updatedUser : u
        );
      });
  },
});

export default userSlice.reducer;