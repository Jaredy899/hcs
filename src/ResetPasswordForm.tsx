import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  const tokenVerification = useQuery(api.auth.verifyResetToken, { token });
  const resetPassword = useMutation(api.auth.resetPassword);
  const completePasswordReset = useMutation(api.auth.completePasswordReset);
  const { signIn } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await resetPassword({ token, newPassword });
      if (result.success) {
        setResetComplete(true);
        toast.success("Password reset initiated! Now creating your new credentials...");
        
        // Ensure we have a valid email from the result
        if (result.email) {
          try {
            // Sign the user up with their new password (this creates a new account)
            const formData = new FormData();
            formData.set("email", result.email);
            formData.set("password", newPassword);
            formData.set("flow", "signUp");
            
            await signIn("password", formData);
            
            // Complete the password reset process (this cleans up the old account)
            await completePasswordReset({ token, email: result.email });
            
            toast.success("Password reset successful! Welcome back!");
            onSuccess();
          } catch (signInError) {
            // If sign up fails, it might be because account already exists with new password
            // Try signing in instead
            try {
              const signInFormData = new FormData();
              signInFormData.set("email", result.email);
              signInFormData.set("password", newPassword);
              signInFormData.set("flow", "signIn");
              
              await signIn("password", signInFormData);
              
              // Complete the password reset process
              await completePasswordReset({ token, email: result.email });
              
              toast.success("Password reset successful! Welcome back!");
              onSuccess();
            } catch (finalError) {
              toast.error("Password was reset but there was an issue signing you in. Please try signing in manually.");
              onSuccess();
            }
          }
        }
      } else {
        toast.error(result.error || "Failed to reset password");
        setSubmitting(false);
      }
    } catch (error) {
      toast.error("Failed to reset password");
      setSubmitting(false);
    }
  };

  if (tokenVerification === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!tokenVerification.valid) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Reset Link</h2>
          <p className="text-red-600 mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={onSuccess}
            className="auth-button"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Password Reset Complete</h2>
          <p className="text-green-600">
            Processing your new credentials and signing you in...
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Your Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Enter a new password for {tokenVerification.email}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-4 text-center font-medium">
          Don't worry - your clients and data will be preserved!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="input-field w-full"
              required
              minLength={8}
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
          
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="input-field"
            required
            minLength={8}
          />
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 8 characters long
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="auth-button"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
          
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
} 