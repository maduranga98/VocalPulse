"use client";

import { useState } from "react";
import { useKanban } from "@/app/context/KanbanContext";
import { useAuth } from "@/app/context/AuthContext";
import Column from "./Column";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";

export default function Board() {
  const { columns, loading, error, deleteTask } = useKanban();
  const { user } = useAuth();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>

        {(user?.role === "admin" || user?.role === "supervisor") && (
          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Task
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.values(columns).map((column) => (
          <Column
            key={column.id}
            column={column}
            onTaskEdit={
              user?.role === "admin" || user?.role === "supervisor"
                ? handleEditTask
                : null
            }
            onTaskView={handleViewTask}
            onTaskDelete={
              user?.role === "admin" || user?.role === "supervisor"
                ? handleDeleteTask
                : null
            }
          />
        ))}
      </div>

      {/* Edit/Create Task Modal (Admin/Supervisor only) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />

      {/* View Task Details Modal (All users) */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
