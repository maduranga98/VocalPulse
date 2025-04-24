"use client";

import { useState, useEffect } from "react";

export default function PerformanceChart({
  title,
  data,
  type = "line",
  labels,
  height = 300,
  showLegend = true,
  periodSelector = true,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [chartData, setChartData] = useState(data);

  // Filter data based on selected period
  useEffect(() => {
    if (data?.periods && data.periods[selectedPeriod]) {
      setChartData(data.periods[selectedPeriod]);
    } else {
      setChartData(data);
    }
  }, [selectedPeriod, data]);

  // This is a simple placeholder for the actual chart
  // In a real implementation, you would integrate a chart library like Chart.js or Recharts
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">{title}</h3>

        {periodSelector && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod("day")}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === "day"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === "week"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === "month"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Month
            </button>
          </div>
        )}
      </div>

      {/* Chart placeholder - in a real implementation, you would render a chart library component here */}
      <div
        className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        {chartData ? (
          <div className="w-full h-full flex items-center justify-center">
            {/* This is a placeholder for the actual chart visualization */}
            <p className="text-gray-500">
              Chart visualization would appear here
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            No data available for the selected period
          </p>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {chartData?.datasets?.map((dataset, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: dataset.color || "#3B82F6" }}
              ></div>
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
