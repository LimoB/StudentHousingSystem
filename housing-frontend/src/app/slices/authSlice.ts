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

// Define the User interface locally to ensure userId is present
export interface User {
  userId: number; // Added explicitly to fix ts(2339)
  fullName: string;
  email: string;
  role: "student" | "admin" | "landlord";
  phone?: string;
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

// Helper to get initial state from localStorage safely
const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
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
      // Persist to disk
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Login failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterRequest, thunkAPI) => {
    try {
      const data = await registerUser(payload);
      // Persist to disk
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Registration failed"
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
      // Clear disk
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clear memory
      state.user = null;
      state.token = null;
      state.error = null;
    },
    // Useful for clearing errors when switching between Login/Register forms
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
        // Cast to our User type which has userId
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
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;