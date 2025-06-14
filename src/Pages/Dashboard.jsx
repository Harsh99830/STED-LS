import React from "react";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import TaskCard from "../components/TaskCard";
import ProgressCard from "../components/ProgressCard";
import StartButton from "../components/StartButton";
import Navbar from "../components/Navbar";
import TaskPointsBox from "../components/TaskPointsBox";
import StartedModal from "../components/StartedModal";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { startRecording, stopAndUpload } from "../utils/mediaUtils";
import TaskStartButton from "../components/TaskStartButton";

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [task, setTask] = useState(null);
  const [userData, setUserData] = useState(null);
  const [startedTask, setStartedTask] = useState(null);
  const [showStartedModal, setShowStartedModal] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [taskExists, setTaskExists] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/");
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (!userId || !user) return;

    const fetchData = async () => {
      setIsLoading(true);

      const userRef = ref(db, `users/${userId}`);
      const userSnap = await get(userRef);

      const clerkName = user.fullName || user.firstName || "Anonymous";
      const clerkEmail = user.primaryEmailAddress?.emailAddress || "no-email@example.com";

      if (userSnap.exists()) {
        const data = userSnap.val();

        if (!data.name || !data.email) {
          await set(userRef, { ...data, name: clerkName, email: clerkEmail });
        }

        setUserData({ ...data, name: clerkName, email: clerkEmail });

        const taskId = data.currentTask;
        const taskRef = ref(db, `tasks/${taskId}`);
        const taskSnap = await get(taskRef);

        if (taskSnap.exists()) {
          setTask({ id: taskId, ...taskSnap.val() });
          setTaskExists(true);
        } else {
          setTask(null);
          setTaskExists(false);
        }

        const startedRef = ref(db, `users/${userId}/startedTasks`);
        const startedSnap = await get(startedRef);
        if (startedSnap.exists()) {
          const started = startedSnap.val();
          const firstId = Object.keys(started)[0];
          setStartedTask(started[firstId]);
        }
      } else {
        const newUser = {
          name: clerkName,
          email: clerkEmail,
          currentTask: "task1",
          tasksCompleted: 0,
          xp: 0,
          level: 1,
        };
        await set(userRef, newUser);
        setUserData(newUser);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [userId, user]);

  const handleStartTask = async () => {
    if (startedTask || !task || !taskExists) return;
    setButtonLoading(true);

    try {
      await startRecording(mediaRecorderRef, audioChunksRef);

      const newStartedTask = {
        id: task.id,
        name: task.title,
        startedAt: new Date().toISOString(),
      };

      const startedRef = ref(db, `users/${userId}/startedTasks/${task.id}`);
      await set(startedRef, newStartedTask);

      setStartedTask(newStartedTask);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required to record.");
    }

    setButtonLoading(false);
  };

  const handleStartTaskWithModal = async () => {
    setShowStartedModal(true);
  };

  const handleDoneTask = async () => {
    if (!startedTask || !mediaRecorderRef.current) return;
    await stopAndUpload(mediaRecorderRef, audioChunksRef, navigate, userId, task.id);
  };

  const toggleProgress = () => {
    setShowProgress(!showProgress);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-black text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-black relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

      <Navbar onProgressClick={toggleProgress} showProgress={showProgress} />

      {showProgress && userData && (
        <div>
          <ProgressCard stats={userData} startedTask={startedTask} />
        </div>
      )}

      <div
        className="flex flex-col justify-center items-center mt-8 h-145 w-306 mx-37 rounded-lg"
        style={{ animation: "fadeIn 1s ease-in-out" }}
      >
        {userData?.currentTask && taskExists && task ? (
          <>
            <div className="flex w-400 ml-50">
              <TaskCard task={task} />
              <TaskPointsBox points={task.points} />
            </div>
            <TaskStartButton
              onClick={handleStartTaskWithModal}
            />
          </>
        ) : userData && userData.tasksCompleted > 0 ? (
          <div className="text-center bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">All Tasks Completed!</h2>
            <p className="text-gray-600">You've done a great job completing all your tasks.</p>
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600">Loading your first task...</p>
          </div>
        )}
      </div>

      {showStartedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <StartedModal onClose={() => setShowStartedModal(false)} />
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
    </div>
  );
}
