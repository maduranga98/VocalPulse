"use client";

import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import GoalTracker from "./GoalTracker";
import TeamComparison from "./TeamComparison";
import { useAuth } from "@/app/context/AuthContext";

export default function PerformanceDashboard({ performanceData }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch real performance data here
    // For this example, we'll use the prop data and add a loading delay
    const timer = setTimeout(() => {
      setData(performanceData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [performanceData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Your Performance Metrics</h1>
        <p className="text-gray-600">
          Track your progress and performance over time
        </p>
      </div>

      {/* Time period selector */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("daily")}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === "daily"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Daily Stats
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === "weekly"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Weekly Summary
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === "monthly"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Monthly Overview
          </button>
        </nav>
      </div>

      {/* KPIs section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data &&
          data[activeTab] &&
          data[activeTab].kpis.map((kpi) => (
            <MetricCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              target={kpi.target}
              unit={kpi.unit}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d={
                      kpi.iconPath ||
                      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    }
                  />
                </svg>
              }
            />
          ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data &&
          data[activeTab] &&
          data[activeTab].charts.map((chart) => (
            <PerformanceChart
              key={chart.id}
              title={chart.title}
              data={chart.data}
              type={chart.type}
              height={300}
            />
          ))}
      </div>

      {/* Team comparison */}
      {data && data.teamComparison && (
        <TeamComparison
          metrics={data.teamComparison.metrics}
          userName={user?.displayName}
        />
      )}

      {/* Goals section */}
      {data && data.goals && <GoalTracker goals={data.goals} />}
    </div>
  );
}
