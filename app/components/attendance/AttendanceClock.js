"use client";

import { useState, useEffect } from "react";
import { useAttendance } from "@/app/context/AttendanceContext";

export default function AttendanceClock() {
  const {
    todayRecord,
    loading,
    error,
    clockIn,
    clockOut,
    isUserClockedIn,
    fetchTodayAttendance,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [clockError, setClockError] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format current time as HH:MM:SS
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString();
  };

  // Format date as Day, Month Date, Year
  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle clock in button
  const handleClockIn = async () => {
    setClockError(null);
    setIsClockingIn(true);

    try {
      // Get user's current location if available
      let location = null;

      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });

          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
        }
      } catch (locationError) {
        console.log("Location not available:", locationError);
        // Continue without location
      }

      await clockIn(location);
    } catch (err) {
      setClockError(err.message || "Failed to clock in");
    } finally {
      setIsClockingIn(false);
    }
  };

  // Handle clock out button
  const handleClockOut = async () => {
    setClockError(null);
    setIsClockingOut(true);

    try {
      // Get user's current location if available
      let location = null;

      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });

          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
        }
      } catch (locationError) {
        console.log("Location not available:", locationError);
        // Continue without location
      }

      await clockOut(location);
    } catch (err) {
      setClockError(err.message || "Failed to clock out");
    } finally {
      setIsClockingOut(false);
    }
  };

  // Refresh attendance data
  const refreshAttendance = () => {
    setClockError(null);
    fetchTodayAttendance();
  };

  // Format clock in/out times
  const formatAttendanceTime = (timestamp) => {
    if (!timestamp) return "Not recorded";

    try {
      // Handle Firestore Timestamp objects
      if (timestamp && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      // Handle Date objects or ISO strings
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", timestamp);
        return "Invalid time format";
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time formatting error";
    }
  };

  // Calculate worked hours
  const getWorkedHours = () => {
    if (!todayRecord || !todayRecord.clockInTime) return 0;

    try {
      let clockInTime;
      let clockOutTime;

      // Handle Firestore Timestamp objects
      if (
        todayRecord.clockInTime &&
        typeof todayRecord.clockInTime.toDate === "function"
      ) {
        clockInTime = todayRecord.clockInTime.toDate();
      } else {
        clockInTime =
          todayRecord.clockInTime instanceof Date
            ? todayRecord.clockInTime
            : new Date(todayRecord.clockInTime);
      }

      if (todayRecord.clockOutTime) {
        if (typeof todayRecord.clockOutTime.toDate === "function") {
          clockOutTime = todayRecord.clockOutTime.toDate();
        } else {
          clockOutTime =
            todayRecord.clockOutTime instanceof Date
              ? todayRecord.clockOutTime
              : new Date(todayRecord.clockOutTime);
        }
      } else {
        clockOutTime = new Date();
      }

      // Validate dates
      if (isNaN(clockInTime.getTime()) || isNaN(clockOutTime.getTime())) {
        console.error("Invalid date in calculation:", {
          clockInTime,
          clockOutTime,
          originalClockIn: todayRecord.clockInTime,
          originalClockOut: todayRecord.clockOutTime,
        });
        return "0.00";
      }

      const diffMs = clockOutTime - clockInTime;
      const diffHrs = diffMs / (1000 * 60 * 60);

      return Math.max(0, diffHrs).toFixed(2);
    } catch (error) {
      console.error("Error calculating hours:", error);
      return "0.00";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {formatCurrentTime()}
        </h2>
        <p className="text-gray-600">{formatCurrentDate()}</p>
      </div>

      {clockError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{clockError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setClockError(null)}
          >
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">
              {isUserClockedIn() ? (
                <span className="text-green-600">Clocked In</span>
              ) : todayRecord && todayRecord.clockOutTime ? (
                <span className="text-blue-600">Clocked Out</span>
              ) : (
                <span className="text-gray-600">Not Clocked In</span>
              )}
            </span>
          </div>

          {todayRecord && todayRecord.clockInTime && (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Clock In:</span>
                <span className="font-medium">
                  {formatAttendanceTime(todayRecord.clockInTime)}
                </span>
              </div>

              {todayRecord.clockOutTime && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Clock Out:</span>
                  <span className="font-medium">
                    {formatAttendanceTime(todayRecord.clockOutTime)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Hours Worked:</span>
                <span className="font-medium">{getWorkedHours()} hrs</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClockIn}
          disabled={
            loading ||
            isClockingIn ||
            isUserClockedIn() ||
            (todayRecord && todayRecord.clockOutTime)
          }
          className={`flex-1 py-3 rounded-md flex justify-center items-center ${
            loading ||
            isClockingIn ||
            isUserClockedIn() ||
            (todayRecord && todayRecord.clockOutTime)
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isClockingIn ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : null}
          Clock In
        </button>

        <button
          onClick={handleClockOut}
          disabled={loading || isClockingOut || !isUserClockedIn()}
          className={`flex-1 py-3 rounded-md flex justify-center items-center ${
            loading || isClockingOut || !isUserClockedIn()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isClockingOut ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : null}
          Clock Out
        </button>

        <button
          onClick={refreshAttendance}
          disabled={loading}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-md"
          title="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
