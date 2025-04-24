"use client";

import { useState, useEffect } from "react";
import { useAttendance } from "@/app/context/AttendanceContext";
import { useAuth } from "@/app/context/AuthContext";

export default function LeaveApprovals() {
  const { fetchAllLeaveRequests, processLeaveRequest } = useAttendance();
  const { user } = useAuth();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadLeaveRequests();
    }
  }, [user, statusFilter]);

  const loadLeaveRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const requests = await fetchAllLeaveRequests(statusFilter);
      setLeaveRequests(requests);
    } catch (err) {
      setError("Failed to load leave requests: " + err.message);
      console.error("Error loading leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await processLeaveRequest(requestId, true);
      // Remove the approved request from the list if filtering by pending
      if (statusFilter === "pending") {
        setLeaveRequests(leaveRequests.filter((req) => req.id !== requestId));
      } else {
        // Otherwise refresh the list
        await loadLeaveRequests();
      }
    } catch (err) {
      setError("Failed to approve request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await processLeaveRequest(requestId, false);
      // Remove the rejected request from the list if filtering by pending
      if (statusFilter === "pending") {
        setLeaveRequests(leaveRequests.filter((req) => req.id !== requestId));
      } else {
        // Otherwise refresh the list
        await loadLeaveRequests();
      }
    } catch (err) {
      setError("Failed to reject request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatLeaveType = (type) => {
    switch (type) {
      case "vacation":
        return "Vacation";
      case "sick":
        return "Sick Leave";
      case "personal":
        return "Personal Leave";
      case "family":
        return "Family Emergency";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Access denied. Only administrators can approve leave requests.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Leave Requests</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="statusFilter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All Requests</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : leaveRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {statusFilter ? `${statusFilter} ` : ""}leave requests found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                {statusFilter === "pending" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLeaveType(request.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.startDateFormatted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.endDateFormatted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {request.reason}
                  </td>
                  {statusFilter === "pending" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                          className={`text-green-600 hover:text-green-900 ${
                            processingId === request.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {processingId === request.id
                            ? "Processing..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                          className={`text-red-600 hover:text-red-900 ${
                            processingId === request.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {processingId === request.id
                            ? "Processing..."
                            : "Reject"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
