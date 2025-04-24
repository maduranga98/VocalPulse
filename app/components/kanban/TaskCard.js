"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function TaskCard({ task, onEdit, onView, onDelete }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);

  // Use pre-loaded user data if available, otherwise fetch it
  useEffect(() => {
    const loadAssignedUsers = async () => {
      // If task already has assignedToUsers data, use it
      if (task.assignedToUsers && task.assignedToUsers.length > 0) {
        setAssignedUsers(task.assignedToUsers);
        return;
      }

      // If not, but we have assignedTo IDs, fetch the user data
      if (!task.assignedTo || task.assignedTo.length === 0) return;

      try {
        const userPromises = task.assignedTo.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
          }
          return null;
        });

        const users = await Promise.all(userPromises);
        setAssignedUsers(users.filter((user) => user !== null));
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      }
    };

    loadAssignedUsers();
  }, [task.assignedTo, task.assignedToUsers]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get the call status label
  const getCallStatusLabel = (status) => {
    const statusMap = {
      not_contacted: "Not Contacted",
      not_answered: "Not Answered",
      called_not_listen: "Called but Not Listening",
      in_progress: "In Progress",
      succeeded: "Succeeded",
    };

    return statusMap[status] || status;
  };

  // Get color for call status
  const getCallStatusColor = (status) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_answered":
        return "bg-red-100 text-red-800";
      case "called_not_listen":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="border rounded-lg shadow-sm bg-white p-4 mb-2 cursor-grab"
      draggable
      onClick={() => onView && onView(task)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-base mb-1 flex-grow">{task.title}</h3>

        {(user?.role === "admin" || user?.role === "supervisor") && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card's onClick
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card's onClick
                      onEdit(task);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    role="menuitem"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card's onClick
                      onDelete(task.id);
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    role="menuitem"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer name */}
      {task.customerName && (
        <p className="text-gray-700 text-sm mb-2">
          <span className="font-medium">Customer:</span> {task.customerName}
        </p>
      )}

      {/* Description (shortened) */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {/* Priority tag */}
        {task.priority && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}

        {/* Story points */}
        {task.storyPoints && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {task.storyPoints} {task.storyPoints === 1 ? "Point" : "Points"}
          </span>
        )}

        {/* Call status */}
        {task.callStatus && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${getCallStatusColor(
              task.callStatus
            )}`}
          >
            {getCallStatusLabel(task.callStatus)}
          </span>
        )}
      </div>

      {/* Project types */}
      {task.projectTypes && task.projectTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.projectTypes.slice(0, 2).map((type, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800"
            >
              {type}
            </span>
          ))}

          {task.projectTypes.length > 2 && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              +{task.projectTypes.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Report requested indicator */}
      {task.reportRequested && (
        <div className="mt-2">
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
            Report requested
          </span>
        </div>
      )}

      {/* Assigned users */}
      {assignedUsers.length > 0 && (
        <div className="flex -space-x-2 mt-3">
          {assignedUsers.slice(0, 3).map((assignedUser, index) => (
            <div
              key={index}
              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-white text-xs font-medium"
              title={assignedUser.displayName}
            >
              {assignedUser.displayName
                ? assignedUser.displayName.charAt(0).toUpperCase()
                : "?"}
            </div>
          ))}

          {assignedUsers.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border border-white text-xs">
              +{assignedUsers.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
