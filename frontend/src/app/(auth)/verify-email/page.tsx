"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { AuthHeader } from "@/components/auth/AuthComponents";
import { AuthCard } from "@/components/auth/AuthSplitLayout";
import Image from "next/image";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState("");
  
  const hasVerified = useRef(false);

  const { mutate: verifyMutation } = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (res) => {
      if (res.status === "success") {
        setStatus("success");
        setMessage("Your email has been successfully verified. You can now log in.");
      } else {
        setStatus("error");
        setMessage(res.message || "Failed to verify email.");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      setStatus("error");
      setMessage(err.response?.data?.message || "An error occurred during verification.");
    },
  });

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyMutation({ token, email: email || "" });
    }
  }, [token, email, verifyMutation]);

  if (status === "verifying") {
    return (
      <AuthCard className="flex flex-col items-center justify-center text-center space-y-4 py-12">
        <Loader2 className="h-14 w-14 text-[#1A4F2C] animate-spin" />
        <h2 className="text-2xl font-bold text-[#1A4F2C]">Verifying your email...</h2>
        <p className="text-muted-foreground">Please wait while we securely verify your address.</p>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard className="flex flex-col items-center justify-center text-center space-y-6 pt-10">
        <div className="h-24 w-24 bg-[#E9F6EE] rounded-full flex items-center justify-center text-[#1A4F2C]">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <AuthHeader title="Email Verified" subtitle={message} />
        <Button onClick={() => router.push("/login")} className="w-full h-12 text-base font-semibold shadow-md shadow-primary/20">
          Continue to Login
        </Button>
      </AuthCard>
    );
  }

  if (status === "error") {
    return (
      <AuthCard className="flex flex-col items-center justify-center text-center space-y-6 pt-10">
        <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <XCircle className="h-12 w-12" />
        </div>
        <AuthHeader title="Verification Failed" subtitle={message} />
        <Button onClick={() => router.push("/login")} variant="outline" className="w-full h-12 text-base font-semibold">
          Return to Login
        </Button>
      </AuthCard>
    );
  }

  // Idle state (no token, just waiting to check email)
  return (
    <AuthCard className="flex flex-col items-center justify-center text-center space-y-6 pt-8">
      <div className="flex justify-center mb-2">
        <div className="relative w-12 h-12">
          <Image src="/images/Logo.png" alt="GreenBasket Logo" fill className="object-contain" />
        </div>
      </div>
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-[#1A4F2C]">
        <Mail className="h-10 w-10" />
      </div>
      <AuthHeader 
        title="Check Your Email" 
        subtitle={email ? `We sent a verification link to ${email}.` : "We sent a verification link to your email."} 
      />
      <p className="text-sm text-muted-foreground px-4">
        Please click the link in that email to securely verify your GreenBasket account.
      </p>
      <Button onClick={() => router.push("/login")} variant="outline" className="w-full h-12 mt-4 text-base font-semibold">
        Return to Login
      </Button>
    </AuthCard>
  );
}
