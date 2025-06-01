import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase"; // Import your Firebase Realtime Database instance
import { ref as dbRef, get, set } from "firebase/database";
import { startRecording, stopAndUpload } from "../utils/mediaUtils";
import { useNavigate } from "react-router-dom";

export default function StartedModal({ onClose }) {
  const { user } = useUser(); // Get current user from Clerk
  const [taskTitle, setTaskTitle] = useState(""); // State to store task title
  const [taskDescription, setTaskDescription] = useState(""); // State to store task description
  const [error, setError] = useState(""); // State for error handling
  const [startedTask, setStartedTask] = useState(null); // State to track started task
  const [buttonLoading, setButtonLoading] = useState(false); // State for button loading
  const [micStatus, setMicStatus] = useState("checking"); // State for microphone permission
  const [userData, setUserData] = useState(null); // State to store user data
  const mediaRecorderRef = useRef(null); // Ref for media recorder
  const audioChunksRef = useRef([]); // Ref for audio chunks
  const navigate = useNavigate(); // For navigation after task completion

  // Check microphone permission status
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "microphone" });
        setMicStatus(permissionStatus.state); // "granted", "denied", or "prompt"
        permissionStatus.onchange = () => {
          setMicStatus(permissionStatus.state);
        };
      } catch (err) {
        console.error("Error checking mic permission:", err);
        setMicStatus("error");
        setError("Unable to check microphone permission");
      }
    };

    checkMicPermission();
  }, []);

  // Fetch task title, description, and started task status
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

        const fetchedUserData = userSnap.val();
        setUserData(fetchedUserData); // Store user data in state
        const currentTaskId = fetchedUserData.currentTask;
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

        // Check if task is started
        const startedRef = dbRef(db, `users/${user.id}/startedTasks`);
        const startedSnap = await get(startedRef);
        if (startedSnap.exists()) {
          const started = startedSnap.val();
          const firstId = Object.keys(started)[0];
          setStartedTask(started[firstId]);
        }

        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching task data:", err);
        setError("Failed to load task data");
      }
    };

    fetchTaskData();
  }, [user]);

  // Handle starting a task
  const handleStartTask = async () => {
    if (startedTask || !taskTitle || !userData) return;
    setButtonLoading(true);

    try {
      if (micStatus === "denied") {
        setError("Microphone access denied. Please allow in browser settings.");
        setButtonLoading(false);
        return;
      }

      await startRecording(mediaRecorderRef, audioChunksRef);

      const newStartedTask = {
        id: userData.currentTask, // Use userData from state
        name: taskTitle,
        startedAt: new Date().toISOString(),
      };

      const startedRef = dbRef(db, `users/${user.id}/startedTasks/${userData.currentTask}`);
      await set(startedRef, newStartedTask);

      setStartedTask(newStartedTask);
      setError(""); // Clear any errors on success
    } catch (err) {
      console.error("Mic access error:", err);
      setError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Microphone access denied. Please allow in browser settings."
          : "Failed to start recording. Check your microphone and try again."
      );
    }

    setButtonLoading(false);
  };

  // Handle completing a task
  const handleDoneTask = async () => {
    if (!startedTask || !mediaRecorderRef.current) return;
    setButtonLoading(true);

    try {
      await stopAndUpload(mediaRecorderRef, audioChunksRef, navigate, user.id, startedTask.id);
      setError(""); // Clear any errors on success
    } catch (err) {
      console.error("Error completing task:", err);
      setError("Failed to complete task. Please try again.");
    }

    setButtonLoading(false);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
      {/* Background overlay with blur */}
      <div className="fixed inset-0 backdrop-blur-lg z-40"></div>
      
      {/* Modal content */}
      <div className="relative bg-black rounded-lg p-6 text-center shadow-lg w-300 h-170 z-50 flex flex-col justify-between">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold text-white">
            {error ? error : `${taskTitle}`}
          </h2>
          <p className="text-sm text-gray-300">
            {error ? "" : taskDescription}
          </p>
          {micStatus === "denied" && (
            <p className="text-sm text-red-400">
              Microphone access denied. Please allow in browser settings.
            </p>
          )}
          {micStatus === "error" && (
            <p className="text-sm text-red-400">
              Unable to check microphone permission. Check your device.
            </p>
          )}
        </div>

        <div className="flex justify-between items-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back
          </button>
          <button
            onClick={startedTask ? handleDoneTask : handleStartTask}
            className={`${
              buttonLoading || micStatus === "denied"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded`}
            disabled={buttonLoading || micStatus === "denied"}
          >
            {buttonLoading ? "Loading..." : startedTask ? "Done" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}