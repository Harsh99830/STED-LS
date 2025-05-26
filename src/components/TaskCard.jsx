import React from 'react';

export default function TaskCard({ task }) {
  return (
    <div className="bg-white pl-4 pt-3 pb-4 rounded-xl shadow-md w-180 border max-h-130 text-left">
      <h2 className="text-lg font-bold mb-2">Task- {task.id[4]}</h2>
      <h1 className="text-6xl font-bold text-black mb-3">{task.title}</h1>
      <p className="text-gray-600 font-medium mt-6 text-xl">{task.description}</p>
      <div className='mt-12 leading-relaxed'>
      <p className="text-sm mb-4"><span className='text-lg font-bold'>Category: </span> <span className="text-lg">{task.category}</span></p>
      <p className="text-sm mb-4"><span className='text-lg font-bold'>Reward:</span> <span className="font-semibold">+{task.xp}XP</span></p>
      <div className='flex w-170 mb-4'>
      <p className="text-lg "><span className='font-bold'>Difficulty level:</span> 
        <span className="ml-2 inline-block w-3 h-3 bg-yellow-400 rounded-full" />
        <span className="ml-1">{task.difficulty}</span>
      </p>

      <div className="bg-white p-2 rounded-xl shadow-md border w-60 max-h-40 -mt-20 ml-50 pb-4 text-left"><span className='font-bold'>Objectives</span>
        <ul className="list-disc text-sm pl-4 pt-2">
            {task.objective && Object.values(task.objective).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
      </div>
      </div>
      </div>
      <div className='flex mt-10 w-60'>
      <p className='text-lg font-semibold'>How to do it?</p>
      <button style={{width:"50px",height:"24px"}} className='bg-blue-500 text-white rounded-2xl mt-1'>click</button>
      </div>

    </div>
  );
}
