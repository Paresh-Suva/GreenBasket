import { create } from "zustand";

export interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  roles: string[];
  emailVerified: boolean;
  accountStatus: string;
  walletBalance?: number;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshSession: (token: string, refreshToken: string, user: User) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially true while AuthInitializer checks session
  login: (token, refreshToken, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("greenbasket_refresh_token", refreshToken);
    }
    set({ accessToken: token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("greenbasket_refresh_token");
    }
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
  refreshSession: (token, refreshToken, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("greenbasket_refresh_token", refreshToken);
    }
    set({ accessToken: token, user, isAuthenticated: true, isLoading: false });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("greenbasket_refresh_token");
    }
    set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

