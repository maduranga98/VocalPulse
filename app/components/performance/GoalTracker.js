"use client";

import { useState } from "react";

export default function GoalTracker({ goals }) {
  const [expandedGoal, setExpandedGoal] = useState(null);

  // Toggle goal details
  const toggleGoalDetails = (goalId) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };

  // Sort goals by completion percentage (descending)
  const sortedGoals = [...goals].sort((a, b) => {
    const aCompletion = (a.current / a.target) * 100;
    const bCompletion = (b.current / b.target) * 100;
    return bCompletion - aCompletion;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-medium mb-4">Goals & Targets</h3>

      {sortedGoals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No goals have been set</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGoals.map((goal) => {
            const completionPercentage = Math.min(
              Math.round((goal.current / goal.target) * 100),
              100
            );
            const isCompleted = completionPercentage >= 100;
            const isExpanded = expandedGoal === goal.id;

            return (
              <div
                key={goal.id}
                className={`border rounded-lg p-4 ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <div className="flex items-center">
                    {isCompleted && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                        Completed!
                      </span>
                    )}
                    <button
                      onClick={() => toggleGoalDetails(goal.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {isExpanded ? (
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isCompleted ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                    <span>
                      Current: {goal.current} {goal.unit}
                    </span>
                    <span>
                      Target: {goal.target} {goal.unit}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{goal.startDate}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{goal.endDate}</span>
                      </div>
                      {goal.rewards && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reward:</span>
                          <span className="font-medium">{goal.rewards}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
