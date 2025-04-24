"use client";

import TaskCard from "./TaskCard";
import { useState, useRef } from "react";
import { useKanban } from "@/app/context/KanbanContext";

export default function Column({
  column,
  onTaskEdit,
  onTaskView,
  onTaskDelete,
}) {
  const { moveTask } = useKanban();
  const [isOver, setIsOver] = useState(false);
  const columnRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);

    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumn = e.dataTransfer.getData("sourceColumn");

    if (sourceColumn !== column.id) {
      moveTask(taskId, sourceColumn, column.id);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColumn", column.id);
    // Set a ghost image or styles if needed
  };

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 flex-1 min-w-[18rem] max-w-xs`}
      ref={columnRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs font-medium">
          {column.tasks.length}
        </span>
      </div>

      <div
        className={`min-h-[200px] transition-colors ${
          isOver ? "bg-blue-50" : ""
        }`}
      >
        {column.tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
          >
            <TaskCard
              task={task}
              onEdit={onTaskEdit ? () => onTaskEdit(task) : null}
              onView={() => onTaskView(task)}
              onDelete={onTaskDelete ? () => onTaskDelete(task.id) : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
