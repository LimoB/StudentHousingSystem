import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  loginUser, 
  registerUser, 
  type AuthResponse, 
  type LoginRequest, 
  type RegisterRequest 
} from "../../api/auth";
import { updateProfileAction } from "./userSlice"; // Import the profile update action

/* =========================
   TYPES
========================= */

export interface User {
  id: number;
  userId: number; // Keep both for safety
  fullName: string;
  email: string;
  role: "student" | "admin" | "landlord";
  phone?: string;
  createdAt: string | number | Date;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/* =========================
   PERSISTENCE HELPERS
========================= */

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return { ...user, userId: user.userId || user.id } as User;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, thunkAPI) => {
    try {
      const data = await loginUser(credentials);
      if (data.token) {
        // Standardize the user object before storing
        const standardizedUser = { ...data.user, userId: data.user.userId || data.user.id };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(standardizedUser));
        localStorage.setItem("userRole", data.user.role);
        return { ...data, user: standardizedUser } as AuthResponse;
      }
      return data as AuthResponse;
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterRequest, thunkAPI) => {
    try {
      const data = await registerUser(payload);
      if (data.token) {
        const standardizedUser = { ...data.user, userId: data.user.userId || data.user.id };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(standardizedUser));
        localStorage.setItem("userRole", data.user.role);
        return { ...data, user: standardizedUser } as AuthResponse;
      }
      return data as AuthResponse;
    } catch (error: unknown) {
      const err = error as ApiError;
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Registration failed"
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.clear(); // Nukes everything for security
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user as User;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* REGISTER */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user as User;
        state.token = action.payload.token;
      })

      /* UPDATE PROFILE SYNC 
         This keeps the logged-in user state fresh when they change their own profile
      */
      .addCase(updateProfileAction.fulfilled, (state, action) => {
        if (state.user && state.user.userId === action.payload.userId) {
          state.user = action.payload;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;