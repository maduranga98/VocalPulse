"use client";

import { useState, useRef, useEffect } from "react";

export default function MemberSelector({ users, selectedUserIds, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredUsers = searchTerm.trim()
    ? users.filter(
        (user) =>
          (user.displayName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleUserSelection = (userId) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];

    onChange(newSelection);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-md p-2 flex flex-wrap items-center gap-2 min-h-10 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUsers.length > 0 ? (
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
            >
              <span>{user.displayName || user.email}</span>
              <button
                type="button"
                className="ml-1 text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserSelection(user.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm">Select members</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-300">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer ${
                    selectedUserIds.includes(user.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserSelection(user.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {user.displayName || "Unnamed User"}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  {user.role && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100">
                      {user.role}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
