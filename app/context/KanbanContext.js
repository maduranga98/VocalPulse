"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "./AuthContext";

const KanbanContext = createContext({});

export const KanbanProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({
    todo: { id: "todo", title: "To Do", tasks: [] },
    inProgress: { id: "inProgress", title: "In Progress", tasks: [] },
    done: { id: "done", title: "Done", tasks: [] },
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Define project types
  const [projectTypes, setProjectTypes] = useState([
    "GMB",
    "CC-P1",
    "CC-P2",
    "CC-P3",
    "Automation",
  ]);

  // Fetch all users for assigning tasks (for admin/supervisor)
  const fetchUsers = async () => {
    if (!user) return;

    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };

  // Fetch tasks based on user role
  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let tasksQuery;

      // Admin and supervisor can see all tasks
      if (user.role === "admin" || user.role === "supervisor") {
        tasksQuery = query(
          collection(db, "tasks"),
          orderBy("createdAt", "desc")
        );
      } else {
        // Regular members can only see tasks assigned to them
        tasksQuery = query(
          collection(db, "tasks"),
          where("assignedTo", "array-contains", user.uid),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(tasksQuery);
      let tasksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user info for assigned users in tasks
      const userCache = new Map(); // Cache user data to avoid duplicate fetches

      // Pre-load all users that are assigned to tasks
      const uniqueUserIds = [
        ...new Set(tasksList.flatMap((task) => task.assignedTo || [])),
      ];

      // Fetch user data in parallel
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              userCache.set(userId, { id: userId, ...userDoc.data() });
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        })
      );

      // Add user data to tasks
      tasksList = tasksList.map((task) => ({
        ...task,
        assignedToUsers: (task.assignedTo || [])
          .map((userId) => userCache.get(userId))
          .filter(Boolean),
      }));

      setTasks(tasksList);

      // Organize tasks into columns
      const newColumns = {
        todo: { id: "todo", title: "To Do", tasks: [] },
        inProgress: { id: "inProgress", title: "In Progress", tasks: [] },
        done: { id: "done", title: "Done", tasks: [] },
      };

      tasksList.forEach((task) => {
        if (task.status && newColumns[task.status]) {
          newColumns[task.status].tasks.push(task);
        } else {
          // Default to 'todo' if status is invalid
          newColumns.todo.tasks.push({
            ...task,
            status: "todo",
          });
        }
      });

      setColumns(newColumns);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Create a new task (admin/supervisor only)
  const createTask = async (taskData) => {
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
      throw new Error("Only admins and supervisors can create tasks");
    }

    try {
      const newTask = {
        ...taskData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: "todo",
      };

      const docRef = await addDoc(collection(db, "tasks"), newTask);

      // Refresh tasks after creation
      fetchTasks();

      return docRef.id;
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task");
      throw err;
    }
  };

  // Update task status (e.g., when dragging between columns)
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
      });

      // Refresh tasks after update
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status");
      throw err;
    }
  };

  // Update task details
  const updateTask = async (taskId, taskData) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        ...taskData,
        updatedAt: serverTimestamp(),
      });

      // Refresh tasks after update
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
      throw new Error("Only admins and supervisors can delete tasks");
    }

    try {
      await deleteDoc(doc(db, "tasks", taskId));

      // Refresh tasks after deletion
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      throw err;
    }
  };

  // Handle drag and drop between columns
  const moveTask = (taskId, sourceColumn, destinationColumn) => {
    if (sourceColumn === destinationColumn) return;

    // Update task status in Firestore
    updateTaskStatus(taskId, destinationColumn);
  };

  // Admin can update project types
  const updateProjectTypes = async (newProjectTypes) => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update project types");
    }

    try {
      // Store project types in a separate document in Firestore
      await setDoc(doc(db, "settings", "projectTypes"), {
        types: newProjectTypes,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });

      setProjectTypes(newProjectTypes);
    } catch (err) {
      console.error("Error updating project types:", err);
      setError("Failed to update project types");
      throw err;
    }
  };

  // Load project types from Firestore settings
  const loadProjectTypes = async () => {
    try {
      const projectTypesDoc = await getDoc(doc(db, "settings", "projectTypes"));
      if (projectTypesDoc.exists()) {
        setProjectTypes(projectTypesDoc.data().types);
      }
    } catch (err) {
      console.error("Error loading project types:", err);
    }
  };

  // Fetch data when auth user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchUsers();
      loadProjectTypes();
    } else {
      setTasks([]);
      setUsers([]);
      setColumns({
        todo: { id: "todo", title: "To Do", tasks: [] },
        inProgress: { id: "inProgress", title: "In Progress", tasks: [] },
        done: { id: "done", title: "Done", tasks: [] },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    tasks,
    columns,
    users,
    loading,
    error,
    projectTypes,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    moveTask,
    updateProjectTypes,
    loadProjectTypes,
  };

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};

export const useKanban = () => {
  return useContext(KanbanContext);
};
