import { api } from "./api";
import { User } from "@/store/useAuthStore";

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export const authService = {
  async login(data: Record<string, unknown>) {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/login", data);
    return res.data;
  },

  async register(data: Record<string, unknown>) {
    const res = await api.post<ApiResponse<unknown>>("/auth/register", data);
    return res.data;
  },

  async verifyEmail(data: { token: string; email: string }) {
    const res = await api.post<ApiResponse<unknown>>("/auth/verify-email", data);
    return res.data;
  },

  async forgotPassword(data: { email: string }) {
    const res = await api.post<ApiResponse<unknown>>("/auth/forgot-password", data);
    return res.data;
  },

  async resetPassword(data: Record<string, unknown>) {
    const res = await api.post<ApiResponse<unknown>>("/auth/reset-password", data);
    return res.data;
  },

  async refresh(refreshToken: string) {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/refresh", { refreshToken });
    return res.data;
  },

  async logout() {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("greenbasket_refresh_token") : null;
    const res = await api.post<ApiResponse<unknown>>("/auth/logout", { refreshToken });
    return res.data;
  },

  async logoutAll() {
    const res = await api.post<ApiResponse<unknown>>("/auth/logout-all");
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data;
  }
};
