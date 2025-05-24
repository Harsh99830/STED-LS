import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, set, remove } from "firebase/database";
import TaskCard from "../components/TaskCard";
import ProgressCard from "../components/ProgressCard";
import StartButton from "../components/StartButton";
import { useUser } from "@clerk/clerk-react"; // Clerk import
import React from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useUser(); // Clerk user
  const [task, setTask] = useState(null);
  const [userData, setUserData] = useState(null);
  const [startedTask, setStartedTask] = useState(null);
  const [showStartedModal, setShowStartedModal] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For page loading
  const [buttonLoading, setButtonLoading] = useState(false); // For button loading


  const userId = user?.id;

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

      // Optional: Update name and email if missing
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
      }

      const startedRef = ref(db, `users/${userId}/startedTasks`);
      const startedSnap = await get(startedRef);
      if (startedSnap.exists()) {
        const data = startedSnap.val();
        const firstId = Object.keys(data)[0];
        setStartedTask(data[firstId]);
      }
    } else {
      // Create new user in Firebase
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
  if (startedTask || !task) return;

  setButtonLoading(true); // Start loading

  const newStartedTask = {
    id: task.id,
    name: task.title,
    startedAt: new Date().toISOString(),
  };

  const startedRef = ref(db, `users/${userId}/startedTasks/${task.id}`);
  await set(startedRef, newStartedTask);
  setStartedTask(newStartedTask);
  setShowStartedModal(true);

  setButtonLoading(false); // End loading
};

  const handleDoneTask = async () => {
  if (!startedTask) return;

  setButtonLoading(true); // Start loading

  const startedRef = ref(db, `users/${userId}/startedTasks/${startedTask.id}`);
  await remove(startedRef);

  const currentNumber = parseInt(task.id.replace("task", ""));
  const newTaskId = `task${currentNumber + 1}`;

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

  const newUserData = {
    ...updatedData,
    currentTask: newTaskId,
    tasksCompleted: tasksCompleted,
    xp: newXp,
    level: newLevel,
  };

  await set(userRef, newUserData);

  setStartedTask(null);
  setUserData(newUserData);

  const taskRef = ref(db, `tasks/${newTaskId}`);
  const taskSnap = await get(taskRef);
  if (taskSnap.exists()) {
    const taskData = taskSnap.val();
    setTask({ id: newTaskId, ...taskData });
  }

  setButtonLoading(false); // End loading
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
    
    <div className="min-h-screen bg-gradient-to-br from-[#c2dbf7] to-[#2596be] text-black  relative">
      <Navbar onProgressClick={toggleProgress}  showProgress={showProgress}/>
      {/* <SignOutButton className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"/>
        Sign Out */}
      <h1 className="text-3xl text-left pl-52 mt-7">Welcome {user?.firstName || "User"}!</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {task && <TaskCard task={task} />}
        {showProgress && userData && (
  <div className="mt-4">
    <ProgressCard stats={userData} startedTask={startedTask} />
  </div>
)}
      </div>

      <StartButton onClick={startedTask ? handleDoneTask : handleStartTask} isStarted={!!startedTask} />

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
