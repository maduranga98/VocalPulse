"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "./AuthContext";

const AttendanceContext = createContext({});

export const AttendanceProvider = ({ children }) => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);

  const { user } = useAuth();

  // Get today's date at midnight (for querying)
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate duration between two timestamps in hours
  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const start =
      startTime instanceof Timestamp ? startTime.toDate() : new Date(startTime);
    const end =
      endTime instanceof Timestamp ? endTime.toDate() : new Date(endTime);

    // Duration in milliseconds
    const durationMs = end - start;

    // Convert to hours (rounded to 2 decimal places)
    return Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
  };

  // Function to check if user is currently clocked in
  const isUserClockedIn = () => {
    return todayRecord && todayRecord.clockInTime && !todayRecord.clockOutTime;
  };

  // Get user's current attendance record for today
  const fetchTodayAttendance = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const today = getTodayDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayTimestamp = Timestamp.fromDate(today);
      const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

      const attendanceQuery = query(
        collection(db, "attendanceRecords"),
        where("userId", "==", user.uid),
        where("date", ">=", todayTimestamp),
        where("date", "<", tomorrowTimestamp),
        limit(1)
      );

      const querySnapshot = await getDocs(attendanceQuery);

      if (!querySnapshot.empty) {
        const recordDoc = querySnapshot.docs[0];
        setTodayRecord({
          id: recordDoc.id,
          ...recordDoc.data(),
        });
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance history for the current user
  const fetchAttendanceHistory = async (daysLimit = 30) => {
    if (!user) return;

    setLoading(true);

    try {
      const historyLimit = new Date();
      historyLimit.setDate(historyLimit.getDate() - daysLimit);

      const historyQuery = query(
        collection(db, "attendanceRecords"),
        where("userId", "==", user.uid),
        where("date", ">=", Timestamp.fromDate(historyLimit)),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(historyQuery);

      const history = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Add formatted values for UI display
        formattedDate: doc.data().date.toDate().toLocaleDateString(),
        clockInFormatted: formatTime(doc.data().clockInTime),
        clockOutFormatted: formatTime(doc.data().clockOutTime),
        hoursWorked: calculateHours(
          doc.data().clockInTime,
          doc.data().clockOutTime
        ),
      }));

      setAttendanceHistory(history);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setError("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  // Clock in function
  const clockIn = async (location = null) => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if already clocked in today
      if (todayRecord && todayRecord.clockInTime && !todayRecord.clockOutTime) {
        throw new Error("You are already clocked in");
      }

      const now = new Date();
      const today = getTodayDate();

      // Define the new record
      const attendanceRecord = {
        userId: user.uid,
        userName: user.displayName || user.email,
        date: Timestamp.fromDate(today),
        clockInTime: Timestamp.fromDate(now),
        clockOutTime: null,
        status: "present",
        location: location,
        createdAt: serverTimestamp(),
      };

      // Add the record to Firestore
      const docRef = await addDoc(
        collection(db, "attendanceRecords"),
        attendanceRecord
      );

      // Update the local state
      setTodayRecord({
        id: docRef.id,
        ...attendanceRecord,
        clockInTime: now, // Use JavaScript Date for local state
      });

      // Reload the attendance history
      fetchAttendanceHistory();

      return docRef.id;
    } catch (err) {
      console.error("Error clocking in:", err);
      setError(err.message || "Failed to clock in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clock out function
  const clockOut = async (location = null) => {
    if (!user || !todayRecord || !todayRecord.id) return;

    try {
      setLoading(true);

      // Check if already clocked out
      if (todayRecord.clockOutTime) {
        throw new Error("You have already clocked out");
      }

      const now = new Date();

      // Calculate total hours
      const clockInTime =
        todayRecord.clockInTime instanceof Timestamp
          ? todayRecord.clockInTime.toDate()
          : new Date(todayRecord.clockInTime);

      const totalHours = calculateHours(clockInTime, now);

      // Update the record in Firestore
      await updateDoc(doc(db, "attendanceRecords", todayRecord.id), {
        clockOutTime: Timestamp.fromDate(now),
        totalHours: totalHours,
        location: location || todayRecord.location,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setTodayRecord({
        ...todayRecord,
        clockOutTime: now,
        totalHours: totalHours,
      });

      // Reload attendance history
      fetchAttendanceHistory();
    } catch (err) {
      console.error("Error clocking out:", err);
      setError(err.message || "Failed to clock out");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave requests for the current user
  const fetchUserLeaveRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const leaveQuery = query(
        collection(db, "leaveRequests"),
        where("userId", "==", user.uid),
        orderBy("requestedAt", "desc")
      );

      const querySnapshot = await getDocs(leaveQuery);

      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Format dates for display
        startDateFormatted: doc.data().startDate.toDate().toLocaleDateString(),
        endDateFormatted: doc.data().endDate.toDate().toLocaleDateString(),
      }));

      setLeaveRequests(requests);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  // Request leave
  const requestLeave = async (leaveData) => {
    if (!user) return;

    try {
      setLoading(true);

      // Create leave request
      const leaveRequest = {
        userId: user.uid,
        userName: user.displayName || user.email,
        startDate: Timestamp.fromDate(new Date(leaveData.startDate)),
        endDate: Timestamp.fromDate(new Date(leaveData.endDate)),
        type: leaveData.type,
        reason: leaveData.reason,
        status: "pending",
        requestedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "leaveRequests"),
        leaveRequest
      );

      // Reload leave requests
      fetchUserLeaveRequests();

      return docRef.id;
    } catch (err) {
      console.error("Error requesting leave:", err);
      setError("Failed to submit leave request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // For Admin/Supervisor: Fetch team attendance for today
  const fetchTeamAttendance = async () => {
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
      return;
    }

    try {
      setLoading(true);

      const today = getTodayDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendanceQuery = query(
        collection(db, "attendanceRecords"),
        where("date", ">=", Timestamp.fromDate(today)),
        where("date", "<", Timestamp.fromDate(tomorrow))
      );

      const querySnapshot = await getDocs(attendanceQuery);

      // Get unique user IDs from attendance records
      const userIds = new Set();
      const attendanceMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userIds.add(data.userId);
        attendanceMap[data.userId] = {
          id: doc.id,
          ...data,
        };
      });

      // Fetch all users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      const teamAttendanceData = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        const attendanceRecord = attendanceMap[doc.id] || null;

        return {
          userId: doc.id,
          name: userData.displayName || userData.email,
          role: userData.role,
          status: attendanceRecord ? attendanceRecord.status : "absent",
          clockInTime: attendanceRecord
            ? formatTime(attendanceRecord.clockInTime)
            : null,
          clockOutTime: attendanceRecord
            ? formatTime(attendanceRecord.clockOutTime)
            : null,
          hoursWorked: attendanceRecord
            ? calculateHours(
                attendanceRecord.clockInTime,
                attendanceRecord.clockOutTime
              )
            : 0,
        };
      });

      setTeamAttendance(teamAttendanceData);
    } catch (err) {
      console.error("Error fetching team attendance:", err);
      setError("Failed to load team attendance");
    } finally {
      setLoading(false);
    }
  };

  // For Admin/Supervisor: Handle leave requests
  const processLeaveRequest = async (requestId, approved) => {
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
      throw new Error("Only admins and supervisors can process leave requests");
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "leaveRequests", requestId), {
        status: approved ? "approved" : "rejected",
        approvedBy: user.uid,
        approverName: user.displayName || user.email,
        processedAt: serverTimestamp(),
      });

      // Also update the local state if this request was in the list
      setLeaveRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: approved ? "approved" : "rejected",
                approvedBy: user.uid,
                approverName: user.displayName || user.email,
              }
            : req
        )
      );
    } catch (err) {
      console.error("Error processing leave request:", err);
      setError("Failed to process leave request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // For Admin: Get all leave requests
  const fetchAllLeaveRequests = async (status = null) => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can view all leave requests");
    }

    try {
      setLoading(true);

      let leaveQuery;

      if (status) {
        leaveQuery = query(
          collection(db, "leaveRequests"),
          where("status", "==", status),
          orderBy("requestedAt", "desc")
        );
      } else {
        leaveQuery = query(
          collection(db, "leaveRequests"),
          orderBy("requestedAt", "desc")
        );
      }

      const querySnapshot = await getDocs(leaveQuery);

      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDateFormatted: doc.data().startDate.toDate().toLocaleDateString(),
        endDateFormatted: doc.data().endDate.toDate().toLocaleDateString(),
        requestedAtFormatted: doc.data().requestedAt
          ? doc.data().requestedAt.toDate().toLocaleDateString()
          : "N/A",
      }));

      return requests;
    } catch (err) {
      console.error("Error fetching all leave requests:", err);
      setError("Failed to load leave requests");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load data when user authentication changes
  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
      fetchUserLeaveRequests();

      // Load admin data if applicable
      if (user.role === "admin" || user.role === "supervisor") {
        fetchTeamAttendance();
      }
    } else {
      setTodayRecord(null);
      setAttendanceHistory([]);
      setLeaveRequests([]);
      setTeamAttendance([]);
    }
  }, [user]);

  const value = {
    // State
    todayRecord,
    attendanceHistory,
    leaveRequests,
    teamAttendance,
    loading,
    error,

    // Basic attendance functions
    clockIn,
    clockOut,
    isUserClockedIn,
    fetchTodayAttendance,
    fetchAttendanceHistory,

    // Leave management
    requestLeave,
    fetchUserLeaveRequests,

    // Admin functions
    fetchTeamAttendance,
    processLeaveRequest,
    fetchAllLeaveRequests,

    // Helper functions
    formatTime,
    calculateHours,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  return useContext(AttendanceContext);
};
