// src/api/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create axios instance
const axiosClient = axios.create({
  baseURL: "http://localhost:4545/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // include cookies if backend uses them
});

// REQUEST INTERCEPTOR: Attach token to every request
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "[Axios Request]",
      config.method?.toUpperCase(),
      config.url,
      token ? "✅ with token" : "⚠️ no token"
    );
    return config;
  },
  (error: any) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Global logging & 401 handling
axiosClient.interceptors.response.use(
  (response) => {
    console.log("[Axios Response]", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      console.warn("⚠️ Unauthorized request to:", url);
      // Optional: you can trigger logout here, e.g.,
      // store.dispatch(logout());
      // But for now we just reject the error
    }

    if (status === 403) {
      console.warn("🚫 Forbidden request to:", url);
    }

    console.error("[Axios Error]", status, url, error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;