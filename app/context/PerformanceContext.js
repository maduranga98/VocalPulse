"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "./AuthContext";

const PerformanceContext = createContext({});

export const PerformanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for various performance data
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [userGoals, setUserGoals] = useState([]);
  const [teamComparison, setTeamComparison] = useState(null);

  // Fetch user's daily performance stats
  const fetchDailyStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get yesterday's date (start of day)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Query performance records for today
      const performanceQuery = query(
        collection(db, "performanceMetrics"),
        where("userId", "==", user.uid),
        where("date", ">=", Timestamp.fromDate(today)),
        orderBy("date", "desc"),
        limit(1)
      );

      const yesterdayQuery = query(
        collection(db, "performanceMetrics"),
        where("userId", "==", user.uid),
        where("date", ">=", Timestamp.fromDate(yesterday)),
        where("date", "<", Timestamp.fromDate(today)),
        orderBy("date", "desc"),
        limit(1)
      );

      // Execute both queries
      const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
        getDocs(performanceQuery),
        getDocs(yesterdayQuery),
      ]);

      // Process today's data
      let todayData = null;
      if (!todaySnapshot.empty) {
        const doc = todaySnapshot.docs[0];
        todayData = { id: doc.id, ...doc.data() };
      }

      // Process yesterday's data for trends
      let yesterdayData = null;
      if (!yesterdaySnapshot.empty) {
        const doc = yesterdaySnapshot.docs[0];
        yesterdayData = { id: doc.id, ...doc.data() };
      }

      // Calculate trends
      const stats = processDailyStats(todayData, yesterdayData);
      setDailyStats(stats);
    } catch (err) {
      console.error("Error fetching daily stats:", err);
      setError("Failed to load daily performance metrics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's weekly performance stats
  const fetchWeeklyStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get start of current week and previous week
      const now = new Date();
      const startOfWeek = getStartOfWeek(now);
      const startOfPrevWeek = new Date(startOfWeek);
      startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

      // Query for current week stats
      const weekQuery = query(
        collection(db, "weeklyPerformance"),
        where("userId", "==", user.uid),
        where("weekStart", ">=", Timestamp.fromDate(startOfWeek)),
        limit(1)
      );

      // Query for previous week stats
      const prevWeekQuery = query(
        collection(db, "weeklyPerformance"),
        where("userId", "==", user.uid),
        where("weekStart", ">=", Timestamp.fromDate(startOfPrevWeek)),
        where("weekStart", "<", Timestamp.fromDate(startOfWeek)),
        limit(1)
      );

      // Execute both queries
      const [weekSnapshot, prevWeekSnapshot] = await Promise.all([
        getDocs(weekQuery),
        getDocs(prevWeekQuery),
      ]);

      // Process current week data
      let weekData = null;
      if (!weekSnapshot.empty) {
        const doc = weekSnapshot.docs[0];
        weekData = { id: doc.id, ...doc.data() };
      }

      // Process previous week data for trends
      let prevWeekData = null;
      if (!prevWeekSnapshot.empty) {
        const doc = prevWeekSnapshot.docs[0];
        prevWeekData = { id: doc.id, ...doc.data() };
      }

      // Calculate trends and process data
      const stats = processWeeklyStats(weekData, prevWeekData);
      setWeeklyStats(stats);
    } catch (err) {
      console.error("Error fetching weekly stats:", err);
      setError("Failed to load weekly performance metrics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's monthly performance stats
  const fetchMonthlyStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get start of current month and previous month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      // Query for current month stats
      const monthQuery = query(
        collection(db, "monthlyPerformance"),
        where("userId", "==", user.uid),
        where("monthStart", ">=", Timestamp.fromDate(startOfMonth)),
        limit(1)
      );

      // Query for previous month stats
      const prevMonthQuery = query(
        collection(db, "monthlyPerformance"),
        where("userId", "==", user.uid),
        where("monthStart", ">=", Timestamp.fromDate(startOfPrevMonth)),
        where("monthStart", "<", Timestamp.fromDate(startOfMonth)),
        limit(1)
      );

      // Execute both queries
      const [monthSnapshot, prevMonthSnapshot] = await Promise.all([
        getDocs(monthQuery),
        getDocs(prevMonthQuery),
      ]);

      // Process current month data
      let monthData = null;
      if (!monthSnapshot.empty) {
        const doc = monthSnapshot.docs[0];
        monthData = { id: doc.id, ...doc.data() };
      }

      // Process previous month data for trends
      let prevMonthData = null;
      if (!prevMonthSnapshot.empty) {
        const doc = prevMonthSnapshot.docs[0];
        prevMonthData = { id: doc.id, ...doc.data() };
      }

      // Calculate trends and process data
      const stats = processMonthlyStats(monthData, prevMonthData);
      setMonthlyStats(stats);
    } catch (err) {
      console.error("Error fetching monthly stats:", err);
      setError("Failed to load monthly performance metrics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's goals
  const fetchUserGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const goalsQuery = query(
        collection(db, "goals"),
        where("userId", "==", user.uid),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(goalsQuery);

      const goals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate
          ? doc.data().startDate.toDate().toLocaleDateString()
          : null,
        endDate: doc.data().endDate
          ? doc.data().endDate.toDate().toLocaleDateString()
          : null,
      }));

      setUserGoals(goals);
    } catch (err) {
      console.error("Error fetching user goals:", err);
      setError("Failed to load user goals");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team comparison data
  const fetchTeamComparison = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get the user's team/department
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const teamId = userData?.teamId;

      if (!teamId) {
        console.log("User has no team assigned");
        return;
      }

      // Get team averages document
      const teamStatsDoc = await getDoc(doc(db, "teamStats", teamId));

      if (!teamStatsDoc.exists()) {
        console.log("No team statistics found");
        return;
      }

      const teamStats = teamStatsDoc.data();

      // Get user's most recent performance metrics for comparison
      const userStatsQuery = query(
        collection(db, "performanceMetrics"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(1)
      );

      const userStatsSnapshot = await getDocs(userStatsQuery);

      if (userStatsSnapshot.empty) {
        console.log("No user performance metrics found");
        return;
      }

      const userMetrics = userStatsSnapshot.docs[0].data();

      // Build comparison metrics
      const comparisonMetrics = buildTeamComparison(userMetrics, teamStats);
      setTeamComparison(comparisonMetrics);
    } catch (err) {
      console.error("Error fetching team comparison:", err);
      setError("Failed to load team comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for processing data
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Set to previous Sunday (or current day if it's Sunday)
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const processDailyStats = (todayData, yesterdayData) => {
    // If no data exists, return placeholder data
    if (!todayData) {
      return {
        date: new Date().toISOString().split("T")[0],
        kpis: [],
        charts: [],
      };
    }

    // Calculate trends if yesterday's data exists
    const calculateTrend = (today, yesterday) => {
      if (!yesterday) return 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };

    // Process KPIs
    const kpis = [
      {
        id: "calls",
        title: "Total Calls",
        value: todayData.callsHandled || 0,
        trend: calculateTrend(
          todayData.callsHandled || 0,
          yesterdayData?.callsHandled || 0
        ),
        target: todayData.callsTarget || 20,
        iconPath:
          "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      },
      {
        id: "resolution",
        title: "Resolution Rate",
        value: todayData.resolutionRate || 0,
        trend: calculateTrend(
          todayData.resolutionRate || 0,
          yesterdayData?.resolutionRate || 0
        ),
        target: todayData.resolutionTarget || 85,
        unit: "%",
        iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      {
        id: "avgTime",
        title: "Avg. Call Time",
        value: todayData.avgCallDuration || 0,
        trend:
          calculateTrend(
            todayData.avgCallDuration || 0,
            yesterdayData?.avgCallDuration || 0
          ) * -1, // Inverse trend as lower is better
        target: todayData.callTimeTarget || 180,
        unit: "s",
        iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      {
        id: "satisfaction",
        title: "Satisfaction",
        value: todayData.satisfactionScore || 0,
        trend: calculateTrend(
          todayData.satisfactionScore || 0,
          yesterdayData?.satisfactionScore || 0
        ),
        target: todayData.satisfactionTarget || 90,
        unit: "%",
        iconPath:
          "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M7 16a6 6 0 110-12 6 6 0 010 12z",
      },
    ];

    // Process chart data
    const charts = [
      {
        id: "callsChart",
        title: "Calls Handled",
        type: "line",
        data: todayData.callsTimeline || [],
      },
      {
        id: "resolutionChart",
        title: "Resolution Rate Over Time",
        type: "line",
        data: todayData.resolutionTimeline || [],
      },
    ];

    return {
      date: todayData.date
        ? todayData.date.toDate().toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      kpis,
      charts,
    };
  };

  const processWeeklyStats = (weekData, prevWeekData) => {
    // Similar processing logic as daily stats, but for weekly data
    // Implement based on your specific weekly metrics structure

    // Placeholder implementation
    if (!weekData) {
      return {
        weekStart: new Date().toISOString().split("T")[0],
        kpis: [],
        charts: [],
      };
    }

    // Calculate trends
    const calculateTrend = (current, previous) => {
      if (!previous) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Process weekly KPIs
    // ... implement based on your data model

    // This is just placeholder data
    return {
      weekStart: weekData.weekStart
        ? weekData.weekStart.toDate().toISOString().split("T")[0]
        : null,
      kpis: [],
      charts: [],
    };
  };

  const processMonthlyStats = (monthData, prevMonthData) => {
    // Similar processing logic as daily/weekly stats, but for monthly data
    // Implement based on your specific monthly metrics structure

    // Placeholder implementation
    if (!monthData) {
      return {
        monthStart: new Date().toISOString().split("T")[0],
        kpis: [],
        charts: [],
      };
    }

    // Calculate trends
    const calculateTrend = (current, previous) => {
      if (!previous) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Process monthly KPIs
    // ... implement based on your data model

    // This is just placeholder data
    return {
      monthStart: monthData.monthStart
        ? monthData.monthStart.toDate().toISOString().split("T")[0]
        : null,
      kpis: [],
      charts: [],
    };
  };

  const buildTeamComparison = (userMetrics, teamStats) => {
    // Build comparison between user metrics and team averages
    // Placeholder implementation
    return {
      metrics: [
        {
          id: "callsHandled",
          name: "Calls Handled",
          userValue: userMetrics.callsHandled || 0,
          teamAverage: teamStats.avgCallsHandled || 0,
          unit: "",
          higherIsBetter: true,
          description: "Number of calls handled compared to team average",
        },
        {
          id: "resolutionRate",
          name: "Resolution Rate",
          userValue: userMetrics.resolutionRate || 0,
          teamAverage: teamStats.avgResolutionRate || 0,
          unit: "%",
          higherIsBetter: true,
          description: "Percentage of calls resolved on first contact",
        },
        {
          id: "callDuration",
          name: "Avg. Call Duration",
          userValue: userMetrics.avgCallDuration || 0,
          teamAverage: teamStats.avgCallDuration || 0,
          unit: "s",
          higherIsBetter: false, // Lower is better for call duration
          description: "Average time spent on each call",
        },
        {
          id: "satisfaction",
          name: "Customer Satisfaction",
          userValue: userMetrics.satisfactionScore || 0,
          teamAverage: teamStats.avgSatisfactionScore || 0,
          unit: "%",
          higherIsBetter: true,
          description: "Average customer satisfaction rating",
        },
      ],
    };
  };

  // Load performance data when user authentication changes
  useEffect(() => {
    if (user) {
      fetchDailyStats();
      fetchWeeklyStats();
      fetchMonthlyStats();
      fetchUserGoals();
      fetchTeamComparison();
    } else {
      setDailyStats(null);
      setWeeklyStats(null);
      setMonthlyStats(null);
      setUserGoals([]);
      setTeamComparison(null);
    }
  }, [user]);

  // Combine all data for the dashboard
  const getAllPerformanceData = () => {
    return {
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
      goals: userGoals,
      teamComparison: teamComparison,
    };
  };

  const value = {
    // State
    dailyStats,
    weeklyStats,
    monthlyStats,
    userGoals,
    teamComparison,
    loading,
    error,

    // Fetch functions
    fetchDailyStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchUserGoals,
    fetchTeamComparison,

    // Helper functions
    getAllPerformanceData,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  return useContext(PerformanceContext);
};
