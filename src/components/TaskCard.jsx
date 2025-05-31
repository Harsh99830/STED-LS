import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../firebase'; // Make sure this is correct

const db = getDatabase(app);

export default function TaskCard({ task }) {
  const [showHowToDo, setShowHowToDo] = useState(false);
  const [howToData, setHowToData] = useState({ title: '', description: '' });
  const [allInformation, setAllInformation] = useState({ title: '', description: '' });

  useEffect(() => {
    if (showHowToDo) {
      const fetchHowTo = async () => {
        const snap = await get(ref(db, `tasks/${task.id}/allInformation/howToDo`));
        if (snap.exists()) {
          const data = snap.val();
          setHowToData({
            title: data.title || '',
            description: data.description || '',
          });
        }
      };

      fetchHowTo();
    }
  }, [showHowToDo, task.id]);

  useEffect(() => {
    const fetchAllInformation = async () => {
      const snap = await get(ref(db, `tasks/${task.id}/allInformation/example`));
      if (snap.exists()) {
        const data = snap.val();
        setAllInformation({
          title: data.title || '',
          description: data.description || '',
        });
      }
    };

    fetchAllInformation();
  }, [task.id]);

  return (
    <div className="w-[720px] h-[560px] rounded-3xl shadow-2xl border overflow-hidden bg-white p-6 bg-gradient-to-br text-left from-[#fefcea] via-[#e7f0fd] to-[#f5faff]">
      {!showHowToDo ? (
        // --- Page 1: Task Info ---
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Task - {task.id.replace(/\D/g, '')}</h2>
            <h1 className="text-4xl font-extrabold text-[#1f2937] my-3">{task.title}</h1>
            <p className="text-gray-700 font-medium text-lg">{task.description}</p>

            <div className="mt-13 flex justify-between">
              <div className="space-y-3">
                <p><strong>📂 Category:</strong> {task.category}</p>
                <p className='pt-3'><strong>🏆 Reward:</strong> <span className="text-green-600 font-semibold">+{task.xp} XP</span></p>
                <p className='pt-3'><strong>🔥 Difficulty:</strong> {task.difficulty}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border w-80 shadow max-h-40">
                <strong className="block mb-2">🎯 Objectives</strong>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  {task.objective && Object.values(task.objective).map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex">
            <p className="text-lg font-semibold text-gray-800 mb-2">💡 How to do it?</p>
            <button
              onClick={() => setShowHowToDo(true)}
              className="bg-blue-500 ml-5 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600 transition"
            >
              Click
            </button>
          </div>
        </div>
      ) : (
        // --- Page 2: How To Do It ---
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-2xl font-bold underline mb-4">{howToData.title}</h2>
            <h1 className='font-bold mt-8'>🎯 What to Do:</h1>
            
              <ul className="list-disc ml-5 space-y-1 ml-13">
                {Object.values(howToData.description).map((obj, i) => (
                  <li className='pt-2' key={i}>{obj}</li>
                ))}
              </ul>
            
         
          </div>


            <div>
            <h1 className='font-bold mt-8'>Example:</h1>
            <h2 className="text-xl font-bold mb-4">{allInformation.title}</h2>
            <h2 className='font-bold'>Right here, you speak:</h2>
          <p className='text-gray-700'>{allInformation.description}</p>
         
          </div>

          <div className="mt-auto">
          <button
            onClick={() => setShowHowToDo(false)}
            className="w-20 text-white px-4 py-2 bg-blue-500 rounded text-sm"
          >
            ← Back
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
