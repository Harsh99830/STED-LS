import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, set, remove } from "firebase/database";
import TaskCard from "../components/TaskCard";
import ProgressCard from "../components/ProgressCard";
import StartButton from "../components/StartButton";
import { useUser, useAuth } from "@clerk/clerk-react"; // Clerk import
import React from "react";
import Navbar from "../components/Navbar";
import TaskPointsBox from "../components/TaskPointsBox";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser(); // Clerk user
  const [task, setTask] = useState(null);
  const [userData, setUserData] = useState(null);
  const [startedTask, setStartedTask] = useState(null);
  const [showStartedModal, setShowStartedModal] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For page loading
  const [buttonLoading, setButtonLoading] = useState(false); // For button loading
  const [taskExists, setTaskExists] = useState(true); // 🔹 new

  const userId = user?.id;
  const navigate = useNavigate();

 useEffect(() => {
  if (isLoaded && !isSignedIn) {
    navigate("/");
  }
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
          await set(userRef, {
            ...data,
            name: clerkName,
            email: clerkEmail,
          });
        }

        setUserData({ ...data, name: clerkName, email: clerkEmail });

        const taskId = data.currentTask;
        const taskRef = ref(db, `tasks/${taskId}`);
        const taskSnap = await get(taskRef);

        if (taskSnap.exists()) {
          const taskData = taskSnap.val();
          setTask({ id: taskId, ...taskData });
          setTaskExists(true); // ✅ task found
        } else {
          setTask(null);
          setTaskExists(false); // ❌ task not found
        }

        const startedRef = ref(db, `users/${userId}/startedTasks`);
        const startedSnap = await get(startedRef);
        if (startedSnap.exists()) {
          const data = startedSnap.val();
          const firstId = Object.keys(data)[0];
          setStartedTask(data[firstId]);
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

    const newStartedTask = {
      id: task.id,
      name: task.title,
      startedAt: new Date().toISOString(),
    };

    const startedRef = ref(db, `users/${userId}/startedTasks/${task.id}`);
    await set(startedRef, newStartedTask);
    setStartedTask(newStartedTask);
    setShowStartedModal(true);

    setButtonLoading(false);
  };

  const handleDoneTask = async () => {
  if (!startedTask) return;

  setButtonLoading(true);

  const startedRef = ref(db, `users/${userId}/startedTasks/${startedTask.id}`);
  await remove(startedRef);

  const currentNumber = parseInt(task.id.replace("task", ""));
  const newTaskId = `task${currentNumber + 1}`;

  const taskRef = ref(db, `tasks/${newTaskId}`);
  const taskSnap = await get(taskRef);

  const userRef = ref(db, `users/${userId}`);
  const userSnap = await get(userRef);
  let updatedData = userSnap.val() || {};

  const taskXp = task.xp || 0;
  let newXp = (updatedData.xp || 0) + taskXp;
  let newLevel = updatedData.level || 1;
  while (newXp >= 500) {
    newXp -= 500;
    newLevel += 1;
  }

  let tasksCompleted = (updatedData.tasksCompleted || 0) + 1;

  // Update user progress regardless of whether next task exists
  const newUserData = {
    ...updatedData,
    tasksCompleted: tasksCompleted,
    xp: newXp,
    level: newLevel,
  };

  if (taskSnap.exists()) {
    const taskData = taskSnap.val();
    newUserData.currentTask = newTaskId;
    await set(userRef, newUserData);
    setUserData(newUserData);
    setTask({ id: newTaskId, ...taskData });
    setTaskExists(true); // ✅ next task found
  } else {
    // No more tasks
    newUserData.currentTask = null; // or keep the old task ID
    await set(userRef, newUserData);
    setUserData(newUserData);
    setTask(null);
    setTaskExists(false); // ❌ no next task
  }

  setStartedTask(null);
  setButtonLoading(false);
};

const handleRestart = async () => {
  const userRef = ref(db, `users/${userId}`);
  const startedRef = ref(db, `users/${userId}/startedTasks`);

  // Remove any remaining started task (edge case cleanup)
  await remove(startedRef);

  // Set currentTask back to task1
  const updatedUserData = {
    ...userData,
    currentTask: "task1",
    startedTasks: {},
  };
  await set(userRef, updatedUserData);

  // Fetch task1
  const firstTaskRef = ref(db, `tasks/task1`);
  const taskSnap = await get(firstTaskRef);

  if (taskSnap.exists()) {
    const taskData = taskSnap.val();
    setTask({ id: "task1", ...taskData });
    setTaskExists(true);
  } else {
    setTask(null);
    setTaskExists(false);
  }

  setUserData(updatedUserData);
  setStartedTask(null);
};


  const toggleProgress = () => {
    setShowProgress(!showProgress);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#c2dbf7] to-[#2596be]">
        <div className="text-black text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c2dbf7] to-[#2596be] text-black relative">
      <Navbar onProgressClick={toggleProgress} showProgress={showProgress} />

      {showProgress && userData && (
        <div>
          <ProgressCard stats={userData} startedTask={startedTask} />
        </div>
      )}

     <div className="flex flex-col items-center justify-center mt-8 h-145 w-306 mx-37 rounded-lg bg-white bg-opacity-80 p-6 shadow-md">
  {taskExists && task ? (
    <>
      <div className="flex md:flex-row justify-center">
        <TaskCard task={task} />
        <TaskPointsBox points={task.points} />
      </div>
      <StartButton
        onClick={startedTask ? handleDoneTask : handleStartTask}
        isStarted={!!startedTask}
      />
    </>
  ) : (
    // 🎉 Completion message here instead of modal
    <div className="text-center">
      <h2 className="text-2xl font-bold text-green-700 mb-3">🎉 All Tasks Completed!</h2>
      <p className="text-gray-700 mb-4">You’ve done a great job completing all your tasks.</p>
      <button
        onClick={handleRestart}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Restart from Task 1
      </button>
    </div>
  )}
</div>


      {showStartedModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg w-72">
            <img
              src="https://media.giphy.com/media/111ebonMs90YLu/giphy.gif"
              alt="Started"
              className="w-24 mx-auto mb-4"
            />
            <h2 className="text-xl font-bold text-green-600">Task Started!</h2>
            <button
              onClick={() => setShowStartedModal(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
