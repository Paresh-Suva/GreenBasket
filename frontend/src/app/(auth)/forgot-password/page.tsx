"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import Image from "next/image";

import { forgotPasswordSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Link from "next/link";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgotPasswordMutation, isPending } = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (res, variables) => {
      if (res.status === "success") {
        setSubmittedEmail(variables.email);
        setIsSubmitted(true);
      } else {
        toast.error(res.message || "Failed to process request.");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "An error occurred.";
      toast.error(msg);
    },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    forgotPasswordMutation(data);
  }

  if (isSubmitted) {
    return (
      <AuthCard className="flex flex-col items-center justify-center text-center space-y-6 pt-10">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-[#1A4F2C]">
          <MailCheck className="h-10 w-10" />
        </div>
        <AuthHeader 
          title="Check Your Email" 
          subtitle={`We've sent password reset instructions to ${submittedEmail}.`} 
        />
        <div className="text-[13px] text-muted-foreground w-full">
          Didn&apos;t receive the email?{" "}
          <button 
            onClick={() => forgotPasswordMutation({ email: submittedEmail })}
            className="text-primary font-semibold hover:underline"
          >
            Click to resend
          </button>
        </div>
        <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full mt-4 h-11" })}>
          Back to Login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="flex justify-center mb-6">
        <div className="relative w-12 h-12">
          <Image src="/images/Logo.png" alt="GreenBasket Logo" fill className="object-contain" />
        </div>
      </div>
      
      <AuthHeader
        title="Forgot Password"
        subtitle="Enter your email to receive a reset link."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AuthFormContainer>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} className="h-12 bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-base font-semibold mt-4 shadow-md shadow-primary/20" disabled={isPending}>
              {isPending ? "Sending Link..." : "Send Reset Link"}
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
