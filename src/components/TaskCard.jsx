import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../firebase'; // Make sure this is correct

const db = getDatabase(app);

export default function TaskCard({ task }) {
  const [showHowToDo, setShowHowToDo] = useState(false);
  const [howToData, setHowToData] = useState({ title: '', description: {} });
  const [allInformation, setAllInformation] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showHowToDo && task?.id) {
      const fetchHowTo = async () => {
        setIsLoading(true);
        try {
          const snap = await get(ref(db, `tasks/${task.id}/allInformation/howToDo`));
          if (snap.exists()) {
            const data = snap.val();
            setHowToData({
              title: data.title || 'How to Complete This Task',
              description: data.description || {},
            });
          }
        } catch (error) {
          console.error('Error fetching how-to data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHowTo();
    }
  }, [showHowToDo, task?.id]);

  useEffect(() => {
    if (task?.id) {
      const fetchAllInformation = async () => {
        try {
          const snap = await get(ref(db, `tasks/${task.id}/allInformation/example`));
          if (snap.exists()) {
            const data = snap.val();
            setAllInformation({
              title: data.title || 'Example',
              description: data.description || '',
            });
          }
        } catch (error) {
          console.error('Error fetching example data:', error);
        }
      };

      fetchAllInformation();
    }
  }, [task?.id]);

  if (!task) {
    return (
      <div className="w-230 h-[560px] rounded-3xl shadow-2xl border overflow-hidden bg-white p-6 flex items-center justify-center">
        <p className="text-gray-500">No task available</p>
      </div>
    );
  }

  return (
    <div className="w-230 h-[560px] rounded-3xl shadow-2xl border overflow-hidden bg-white p-6 bg-gradient-to-br text-left from-[#fefcea] via-[#e7f0fd] to-[#f5faff]">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : !showHowToDo ? (
        // --- Page 1: Task Info ---
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Task - {task.id?.replace(/\D/g, '') || ''}
            </h2>
            <h1 className="text-4xl font-extrabold text-[#1f2937] my-3">
              {task.title || 'Untitled Task'}
            </h1>
            <p className="text-gray-700 pt-2 text-lg">{task.description || 'No description available'}</p>

            <div className="mt-13 flex justify-between">
              <div className="space-y-3">
                <p className='pt-3'><strong>⌛ Duration:</strong> <span>{task.duration || 'Not specified'}</span></p>
                <p><strong>📂 Category:</strong> {task.category || 'Uncategorized'}</p>
                <p className='pt-3'><strong>🏆 Reward:</strong> <span className="text-green-600 font-semibold">+{task.xp || 0} XP</span></p>
                <p className='pt-3'><strong>🔥 Difficulty:</strong> {task.difficulty || 'Not specified'}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border w-80 shadow max-h-100">
                <strong className="block mb-2">🎯 Objectives</strong>
                <ul className="list-disc ml-5 space-y-1 text-lg">
                  {task.objective && typeof task.objective === 'object' ? 
                    Object.values(task.objective).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    )) : 
                    <li>No objectives specified</li>
                  }
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
              {howToData.description && typeof howToData.description === 'object' ? 
                Object.values(howToData.description).map((obj, i) => (
                  <li className='pt-2' key={i}>{obj}</li>
                )) :
                <li>No instructions available</li>
              }
            </ul>
          </div>

          <div>
            <h1 className='font-bold mt-8'>Example:</h1>
            <h2 className="text-xl font-bold mb-4">{allInformation.title}</h2>
            <h2 className='font-bold'>Right here, you speak:</h2>
            <p className='text-gray-700'>{allInformation.description || 'No example available'}</p>
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
