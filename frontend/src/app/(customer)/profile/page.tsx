"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import { ProfileLayout } from "@/components/storefront/ProfileLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Lock, Save, ShieldAlert, Camera, Loader2 } from "lucide-react";
import { UserProfileResponse } from "@/types";
import { getFullImageUrl } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
 
interface ProfileFormProps {
  user: UserProfileResponse;
}
 
function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient();
 
  // Profile Form States
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  
  // Image Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || "");
 
  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phoneNumber?: string }) =>
      usersService.updateProfile(data),
    onSuccess: (res) => {
      toast.success("Profile details updated successfully");
      queryClient.setQueryData(["profile-me"], res);
      
      // Update Zustand store
      useAuthStore.setState({ user: res.data });
      
      // Also update local storage user if cached
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("greenbasket_auth_state");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.state.user = res.data;
            localStorage.setItem("greenbasket_auth_state", JSON.stringify(parsed));
          } catch (e) {
            console.error("Failed to update cached auth state", e);
          }
        }
      }
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update profile";
      toast.error(msg);
    }
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword?: string; newPassword?: string; confirmPassword?: string }) =>
      usersService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to change password";
      toast.error(msg);
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || undefined
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword
    });
  };
 
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
 
    const formData = new FormData();
    formData.append("file", file);
 
    try {
      setIsUploading(true);
      const res = await usersService.uploadProfileImage(formData);
      toast.success("Profile picture updated successfully");
      
      const updatedUser = res.data;
      setProfileImageUrl(updatedUser.profileImageUrl || "");
      
      // Update react-query cache
      queryClient.setQueryData(["profile-me"], { data: updatedUser });
      
      // Update Zustand store
      useAuthStore.setState({ user: updatedUser });
      
      // Also update local storage user if cached
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("greenbasket_auth_state");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.state.user = updatedUser;
            localStorage.setItem("greenbasket_auth_state", JSON.stringify(parsed));
          } catch (e) {
            console.error("Failed to update cached auth state", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };
 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Personal Details Card */}
      <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
        <h3 className="font-extrabold text-slate-800 text-base mb-6 pb-3 border-b border-slate-50 flex items-center gap-2">
          <User size={18} className="text-primary" />
          <span>Personal Information</span>
        </h3>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-start gap-3 mb-2 pb-4 border-b border-slate-100">
            <label className="text-xs font-bold text-slate-500">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-[#edf7ef] border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xl overflow-hidden group">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : profileImageUrl ? (
                  <img
                    src={getFullImageUrl(profileImageUrl)}
                    alt={firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{firstName ? firstName[0].toUpperCase() : "U"}</span>
                )}
                
                {/* Upload Trigger Input */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <label className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors w-fit">
                  Change Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">JPG, PNG or WEBP. Max 2MB.</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">First Name *</label>
              <Input
                type="text"
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Last Name *</label>
              <Input
                type="text"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Email Address (Read-only)</label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="h-10 text-xs border border-slate-100 bg-slate-50/50 text-slate-400 font-bold rounded-xl cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Phone Number *</label>
            <Input
              type="text"
              placeholder="e.g. 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-2 w-max self-start"
          >
            <Save size={16} />
            <span>{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</span>
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
        <h3 className="font-extrabold text-slate-800 text-base mb-6 pb-3 border-b border-slate-50 flex items-center gap-2">
          <Lock size={18} className="text-primary" />
          <span>Change Password</span>
        </h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Current Password *</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">New Password *</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Confirm New Password *</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-secondary hover:bg-secondary/95 text-white font-bold h-10 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-2 w-max self-start"
          >
            <ShieldAlert size={16} />
            <span>{changePasswordMutation.isPending ? "Updating..." : "Update Password"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: userRes, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => authService.getMe()
  });

  const user = userRes?.data;

  if (isLoading || !user) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingState text="Loading profile details..." />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <ProfileForm user={user} key={user.publicId} />
    </ProfileLayout>
  );
}
