"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useAttendance } from "@/app/context/AttendanceContext";
import NavBar from "@/app/components/layout/NavBar";
import TeamAttendance from "@/app/components/attendance/TeamAttendance";
import LeaveApprovals from "@/app/components/attendance/LeaveApprovals";

export default function AdminAttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchTeamAttendance } = useAttendance();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");

  // Redirect if not admin
  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "supervisor"))
    ) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Fetch team attendance data when the page loads
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "supervisor")) {
      fetchTeamAttendance();
    }
  }, [user, fetchTeamAttendance]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Attendance Administration</h1>
          <p className="text-gray-600">
            Manage team attendance and leave requests
          </p>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("team")}
              className={`py-2 px-4 font-medium ${
                activeTab === "team"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Team Attendance
            </button>
            <button
              onClick={() => setActiveTab("leave")}
              className={`py-2 px-4 font-medium ${
                activeTab === "leave"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Leave Approvals
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "team" ? <TeamAttendance /> : <LeaveApprovals />}
      </main>
    </div>
  );
}
