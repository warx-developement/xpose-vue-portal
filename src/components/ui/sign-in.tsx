"use client";

import React, { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TwoFactorResponse } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  otp: z.string().optional(),
}).refine((data) => {
  // If 2FA is required, OTP must be provided
  if (data.otp !== undefined && data.otp !== '') {
    return data.otp.length === 6;
  }
  return true;
}, {
  message: "Please enter the 6-digit code",
  path: ["otp"],
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LightLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorResponse | null>(null);
  const login = useLogin();
  
  const {
    register,
    handleSubmit,
    reset: resetLoginForm,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    if (twoFactorData && data.otp) {
      // 2FA login - send email, password, and OTP together
      login.mutate({
        email: data.email,
        password: data.password,
        otp: data.otp,
      });
    } else {
      // Regular login
      login.mutate({
        email: data.email,
        password: data.password,
      });
    }
  };

  // Handle 2FA response from login
  React.useEffect(() => {
    if (login.data && login.data.data && 'requires_2fa' in login.data.data) {
      setTwoFactorData(login.data.data as unknown as TwoFactorResponse);
    }
  }, [login.data]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-100 via-blue-50 to-transparent opacity-40 blur-3xl -mt-20"></div>
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 110 106"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100.83 28.63L66.86 3.95c-7.25-5.26-17.07-5.26-24.35 0L8.54 28.63C1.29 33.89-1.76 43.23 1.01 51.77l12.98 39.93c2.77 8.53 10.72 14.3 19.7 14.3h41.97c8.98 0 16.93-5.76 19.7-14.3l12.98-39.93c2.77-8.53-.28-17.88-7.53-23.14ZM64.81 63.13l-10.13 18.55-10.13-18.55-18.55-10.13 18.55-10.13 10.13-18.55 10.13 18.55 18.55 10.13-18.55 10.13Z"
                  fill="#3B82F6"
                />
              </svg>
            </div>
            <div className="p-0">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {twoFactorData ? "Two-Factor Authentication" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-500 mt-2">
                {twoFactorData ? "Enter the 6-digit code from your authenticator app" : "Sign in to continue to your account"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-0">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email or Phone
              </label>
              <input
                {...register("email")}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border"
                placeholder="Enter your email or phone"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-50 border-gray-200 text-gray-900 pr-12 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {twoFactorData && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Authentication Code
                </label>
                <input
                  {...register("otp")}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/50 focus:border-blue-500 w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                />
                {errors.otp && (
                  <p className="text-sm text-red-500">{errors.otp.message}</p>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={login.isPending}
              className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {login.isPending ? (twoFactorData ? "Verifying..." : "Signing In...") : (twoFactorData ? "Verify Code" : "Sign In")}
            </button>

            {twoFactorData && (
              <button 
                type="button"
                onClick={() => {
                  setTwoFactorData(null);
                  login.reset();
                  resetLoginForm();
                }}
                className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center whitespace-nowrap text-sm"
              >
                Back to Login
              </button>
            )}
          </form>


        </div>
      </div>
    </div>
  );
};