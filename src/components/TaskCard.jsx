import React from 'react';

export default function TaskCard({ task }) {
  return (
    <div className="bg-gradient-to-br from-[#fefcea] via-[#e7f0fd] to-[#f5faff] backdrop-blur-md pl-4 pt-3 pb-4 rounded-3xl shadow-2xl w-180 border max-h-130 text-left animate-fade-in transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:border-[#60a5fa]">
      
      {/* Task ID */}
      <h2 className="text-xl font-semibold mb-1 text-gray-800 tracking-wide">Task - {task.id.toString().replace(/\D/g, '')}</h2>
      
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-[#1f2937] mb-3 drop-shadow-sm leading-tight">{task.title}</h1>
      
      {/* Description */}
      <p className="text-gray-700 font-medium mt-4 text-lg leading-relaxed">{task.description}</p>

      <div className="mt-10 leading-relaxed space-y-3">

        {/* Category */}
        <p className="text-base">
          <span className="text-lg font-bold">📂 Category:</span>{" "}
          <span className="text-lg text-gray-800 font-medium">{task.category}</span>
        </p>

        {/* Reward */}
        <p className="text-base">
          <span className="text-lg font-bold">🏆 Reward:</span>{" "}
          <span className="font-semibold text-green-600 ml-1">+{task.xp}XP</span>
        </p>

        {/* Difficulty & Objectives */}
        <div className="flex justify-between items-start w-170">

          {/* Difficulty */}
          <p className="text-base mt-2">
            <span className="font-bold">🔥 Difficulty level:</span>
            <span className="ml-2 inline-block w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="ml-1 text-gray-800 font-medium">{task.difficulty}</span>
          </p>

          {/* Objectives Box */}
          <div className="bg-gradient-to-tr from-white via-[#f0f7ff] to-[#eaf4ff] p-4 rounded-2xl shadow-xl border w-72 h-auto max-h-48 overflow-y-auto ml-6 text-left animate-fade-in transition-all duration-300 hover:shadow-[0_6px_14px_rgba(0,0,0,0.15)]">
            <span className="font-bold text-gray-700 text-lg block mb-2">🎯 Objectives</span>
            <ul className="list-disc text-sm pl-4 marker:text-blue-500 text-gray-700 space-y-1">
              {task.objective &&
                Object.values(task.objective).map((item, index) => (
                  <li key={index} className="transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* How to do it section */}
      <div className="flex mt-10 w-60 items-center space-x-3">
        <p className="text-lg font-semibold text-gray-800">💡 How to do it?</p>
        <button className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-600 transition-all duration-300">
          Click
        </button>
      </div>
    </div>
  );
}
