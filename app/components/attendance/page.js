"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import NavBar from "@/app/components/layout/NavBar";

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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {new Date().toLocaleTimeString()}
            </h2>
            <p className="text-gray-600">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-600">Not Clocked In</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white">
              Clock In
            </button>

            <button
              disabled={true}
              className="flex-1 py-3 rounded-md bg-gray-300 cursor-not-allowed"
            >
              Clock Out
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>This is a placeholder for the attendance tracking system.</p>
            <p>The full implementation is coming soon!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
