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
  const [randomWord, setRandomWord] = useState("");
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

  // Clean up interrupted tasks from localStorage
  const cleanupInterruptedTask = async (userId) => {
    try {
      const interrupted = localStorage.getItem(`interruptedTask_${userId}`);
      if (interrupted) {
        const { taskId, timestamp } = JSON.parse(interrupted);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (now - timestamp < oneHour) {
          const startedRef = dbRef(db, `users/${userId}/startedTasks/${taskId}`);
          const snap = await get(startedRef);
          if (snap.exists()) {
            await remove(startedRef);
            console.log(`Cleaned up interrupted task ${taskId} for user ${userId}`);
          }
        }
        localStorage.removeItem(`interruptedTask_${userId}`);
      }
    } catch (err) {
      console.error("Error cleaning up interrupted task:", err);
    }
  };

  // Fetch task title, description, and started task status
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        if (!user) {
          setError("User not logged in");
          return;
        }

        await cleanupInterruptedTask(user.id);

        const userRef = dbRef(db, `users/${user.id}`);
        const userSnap = await get(userRef);
        if (!userSnap.exists()) {
          setError("User data not found");
          return;
        }

        const fetchedUserData = userSnap.val();
        setUserData(fetchedUserData);
        const currentTaskId = fetchedUserData.currentTask;
        if (!currentTaskId) {
          setError("No current task assigned");
          return;
        }

        const taskRef = dbRef(db, `tasks/${currentTaskId}`);
        const taskSnap = await get(taskRef);
        if (!taskSnap.exists()) {
          setError("Task data not found");
          return;
        }

        const taskData = taskSnap.val();
        setTaskTitle(taskData.title || "Untitled Task");
        setTaskDescription(taskData.description || "No description available");

        const startedRef = dbRef(db, `users/${user.id}/startedTasks`);
        const startedSnap = await get(startedRef);
        if (startedSnap.exists()) {
          const started = startedSnap.val();
          const firstId = Object.keys(started)[0];
          setStartedTask(started[firstId]);
        }

        setError("");
      } catch (err) {
        console.error("Error fetching task data:", err);
        setError("Failed to load task data");
      }
    };

    fetchTaskData();
  }, [user]);

  // Handle beforeunload event for tab closure
  useEffect(() => {
    if (!isRecording || !startedTask || !user) return;

    const handleBeforeUnload = () => {
      localStorage.setItem(
        `interruptedTask_${user.id}`,
        JSON.stringify({
          taskId: startedTask.id,
          timestamp: Date.now(),
        })
      );
      console.log(`Marked task ${startedTask.id} as interrupted for user ${user.id}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isRecording, startedTask, user]);

  // Recording timer for task1 and task2
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (userData?.currentTask === "task1" && newTime >= 30) {
            handleAutoStop();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, userData]);

  // Fetch random word for task1 only when recording starts
  const fetchRandomWord = async () => {
    try {
      if (!userData || userData.currentTask !== "task1") {
        setRandomWord("");
        return;
      }

      const randomWordRef = dbRef(db, `tasks/task1/randomWord`);
      const randomWordSnap = await get(randomWordRef);
      if (!randomWordSnap.exists()) {
        setError("No random words found for task1");
        return;
      }

      const randomWords = randomWordSnap.val();
      const wordArray = Object.values(randomWords);
      if (wordArray.length === 0) {
        setError("No random words available for task1");
        return;
      }

      const randomIndex = Math.floor(Math.random() * wordArray.length);
      setRandomWord(wordArray[randomIndex] || "No word available");
      setError("");
    } catch (err) {
      console.error("Error fetching random word:", err);
      setError("Failed to load random word for task1");
    }
  };

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

      if (userData.currentTask === "task1") {
        await fetchRandomWord();
      }

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
      console.error("Mic access error:", err);
      setError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Microphone access denied. Please allow in browser settings."
          : "Failed to start recording. Check your microphone and try again."
      );
    }

    setButtonLoading(false);
  };

  // Handle auto-stop for tasks
  const handleAutoStop = async () => {
    if (!startedTask || !mediaRecorderRef.current) return;
    setButtonLoading(true);

    try {
      const audioUrl = await stopAndUpload(mediaRecorderRef, audioChunksRef, navigate, user.id, startedTask.id);
      if (!audioUrl) {
        const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
        await remove(startedRef);
        console.log("Started task removed due to missing audio URL");
        setStartedTask(null);
      } else {
        console.log("Audio uploaded successfully, URL:", audioUrl);
      }
      setIsRecording(false);
      setRecordingTime(0);
      setRandomWord("");
      localStorage.removeItem(`interruptedTask_${user.id}`);
    } catch (err) {
      console.error("Error stopping task:", err);
      const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
      await remove(startedRef);
      console.log("Started task removed due to error in stopAndUpload");
      setStartedTask(null);
      setError("Failed to stop task.");
      localStorage.removeItem(`interruptedTask_${user.id}`);
    }

    setButtonLoading(false);
  };

  // Handle manual "Done" or tick button click
  const handleDoneTask = async () => {
    if (!startedTask || !mediaRecorderRef.current) return;
    setButtonLoading(true);

    try {
      const audioUrl = await stopAndUpload(mediaRecorderRef, audioChunksRef, navigate, user.id, startedTask.id);
      if (!audioUrl) {
        const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
        await remove(startedRef);
        console.log("Started task removed due to missing audio URL");
        setStartedTask(null);
      } else {
        console.log("Audio uploaded successfully, URL:", audioUrl);
      }
    } catch (err) {
      console.error("Error completing task:", err);
      const startedRef = dbRef(db, `users/${user.id}/startedTasks/${startedTask.id}`);
      await remove(startedRef);
      console.log("Started task removed due to error in stopAndUpload");
      setStartedTask(null);
      setError("Failed to complete task.");
    } finally {
      setIsRecording(false);
      setRecordingTime(0);
      setRandomWord("");
      localStorage.removeItem(`interruptedTask_${user.id}`);
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
      setRandomWord("");
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

  // Task1 UI (random word, tick button at 30s)
  const handleTask1 = () => {
    return (
      <>
        {isRecording && recordingTime < 30 && (
          <p className="text-sm text-yellow-400">{error ? "" : `Random word: ${randomWord}`}</p>
        )}
        {recordingTime >= 30 && (
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

  // Task2 UI (tick button at 120s)
  const handleTask2 = () => {
    return (
      <>
        {recordingTime >= 120 && (
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
            {userData?.currentTask === "task1" && handleTask1()}
            {userData?.currentTask === "task2" && handleTask2()}
          </div>
          <div className="flex justify-between items-end">
            <button
              onClick={handleCancel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              disabled={buttonLoading}
            >
              Cancel
            </button>
            <StartButton
              isStarted={!!startedTask}
              onClick={startedTask ? handleDoneTask : handleStartTask}
              onStartRecording={handleStartTask}
              onStopRecording={handleDoneTask}
              disabled={
                buttonLoading ||
                micStatus === "denied" ||
                (startedTask && userData?.currentTask === "task1" && recordingTime < 30) ||
                (startedTask && userData?.currentTask === "task2" && recordingTime < 120)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}