import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase"; // Import your Firebase Realtime Database instance
import { ref as dbRef, get } from "firebase/database";

export default function StartedModal({ onClose }) {
  const { user } = useUser(); // Get current user from Clerk
  const [taskTitle, setTaskTitle] = useState(""); // State to store task title
  const [taskDescription, setTaskDescription] = useState(""); // State to store task description
  const [error, setError] = useState(""); // State for error handling

  // Fetch task title and description based on current task
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        if (!user) {
          setError("User not logged in");
          return;
        }

        // Get current task ID from users/{user.id}
        const userRef = dbRef(db, `users/${user.id}`);
        const userSnap = await get(userRef);
        if (!userSnap.exists()) {
          setError("User data not found");
          return;
        }

        const userData = userSnap.val();
        const currentTaskId = userData.currentTask;
        if (!currentTaskId) {
          setError("No current task assigned");
          return;
        }

        // Fetch task data from tasks/{currentTaskId}
        const taskRef = dbRef(db, `tasks/${currentTaskId}`);
        const taskSnap = await get(taskRef);
        if (!taskSnap.exists()) {
          setError("Task data not found");
          return;
        }

        const taskData = taskSnap.val();
        setTaskTitle(taskData.title || "Untitled Task"); // Set task title, fallback if undefined
        setTaskDescription(taskData.description || "No description available"); // Set task description, fallback if undefined
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching task data:", err);
        setError("Failed to load task data");
      }
    };

    fetchTaskData();
  }, [user]); // Run when user changes

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
      {/* Background overlay with blur */}
      <div className="fixed inset-0 backdrop-blur-lg z-40"></div>
      
      {/* Modal content */}
      <div className="relative bg-black rounded-lg p-6 text-center shadow-lg w-300 h-170 z-50 flex flex-col justify-between">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-bold text-white">
            {error ? error : `Task: ${taskTitle}`}
          </h2>
          <p className="text-sm text-gray-300">
            {error ? "" : taskDescription}
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded self-start"
        >
          Back
        </button>
      </div>
    </div>
  );
}