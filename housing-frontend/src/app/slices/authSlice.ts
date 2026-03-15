import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, type AuthResponse, type LoginRequest, type RegisterRequest } from "../../api/auth";

interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Helper to get initial state from localStorage
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  // Parse the user string back into an object
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS (Updated to save both)
========================= */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, thunkAPI) => {
    try {
      const data = await loginUser(credentials);
      // Persist to disk
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Login failed");
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
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Registration failed");
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
  },
  extraReducers: (builder) => {
    /* LOGIN */
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
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
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;