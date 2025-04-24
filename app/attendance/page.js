"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import NavBar from "@/app/components/layout/NavBar";
import AttendanceClock from "@/app/components/attendance/AttendanceClock";

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected to login by the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-gray-600">Track your work hours and attendance</p>
        </div>

        <div className="mb-6">
          <AttendanceClock />
        </div>
      </main>
    </div>
  );
}
