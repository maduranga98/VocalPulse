"use client";

import { useState } from "react";

export default function MetricCard({
  title,
  value,
  trend,
  target,
  unit = "",
  icon,
  trendType = "percentage",
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Determine if trend is positive or negative
  const isPositiveTrend = trend > 0;
  const isTrendGood = isPositiveTrend; // Default assumption: up is good

  // Format trend display
  const trendDisplay =
    trendType === "percentage"
      ? `${trend > 0 ? "+" : ""}${trend}%`
      : `${trend > 0 ? "+" : ""}${trend}`;

  // Calculate progress percentage (for target)
  const progressPercentage = target
    ? Math.min(Math.round((value / target) * 100), 100)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 relative overflow-hidden">
      {/* Icon (if provided) */}
      {icon && (
        <div className="absolute right-3 top-3 text-gray-200">{icon}</div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              isTrendGood
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span className="mr-1">
              {isPositiveTrend ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 012 0v5a1 1 0 01-1 1h-5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            {trendDisplay}
          </div>
        )}
      </div>

      <div className="flex items-baseline">
        <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
        {unit && <span className="ml-1 text-gray-500 text-sm">{unit}</span>}
      </div>

      {/* Target progress bar (if target is provided) */}
      {target && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                progressPercentage >= 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-right mt-1 text-gray-500">
            Target: {target}
            {unit}
          </div>
        </div>
      )}

      {/* Info button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Details popup */}
      {showDetails && (
        <div className="absolute inset-0 bg-white p-5 z-10">
          <h3 className="font-bold mb-2">{title} Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            This metric shows your {title.toLowerCase()}.
            {trend !== undefined &&
              ` There has been a ${Math.abs(trend)}% ${
                isPositiveTrend ? "increase" : "decrease"
              } compared to the previous period.`}
            {target && ` Your current target is ${target}${unit}.`}
          </p>
          <button
            onClick={() => setShowDetails(false)}
            className="text-blue-600 text-sm hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
