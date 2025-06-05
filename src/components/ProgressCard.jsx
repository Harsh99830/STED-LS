import React from 'react';

export default function ProgressCard({ stats }) {
  return (
    <div className="absolute top-20 right-4 sm:right-6 md:right-8 w-72 p-5 rounded-2xl z-50 shadow-2xl
      bg-white
      border border-gray-200
      transition-transform duration-700 ease-out font-mono">

      <p className="text-center text-xl font-bold text-gray-900 tracking-wide mb-4">🚀 Your Progress</p>

      <div className="flex flex-col sm:flex-row justify-between items-center text-black gap-4 sm:gap-6">
        <p className="text-3xl font-extrabold text-center text-indigo-700">
          {stats.level.toString().padStart(2, '0')}<br />
          <span className="text-sm tracking-widest">LEVEL</span>
        </p>

        <div className="w-full sm:w-28 text-center">
          <p className="text-base font-semibold text-gray-800 mb-1">XP</p>
          <p className="text-sm font-semibold text-gray-600 mb-2">{stats.xp} / 500</p>
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500 rounded-full"
              style={{ width: `${(stats.xp / 500) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-400 my-4"></div>

      <div className="text-base font-bold text-gray-800 text-left mb-2">
        ✅ Tasks Completed: <span className="text-green-700">{stats.tasksCompleted}</span>
      </div>

      <div className="border-b border-gray-400 my-4"></div>

      <div className="text-base font-bold text-gray-800 text-left">
        🔥 Streak: <span className="text-red-600">1</span>
      </div>
    </div>
  );
}
