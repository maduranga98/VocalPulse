"use client";

import { useState, useEffect } from "react";
import { useKanban } from "@/app/context/KanbanContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const { updateTask, projectTypes } = useKanban();
  const { user } = useAuth();

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [callStatus, setCallStatus] = useState("");
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [isRequestingReport, setIsRequestingReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (task) {
      setComments(task.comments || []);
      setCallStatus(task.callStatus || "not_contacted");
      setSelectedProjectTypes(task.projectTypes || []);
      setIsRequestingReport(task.reportRequested || false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: new Date().toISOString(),
      };

      // Add comment to Firestore
      await updateDoc(doc(db, "tasks", task.id), {
        comments: arrayUnion(newComment),
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setComments([...comments, newComment]);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsSubmitting(true);

      await updateTask(task.id, {
        callStatus: newStatus,
        updatedAt: serverTimestamp(),
      });

      setCallStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectTypeChange = async (projectType) => {
    try {
      setIsSubmitting(true);

      // Toggle the project type selection
      const updatedProjectTypes = selectedProjectTypes.includes(projectType)
        ? selectedProjectTypes.filter((type) => type !== projectType)
        : [...selectedProjectTypes, projectType];

      setSelectedProjectTypes(updatedProjectTypes);

      await updateTask(task.id, {
        projectTypes: updatedProjectTypes,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating project types:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportRequest = async () => {
    try {
      setIsSubmitting(true);

      await updateTask(task.id, {
        reportRequested: !isRequestingReport,
        updatedAt: serverTimestamp(),
      });

      setIsRequestingReport(!isRequestingReport);
    } catch (error) {
      console.error("Error requesting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const callStatusOptions = [
    { value: "not_contacted", label: "Not Contacted" },
    { value: "not_answered", label: "Not Answered" },
    { value: "called_not_listen", label: "Called but Not Listening" },
    { value: "in_progress", label: "In Progress" },
    { value: "succeeded", label: "Succeeded" },
  ];

  const getStatusLabel = (statusValue) => {
    const status = callStatusOptions.find(
      (option) => option.value === statusValue
    );
    return status ? status.label : statusValue;
  };

  const getPriorityLabel = (priority) => {
    const priorityColors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          priorityColors[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Task Details
          </button>
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "customer"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("customer")}
          >
            Customer Info
          </button>
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "comments"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </button>
        </div>

        {/* Task Details Tab */}
        {activeTab === "details" && (
          <div>
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Priority
                  </h3>
                  <div>{getPriorityLabel(task.priority || "medium")}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Story Points
                  </h3>
                  <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                    {task.storyPoints || 0}{" "}
                    {task.storyPoints === 1 ? "Point" : "Points"}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h3>
                  <select
                    value={callStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    {callStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Project Types
                  </h3>
                  <div className="mt-2 border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                    {projectTypes.map((type) => (
                      <div key={type} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`project-${type}`}
                          checked={selectedProjectTypes.includes(type)}
                          onChange={() => handleProjectTypeChange(type)}
                          className="mr-2"
                          disabled={isSubmitting}
                        />
                        <label htmlFor={`project-${type}`} className="text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {task.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Assigned Members
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.assignedToUsers && task.assignedToUsers.length > 0 ? (
                    task.assignedToUsers.map((assignedUser) => (
                      <div
                        key={assignedUser.id}
                        className="flex items-center bg-gray-100 rounded-full pl-1 pr-3 py-1"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          {assignedUser.displayName
                            ? assignedUser.displayName.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <span className="text-sm">
                          {assignedUser.displayName || assignedUser.email}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No assigned members
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <button
                  onClick={handleReportRequest}
                  className={`px-4 py-2 rounded-md ${
                    isRequestingReport
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  disabled={isSubmitting}
                >
                  {isRequestingReport
                    ? "Cancel Report Request"
                    : "Request Report"}
                </button>

                {isRequestingReport && (
                  <p className="mt-2 text-sm text-gray-600">
                    A report has been requested for this task.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Info Tab */}
        {activeTab === "customer" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Customer Name
                </h3>
                <p className="font-medium">{task.customerName || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Mobile Number
                </h3>
                <p className="font-medium">
                  {task.customerMobile ? (
                    <a
                      href={`tel:${task.customerMobile}`}
                      className="text-blue-600 hover:underline"
                    >
                      {task.customerMobile}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              {task.webLink && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Website
                  </h3>
                  <a
                    href={task.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {task.webLink}
                  </a>
                </div>
              )}

              {task.gmbLink && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    GMB Link
                  </h3>
                  <a
                    href={task.gmbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {task.gmbLink}
                  </a>
                </div>
              )}
            </div>

            {task.address && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Address
                </h3>
                <p className="whitespace-pre-wrap">{task.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div>
            <div className="mb-6">
              <form
                onSubmit={handleAddComment}
                className="flex items-start gap-2"
              >
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                    isSubmitting || !comment.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  Post
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No comments yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
