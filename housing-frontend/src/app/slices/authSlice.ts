import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  loginUser, 
  registerUser, 
  type AuthResponse, 
  type LoginRequest, 
  type RegisterRequest 
} from "../../api/auth";

/* =========================
   TYPES
========================= */

export interface User {
  userId: number; 
  fullName: string;
  email: string;
  role: "student" | "admin" | "landlord";
  phone?: string;
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
   INITIAL STATE
========================= */

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
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
      // Persist immediately on success
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);
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
      // Clear everything
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
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
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Clean up if login failed to prevent ghost sessions
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;