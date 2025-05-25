// components/TaskPointsBox.js
import React from "react";

export default function TaskPointsBox({ points }) {
  // console.log("TaskPointsBox received points:", points);

  // Only render if points is an array and not empty
  if (!Array.isArray(points) || points.length === 0) return null;

  return (
    <div className="bg-white mt-7 ml-18 shadow-lg border border-black rounded-lg p-4 w-90 h-80">
      <h3 className="text-2xl font-bold text-gray-800 text-left mb-5">
        Points to Remember:
      </h3>
      <ul className="list-disc list-inside text-lg font-normal text-black leading-10 text-left space-y-1">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
