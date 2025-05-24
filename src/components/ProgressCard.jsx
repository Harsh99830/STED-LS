import React from 'react';

export default function ProgressCard({ stats, startedTask }) {
  return (
    <div className="bg-black p-4 rounded-xl border w-65 h-65 shadow-md ml-40 mt-10">
      <p className="text-center text-white font-semibold">Your Progress</p>

      <div className="text-center my-2 text-white">
        <p className="text-2xl font-bold">{stats.level} LEVEL</p>
        <p className="text-xs">XP: {stats.xp} / 500</p>
        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            className="h-full bg-indigo-500 rounded"
            style={{ width: `${(stats.xp / 500) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-sm mt-2 text-white">
        <p>Tasks Completed: {stats.tasksCompleted}</p>
      </div>
    </div>
  );
}
