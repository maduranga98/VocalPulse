// app/login/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Don't show the login page if we're checking authentication status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only show login form if user is not logged in
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <LoginForm />
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Lumora Ventures. All rights reserved.
        </p>
      </div>
    </div>
  );
}
