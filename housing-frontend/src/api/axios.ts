import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4545/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// REQUEST INTERCEPTOR: Attach token from localStorage
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
      token ? "Token present" : "No token"
    );
    return config;
  },
  (error: any) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Global error handling
axiosClient.interceptors.response.use(
  (response) => {
    console.log("[Axios Response]", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      console.warn("Unauthorized request to:", url);
      
      /* If the token is invalid or expired, clear storage and 
         reload the page to trigger the Protected Route redirect.
      */
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if we are not already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      console.warn("Forbidden request to:", url);
    }

    console.error("[Axios Error]", status, url, error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;