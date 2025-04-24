"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { usePerformance } from "@/app/context/PerformanceContext";
import NavBar from "@/app/components/layout/NavBar";
import PerformanceDashboard from "@/app/components/performance/PerformanceDashboard";

export default function PerformancePage() {
  const { user, loading: authLoading } = useAuth();
  const { getAllPerformanceData, loading: dataLoading } = usePerformance();
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

  // Get all performance data for the dashboard
  const performanceData = getAllPerformanceData();

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <PerformanceDashboard performanceData={performanceData} />
      </main>
    </div>
  );
}
