import React from 'react';

export default function ProgressCard({ stats }) {
  return (
    <div className="absolute top-20 right-8 bg-black p-4 rounded-xl border w-70 shadow-md z-50">
      <p className="text-center text-lg text-white font-semibold">Your Progress</p>

      <div className="flex text-center my-2 text-white gap-15">
        <p className="text-3xl font-bold"><span>{stats.level.toString().padStart(2, '0')}</span><br/> <span>LEVEL</span></p>
        <div className='XP w-24'>
        <p className="mt-2.5"><span className='text-base font-bold'>XP</span> <br/> <span className='text-sm font-bold'>{stats.xp} / 500</span></p>
        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            className="h-full bg-indigo-500 rounded"
            style={{ width: `${(stats.xp / 500) * 100}%` }}
          ></div>
        </div>
      </div>
      </div>

    <div class="border-b border-gray-400 pb-2">
    </div>

      <div className="text-base font-bold mt-4 text-white text-left">
        <p>Tasks Completed: {stats.tasksCompleted}</p>
      </div>
    <div class="border-b border-gray-400 pb-2 mt-2">
    </div>
      <div className='text-base font-bold mt-4 text-white text-left'><span>🔥Streak:</span><span> 1</span></div>
    </div>
  );
}
