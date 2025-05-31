// components/TaskPointsBox.js
import React from "react";

export default function TaskPointsBox({ points }) {
  if (!Array.isArray(points) || points.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#fefcea] via-[#e7f0fd] to-[#f5faff] backdrop-blur-md mt-7 ml-18 shadow-2xl border border-[#d1d5db] rounded-3xl p-6 w-max-110 h-80 animate-fade-in transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:border-[#60a5fa]">
      <h3 className="text-2xl font-extrabold text-[#1f2937] text-left mb-5 tracking-wide drop-shadow-sm">
        🎯 Points to Remember:
      </h3>
      <ul className="list-disc list-inside text-lg pr-4 font-medium text-[#374151] leading-9 text-left space-y-2 marker:text-blue-500">
        {points.map((point, index) => (
          <li key={index} className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
