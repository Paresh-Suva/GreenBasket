"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { loginSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      if (res.status === "success" && res.data) {
        login(res.data.accessToken, res.data.refreshToken || "", res.data.user);
        toast.success("Welcome back! Logging you in...");
        router.replace(redirect);
      } else {
        toast.error(res.message || "Failed to log in.");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "An error occurred during login.";
      toast.error(msg);
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation(data);
  }

  return (
    <div className="auth-page-root fade-in">
      {/* Animated background leaves */}
      <div className="leaves-bg" aria-hidden="true">
        <svg className="leaf leaf-login-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22C2 22 6 18 12 17C18 16 22 10 22 2C22 2 14 2 8 8C2 14 2 22 2 22Z" />
        </svg>
        <svg className="leaf leaf-login-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22C2 22 6 18 12 17C18 16 22 10 22 2C22 2 14 2 8 8C2 14 2 22 2 22Z" />
        </svg>
        <svg className="leaf leaf-login-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22C2 22 6 18 12 17C18 16 22 10 22 2C22 2 14 2 8 8C2 14 2 22 2 22Z" />
        </svg>
      </div>

      <div className="app-container">
        <main className="main-content">
          
          {/* Left side information */}
          <section className="left-pane">
            <div className="logo-container">
              <img src="/images/Website Logo.png" alt="GreenBasket Logo" className="logo-img" />
            </div>
            
            <div className="welcome-heading-container">
              <h1 className="welcome-title-dark">Welcome Back!</h1>
              <h2 className="welcome-title-bright">Good to see you again</h2>
              <p className="welcome-desc">Login to continue shopping fresh groceries.</p>
            </div>
            
            <div className="illustration-container">
              <img src="/images/Basket.png" alt="Fresh Grocery Basket" className="illustration-img" />
            </div>
          </section>

          {/* Right side card form */}
          <section className="right-pane">
            <div className="form-card">
              <header className="card-header">
                <h2 className="card-title">Login to Your Account</h2>
                <p className="card-subtitle">Enter your details to access your account</p>
              </header>

              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                {/* Email Input */}
                <div className="form-group">
                  <label htmlFor="email" className="input-label">Email Address</label>
                  <div className="input-container">
                    <span className="input-icon-left" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input 
                      type="email" 
                      id="email" 
                      {...form.register("email")}
                      className="input-field" 
                      placeholder="Enter your email address" 
                      required
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="input-container">
                    <span className="input-icon-left" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      {...form.register("password")}
                      className="input-field" 
                      placeholder="Enter your password" 
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        /* Eye Closed Icon */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        /* Eye Open Icon */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot password link */}
                <div className="form-actions">
                  <Link href="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn" disabled={isPending}>
                  <span>{isPending ? "Logging in..." : "Login"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </form>
              {/* Footer redirection */}
              <div className="auth-switch-text">
                Don&apos;t have an account?<Link href="/register" className="auth-switch-link">Sign up</Link>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Features Footer */}
        <footer className="login-footer">
          <div className="footer-item">
            <div className="footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 11 11 13 15 9"></polyline>
              </svg>
            </div>
            <div className="footer-text">
              <span className="footer-title">100% Secure</span>
              <span className="footer-desc">Your data is safe and protected</span>
            </div>
          </div>

          <div className="footer-item">
            <div className="footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className="footer-text">
              <span className="footer-title">Fast Delivery</span>
              <span className="footer-desc">Quick delivery at your doorstep</span>
            </div>
          </div>

          <div className="footer-item">
            <div className="footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div className="footer-text">
              <span className="footer-title">Best Quality</span>
              <span className="footer-desc">Fresh and quality products</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
