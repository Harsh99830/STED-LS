import React from 'react';

export default function TaskCard({ task }) {
  return (
    <div className="bg-white pl-4 pt-3 rounded-xl shadow-md w-180 border mt-7 h-130 text-left">
      <h2 className="text-lg font-bold mb-2">Task- {task.id[4]}</h2>
      <h1 className="text-4xl font-bold text-black mb-3">{task.title}</h1>
      <p className="text-gray-600 font-medium mb-2 text-sm mb-5">{task.description}</p>
      <p className="text-sm mb-1"><span className='text-lg font-semibold'>Reward:</span> <span className="font-semibold">+{task.xp}XP</span></p>
      <div className='flex w-170'>
      <p className="text-lg font-semibold mb-10">Difficulty level: 
        <span className="ml-2 inline-block w-3 h-3 bg-yellow-400 rounded-full" />
        <span className="ml-1">{task.difficulty}</span>
      </p>

      <div className="bg-white p-2 rounded-xl shadow-md border w-60 max-h-40 -mt-6 ml-50 text-left"><span className='font-bold'>Objectives</span>
        <ul className="list-disc text-sm pl-4 pt-2">
            {task.objective && Object.values(task.objective).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
      </div>
      </div>
      <div className='flex gap-3 w-60'>
      <p className='text-lg font-semibold'>How to do it?</p>
      <button style={{width:"50px",height:"24px"}} className='bg-blue-500 text-white rounded-2xl mt-1'>click</button>
      </div>

    </div>
  );
}
