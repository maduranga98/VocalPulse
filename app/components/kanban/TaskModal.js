"use client";

import { useState, useEffect } from "react";
import { useKanban } from "@/app/context/KanbanContext";
import { useAuth } from "@/app/context/AuthContext";

export default function TaskModal({ isOpen, onClose, task = null }) {
  const { users, createTask, updateTask, projectTypes } = useKanban();
  const { user } = useAuth();

  // Basic task info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [storyPoints, setStoryPoints] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [webLink, setWebLink] = useState("");
  const [gmbLink, setGmbLink] = useState("");
  const [address, setAddress] = useState("");

  // Project details
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [callStatus, setCallStatus] = useState("not_contacted");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode - Basic info
        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "medium");
        setStoryPoints(task.storyPoints || 1);
        setSelectedUsers(task.assignedTo || []);

        // Customer info
        setCustomerName(task.customerName || "");
        setCustomerMobile(task.customerMobile || "");
        setWebLink(task.webLink || "");
        setGmbLink(task.gmbLink || "");
        setAddress(task.address || "");

        // Project details
        setSelectedProjectTypes(task.projectTypes || []);
        setCallStatus(task.callStatus || "not_contacted");
      } else {
        // Create mode
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStoryPoints(1);
        setSelectedUsers([]);

        // Reset customer info
        setCustomerName("");
        setCustomerMobile("");
        setWebLink("");
        setGmbLink("");
        setAddress("");

        // Reset project details
        setSelectedProjectTypes([]);
        setCallStatus("not_contacted");
      }
      setError("");
      setActiveTab("basic");
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please assign at least one member to this task");
      return;
    }

    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!customerMobile.trim()) {
      setError("Customer mobile number is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        // Basic info
        title,
        description,
        priority,
        storyPoints: Number(storyPoints),
        assignedTo: selectedUsers,

        // Customer info
        customerName,
        customerMobile,
        webLink,
        gmbLink,
        address,

        // Project details
        projectTypes: selectedProjectTypes,
        callStatus,

        // Comments will be stored separately
        comments: task?.comments || [],
      };

      if (task) {
        // Update existing task
        await updateTask(task.id, taskData);
      } else {
        // Create new task
        await createTask(taskData);
      }

      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleProjectTypeSelection = (projectType) => {
    setSelectedProjectTypes((prev) =>
      prev.includes(projectType)
        ? prev.filter((type) => type !== projectType)
        : [...prev, projectType]
    );
  };

  if (!isOpen) return null;

  // Only admin and supervisor can create/edit tasks
  if (user.role !== "admin" && user.role !== "supervisor") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p>Only administrators and supervisors can create or edit tasks.</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define available project types if not provided by context
  const availableProjectTypes = projectTypes || [
    "GMB",
    "CC-P1",
    "CC-P2",
    "CC-P3",
    "Automation",
  ];

  const callStatusOptions = [
    { value: "not_contacted", label: "Not Contacted" },
    { value: "not_answered", label: "Not Answered" },
    { value: "called_not_listen", label: "Called but Not Listening" },
    { value: "in_progress", label: "In Progress" },
    { value: "succeeded", label: "Succeeded" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {task ? "Edit Task" : "Create New Task"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "basic"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "customer"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("customer")}
          >
            Customer Details
          </button>
          <button
            className={`pb-2 px-4 font-medium text-sm ${
              activeTab === "project"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("project")}
          >
            Project Details
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="storyPoints"
                    className="block text-sm font-medium mb-1"
                  >
                    Story Points
                  </label>
                  <input
                    id="storyPoints"
                    type="number"
                    min="1"
                    max="10"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Assign Members *
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.displayName || user.email}
                          {user.role && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({user.role})
                            </span>
                          )}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No users available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Details Tab */}
          {activeTab === "customer" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-medium mb-1"
                  >
                    Customer Name *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="customerMobile"
                    className="block text-sm font-medium mb-1"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="customerMobile"
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label
                    htmlFor="webLink"
                    className="block text-sm font-medium mb-1"
                  >
                    Website Link
                  </label>
                  <input
                    id="webLink"
                    type="url"
                    value={webLink}
                    onChange={(e) => setWebLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="gmbLink"
                    className="block text-sm font-medium mb-1"
                  >
                    GMB Link
                  </label>
                  <input
                    id="gmbLink"
                    type="url"
                    value={gmbLink}
                    onChange={(e) => setGmbLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1"
                >
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Project Details Tab */}
          {activeTab === "project" && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Project Types
                </label>
                <div className="border border-gray-300 rounded-md p-3">
                  {availableProjectTypes.map((projectType) => (
                    <div key={projectType} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`project-${projectType}`}
                        checked={selectedProjectTypes.includes(projectType)}
                        onChange={() => toggleProjectTypeSelection(projectType)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`project-${projectType}`}
                        className="text-sm"
                      >
                        {projectType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="callStatus"
                  className="block text-sm font-medium mb-1"
                >
                  Call Status
                </label>
                <select
                  id="callStatus"
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {callStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <div>
              {activeTab === "basic" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("customer")}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Next: Customer Details
                </button>
              ) : activeTab === "customer" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("project")}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Next: Project Details
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("customer")}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? "Saving..."
                  : task
                  ? "Update Task"
                  : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
