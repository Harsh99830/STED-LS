import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase";
import { ref as dbRef, get, set, remove } from "firebase/database";
import { startRecording, stopAndUpload } from "../utils/mediaUtils";
import { useNavigate } from "react-router-dom";
import StartButton from "./StartButton";

export default function StartedModal({ onClose }) {
  const { user } = useUser();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [error, setError] = useState("");
  const [startedTask, setStartedTask] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [micStatus, setMicStatus] = useState("checking");
  const [userData, setUserData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  // Check microphone permission status
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "microphone" });
        setMicStatus(permissionStatus.state);
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

  // Fetch task data
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!user) return;

      try {
        const userRef = dbRef(db, `users/${user.id}`);
        const userSnap = await get(userRef);
        
        if (!userSnap.exists()) {
          setError("User data not found");
          return;
        }

        const userData = userSnap.val();
        setUserData(userData);

        const taskRef = dbRef(db, `tasks/${userData.currentTask}`);
        const taskSnap = await get(taskRef);

        if (!taskSnap.exists()) {
          setError("Task not found");
          return;
        }

        const taskData = taskSnap.val();
        setTaskTitle(taskData.title || "Untitled Task");
        setTaskDescription(taskData.description || "No description available");
        setError("");

      } catch (err) {
        console.error("Error fetching task data:", err);
        setError("Failed to load task data");
      }
    };

    fetchTaskData();
  }, [user]);

  // Update recording time
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          const timeLimit = getTimeLimit();
          
          // Auto stop recording when time limit is reached
          if (newTime >= timeLimit) {
            if (mediaRecorderRef.current?.state === "recording") {
              handleDoneTask();
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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
      setIsRecording(true);

      const newStartedTask = {
        id: userData.currentTask,
        name: taskTitle,
        startedAt: new Date().toISOString(),
      };

      const startedRef = dbRef(db, `users/${user.id}/startedTasks/${userData.currentTask}`);
      await set(startedRef, newStartedTask);

      setStartedTask(newStartedTask);
      setError("");

    } catch (err) {
      console.error("Error starting task:", err);
      setError("Failed to start task. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  // Handle completing a task
  const handleDoneTask = async () => {
    if (!startedTask || !mediaRecorderRef.current) return;
    setButtonLoading(true);

    try {
      await stopAndUpload(mediaRecorderRef, audioChunksRef, navigate, user.id, startedTask.id);
      
      // Clean up the started task
      const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
      await remove(startedRef);
      setStartedTask(null);
      
      // Reset states
      setIsRecording(false);
      setRecordingTime(0);
      localStorage.removeItem(`interruptedTask_${user.id}`);
      
      // Navigate to done page
      navigate("/done");
    } catch (err) {
      console.error("Error completing task:", err);
      setError("Failed to complete task.");
    } finally {
      setButtonLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = async () => {
    setButtonLoading(true);

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        audioChunksRef.current = [];
        console.log("Recording stopped on cancel");
      }

      if (startedTask) {
        const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
        await remove(startedRef);
        console.log("Started task removed from Firebase");
        setStartedTask(null);
      }

      setIsRecording(false);
      setRecordingTime(0);
      setError("");
      localStorage.removeItem(`interruptedTask_${user.id}`);
      onClose();
    } catch (err) {
      console.error("Error canceling task:", err);
      setError("Failed to cancel task.");
    }

    setButtonLoading(false);
  };

  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Get time limit based on task
  const getTimeLimit = () => {
    switch (userData?.currentTask) {
      case "task1":
      case "task5":
      case "task8":
      case "task11":
      case "task14":
        return 30;
      case "task2":
      case "task3":
        return 120;
      case "task4":
      case "task7":
      case "task10":
      case "task13":
        return 180;
      case "task6":
      case "task9":
      case "task12":
        return 240;
      default:
        return 0;
    }
  };

  // Task UI with checkmark button
  const handleTaskUI = () => {
    const timeLimit = getTimeLimit();
    const showCheckmark = !isRecording && recordingTime >= timeLimit;

    return (
      <>
        {showCheckmark && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <button
              onClick={handleDoneTask}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-colors duration-200"
              disabled={buttonLoading}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <span className="text-sm text-green-400">Time complete!</span>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {buttonLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-12 h-12 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-2xl text-white font-semibold">Processing...</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
        <div className="fixed inset-0 backdrop-blur"></div>
        <div
          className={`relative bg-gray-800 rounded-lg p-6 text-center shadow-lg w-300 h-170 z-50 flex flex-col justify-between ${
            buttonLoading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold text-white">{error ? error : taskTitle}</h2>
            <p className="text-sm text-gray-400">{error ? "" : taskDescription}</p>
            {micStatus === "denied" && (
              <p className="text-sm text-red-600">Microphone access denied.</p>
            )}
            {micStatus === "error" && (
              <p className="text-sm text-red-600">Unable to check microphone.</p>
            )}
            {isRecording && (
              <div className="flex items-center justify-center space-x-4">
                <svg
                  className="w-5 h-5 text-red-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <span className="text-sm text-red-400">Recording...</span>
                <span className="text-sm text-red-400">{formatTime(recordingTime)}</span>
              </div>
            )}
            {handleTaskUI()}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              disabled={buttonLoading}
            >
              Cancel
            </button>
            {!startedTask && (
              <StartButton
                isStarted={false}
                onClick={handleStartTask}
                disabled={buttonLoading || !taskTitle || micStatus === "denied"}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}