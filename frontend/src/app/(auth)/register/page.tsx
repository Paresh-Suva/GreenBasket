"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { authService } from "@/services/auth.service";

const registerFormSchema = z.object({
  fullname: z.string()
    .min(1, "Full name is required.")
    .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 2, {
      message: "Please enter both your first and last name.",
    }),
  email: z.string().email("Please enter a valid email address.").max(255),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agree: true,
    },
  });

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      if (res.status === "success") {
        toast.success("Account created successfully! Auto-verifying...");
        const registrationData = res.data as { verificationToken?: string; email?: string } | undefined;
        const token = registrationData?.verificationToken;
        const email = registrationData?.email || form.getValues("email");
        if (token) {
          router.push(`/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        } else {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      } else {
        toast.error(res.message || "Registration failed.");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "An error occurred during registration.";
      toast.error(msg);
    },
  });

  function onSubmit(data: RegisterFormValues) {
    const nameParts = data.fullname.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      firstName,
      lastName,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    registerMutation(payload);
  }

  return (
    <div className="auth-page-root fade-in">
      {/* Animated background leaves */}
      <div className="leaves-bg" aria-hidden="true">
        <svg className="leaf leaf-reg-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22C2 22 6 18 12 17C18 16 22 10 22 2C22 2 14 2 8 8C2 14 2 22 2 22Z" />
        </svg>
        <svg className="leaf leaf-reg-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22C2 22 6 18 12 17C18 16 22 10 22 2C22 2 14 2 8 8C2 14 2 22 2 22Z" />
        </svg>
        <svg className="leaf leaf-reg-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <h1 className="welcome-title-dark">Create Your</h1>
              <h2 className="welcome-title-bright" style={{ fontSize: "52px", fontWeight: 700, marginBottom: "24px" }}>Account</h2>
              <p className="welcome-desc">Join GreenBasket and start your fresh shopping journey.</p>
            </div>

            {/* Benefits list stacked vertically */}
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <div className="benefit-content">
                  <span className="benefit-title">Fresh & Quality Products</span>
                  <span className="benefit-desc">Get the best quality groceries delivered to your door.</span>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <div className="benefit-content">
                  <span className="benefit-title">Fast & Reliable Delivery</span>
                  <span className="benefit-desc">Quick delivery right to your doorstep.</span>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 11 11 13 15 9"></polyline>
                  </svg>
                </div>
                <div className="benefit-content">
                  <span className="benefit-title">Secure & Safe Payments</span>
                  <span className="benefit-desc">Multiple secure payment options available.</span>
                </div>
              </div>
            </div>
            
            <div className="illustration-container">
              <img src="/images/Bag.png" alt="Groceries Paper Bag" className="illustration-img" />
            </div>
          </section>

          {/* Right side card form */}
          <section className="right-pane">
            <div className="form-card" style={{ padding: "40px" }}>
              <header className="card-header" style={{ marginBottom: "24px" }}>
                <h2 className="card-title" style={{ fontSize: "24px" }}>Create Your Account</h2>
                <p className="card-subtitle">Fill in the details below to get started</p>
              </header>

              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                {/* Full Name Input */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="fullname" className="input-label">Full Name</label>
                  <div className="input-container">
                    <span className="input-icon-left" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      id="fullname" 
                      {...form.register("fullname")}
                      className="input-field" 
                      placeholder="Enter your full name" 
                      required
                    />
                  </div>
                  {form.formState.errors.fullname && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                      {form.formState.errors.fullname.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
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

                {/* Phone Number Input */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="phone" className="input-label">Phone Number</label>
                  <div className="input-container">
                    <span className="input-icon-left" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input 
                      type="tel" 
                      id="phone" 
                      {...form.register("phone")}
                      className="input-field" 
                      placeholder="Enter your phone number" 
                      required
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
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
                      placeholder="Create a password" 
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
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

                {/* Confirm Password Input */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                  <div className="input-container">
                    <span className="input-icon-left" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      {...form.register("confirmPassword")}
                      className="input-field" 
                      placeholder="Confirm your password" 
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions checkbox */}
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    id="agree" 
                    {...form.register("agree")} 
                  />
                  <span className="checkmark"></span>
                  I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
                </label>
                {form.formState.errors.agree && (
                  <p style={{ color: "#DC2626", fontSize: "13px", marginTop: "-16px", marginBottom: "20px", fontWeight: 600 }}>
                    {form.formState.errors.agree.message}
                  </p>
                )}

                {/* Submit Button */}
                <button type="submit" className="submit-btn" style={{ padding: "12px 24px" }} disabled={isPending}>
                  <span>{isPending ? "Creating Account..." : "Create Account"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </form>
              {/* Footer redirection */}
              <div className="auth-switch-text">
                Already have an account?<Link href="/login" className="auth-switch-link">Login</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
