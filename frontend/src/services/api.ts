import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const getFullImageUrl = (url?: string) => {
  if (!url) return "/images/placeholder.png";
  if (url.startsWith("/uploads")) {
    const host = API_URL.replace("/v1", "");
    return `${host}${url}`;
  }
  return url;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for HTTP-only refresh tokens
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 & Silent Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops and only act on 401 or 403
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("greenbasket_refresh_token") : null;
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;
        
        // Update store with both new tokens
        useAuthStore.getState().refreshSession(accessToken, newRefreshToken || refreshToken, user);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
