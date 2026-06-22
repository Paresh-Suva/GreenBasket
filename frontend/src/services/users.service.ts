import { api } from "./api";
import { ApiResponse, UserProfileResponse } from "@/types";

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const usersService = {
  async updateProfile(data: UpdateProfileRequest) {
    const res = await api.put<ApiResponse<UserProfileResponse>>("/users/profile", data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest) {
    const res = await api.put<ApiResponse<void>>("/users/change-password", data);
    return res.data;
  },

  async uploadProfileImage(formData: FormData) {
    const res = await api.put<ApiResponse<UserProfileResponse>>("/users/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  }
};
