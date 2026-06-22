"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

import { resetPasswordSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthHeader, AuthFormContainer, AuthFooterLinks } from "@/components/auth/AuthComponents";
import { AuthCard } from "@/components/auth/AuthSplitLayout";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      form.setValue("token", token);
    }
  }, [token, form]);

  const { mutate: resetPasswordMutation, isPending } = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Password reset successfully! You can now log in.");
        router.push("/login");
      } else {
        toast.error(res.message || "Failed to reset password.");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "An error occurred. The link might be expired.";
      toast.error(msg);
    },
  });

  function onSubmit(data: ResetPasswordFormValues) {
    resetPasswordMutation(data);
  }

  return (
    <AuthCard>
      <div className="flex justify-center mb-6">
        <div className="relative w-12 h-12">
          <Image src="/images/Logo.png" alt="GreenBasket Logo" fill className="object-contain" />
        </div>
      </div>

      <AuthHeader
        title="Reset Password"
        subtitle="Create a new, strong password."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AuthFormContainer>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordField placeholder="Enter new password" {...field} className="h-12 bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordField placeholder="Confirm new password" {...field} className="h-12 bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-base font-semibold mt-4 shadow-md shadow-primary/20" disabled={isPending}>
              {isPending ? "Resetting Password..." : "Reset Password"}
            </Button>
          </AuthFormContainer>
        </form>
      </Form>

      <AuthFooterLinks
        text="Remember your password?"
        linkText="Back to login"
        href="/login"
      />
    </AuthCard>
  );
}
