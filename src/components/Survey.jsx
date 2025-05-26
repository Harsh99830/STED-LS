import React from 'react'
import { useNavigate } from 'react-router-dom'

function Survey() {
  const navigate = useNavigate();

  const handleStart = () => {
    // Store flag in localStorage to show intro only once
    localStorage.setItem("showIntro", "true");
    navigate("/home");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
      >
        Start Learning
      </button>
    </div>
  );
}

export default Survey;
