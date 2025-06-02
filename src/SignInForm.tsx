"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp" | "forgotPassword">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const requestPasswordReset = useMutation(api.auth.requestPasswordReset);

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    
    try {
      await requestPasswordReset({ email });
      toast.success("Password reset email sent! Check your console for the reset link.");
      setFlow("signIn");
    } catch (error) {
      toast.error("Failed to send password reset email");
    } finally {
      setSubmitting(false);
    }
  };

  if (flow === "forgotPassword") {
    return (
      <div className="w-full">
        <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
          <input
            className="input-field"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <button className="auth-button" type="submit" disabled={submitting}>
            Send Reset Link
          </button>
          <div className="text-center text-sm text-slate-600">
            <button
              type="button"
              className="text-blue-500 cursor-pointer"
              onClick={() => setFlow("signIn")}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((_error) => {
            const toastTitle =
              flow === "signIn"
                ? "Could not sign in, did you mean to sign up?"
                : "Could not sign up, did you mean to sign in?";
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <div className="relative">
          <input
            className="input-field w-full"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M3 3l18 18"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-slate-600">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-blue-500 cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
        {flow === "signIn" && (
          <div className="text-center text-sm text-slate-600">
            {/* <button
              type="button"
              className="text-blue-500 cursor-pointer"
              onClick={() => setFlow("forgotPassword")}
            >
              Forgot your password?
            </button> */}
          </div>
        )}
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow" />
        <span className="mx-4 text-slate-400 ">or</span>
        <hr className="my-4 grow" />
      </div>
      <button className="auth-button" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </button>
    </div>
  );
}
