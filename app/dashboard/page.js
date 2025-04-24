"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { KanbanProvider } from "@/app/context/KanbanContext";
import Board from "@/app/components/kanban/Board";
import NavBar from "@/app/components/layout/NavBar"; // Make sure this matches the file name exactly

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
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
        <KanbanProvider>
          <Board />
        </KanbanProvider>
      </main>
    </div>
  );
}
