"use client";

export default function TeamComparison({ metrics, userName }) {
  // Check if we have metrics data
  if (!metrics || !metrics.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="text-lg font-medium mb-4">Team Comparison</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No comparison data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-medium mb-6">How You Compare to Team</h3>

      <div className="space-y-6">
        {metrics.map((metric) => {
          // Calculate where the user falls in relation to team average
          const userPercentOfAvg =
            (metric.userValue / metric.teamAverage) * 100;
          const position = Math.min(Math.max(userPercentOfAvg, 0), 200);
          const isHigherBetter = metric.higherIsBetter !== false;

          // Determine if the user's performance is good, average, or needs improvement
          let performanceClass;
          if (isHigherBetter) {
            performanceClass =
              position > 110
                ? "text-green-600"
                : position < 90
                ? "text-red-600"
                : "text-yellow-600";
          } else {
            performanceClass =
              position < 90
                ? "text-green-600"
                : position > 110
                ? "text-red-600"
                : "text-yellow-600";
          }

          return (
            <div key={metric.id} className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">{metric.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Your value:</span>
                  <span className={`font-medium ${performanceClass}`}>
                    {metric.userValue}
                    {metric.unit}
                  </span>
                </div>
              </div>

              {/* Visual scale */}
              <div className="relative h-10 bg-gray-100 rounded-lg mb-2">
                {/* Team average marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 z-10">
                  <div className="absolute -top-3 -left-[3.5rem] w-28 text-center">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Team Avg: {metric.teamAverage}
                      {metric.unit}
                    </span>
                  </div>
                </div>

                {/* User position marker */}
                <div
                  className="absolute top-0 h-10 flex items-center"
                  style={{ left: `${position / 2}%` }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white border-2 ${performanceClass.replace(
                      "text-",
                      "border-"
                    )} z-20 flex items-center justify-center`}
                  >
                    <span className="text-xs font-bold">
                      {userName ? userName.charAt(0).toUpperCase() : "Y"}
                    </span>
                  </div>
                </div>

                {/* Scale zones */}
                {isHigherBetter ? (
                  <>
                    <div className="absolute top-0 left-0 bottom-0 w-[45%] bg-red-100 rounded-l-lg"></div>
                    <div className="absolute top-0 left-[45%] bottom-0 w-[10%] bg-yellow-100"></div>
                    <div className="absolute top-0 left-[55%] bottom-0 w-[45%] bg-green-100 rounded-r-lg"></div>
                  </>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 bottom-0 w-[45%] bg-green-100 rounded-l-lg"></div>
                    <div className="absolute top-0 left-[45%] bottom-0 w-[10%] bg-yellow-100"></div>
                    <div className="absolute top-0 left-[55%] bottom-0 w-[45%] bg-red-100 rounded-r-lg"></div>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
