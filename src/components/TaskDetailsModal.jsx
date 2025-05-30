// components/TaskDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

export default function TaskDetailsModal({ taskId, onClose }) {
  const [taskDetails, setTaskDetails] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const taskRef = ref(db, `tasks/${taskId}`);
      const taskSnap = await get(taskRef);
      if (taskSnap.exists()) {
        setTaskDetails(taskSnap.val());
      }
    };

    if (taskId) fetchTaskDetails();
  }, [taskId]);

  if (!taskDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-lg relative shadow-xl max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">{taskDetails.title}</h2>
        <p className="mb-3 text-gray-800"><strong>Description:</strong> {taskDetails.description}</p>
        {taskDetails.points && (
          <p className="text-green-600 font-semibold">Points: {taskDetails.points}</p>
        )}
        {taskDetails.instructions && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{taskDetails.instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
