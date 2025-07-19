import React, { useState, useEffect } from 'react';
import { FaForward } from 'react-icons/fa';

function Assignment({ learnedConcepts = [] }) {
  const [assignments, setAssignments] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    // Generate assignments based on learned concepts
    let concepts = learnedConcepts;
    if (typeof concepts === 'object' && !Array.isArray(concepts)) {
      concepts = Object.values(concepts);
    }
    // Simple mock assignment generator
    const generated = concepts.slice(0, 10).map((c, i) => {
      const type = i % 2 === 0 ? 'Fix a bug' : 'Add a feature';
      return {
        id: `${c.category}-${c.concept}`,
        title: `${type} using ${c.concept}`,
        description: type === 'Fix a bug'
          ? `Find and fix a bug in a code snippet that uses the concept: ${c.concept}.`
          : `Add a new feature to a codebase using the concept: ${c.concept}.`,
        concept: c.concept,
        category: c.category
      };
    });
    setAssignments(generated);
    setCurrentIdx(0);
  }, [learnedConcepts]);

  const handleSkip = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (assignments.length === 0 ? 0 : (prev + 1) % assignments.length));
  };

  if (!assignments.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 max-w-xl mx-auto mt-10">
        <div className="text-slate-500 italic text-center">No assignments available yet. Learn some concepts to unlock assignments!</div>
      </div>
    );
  }

  const a = assignments[currentIdx];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 max-200 h-76 mx-auto relative flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Assignment</h2>
                    <div className="flex justify-center mt-10">
                    <div className="space-y-9 w-100">
                      <button
                        className="w-full inline-flex items-center cursor-pointer justify-center gap-2text-white font-semibold px-4 py-3 rounded-lg shadow-md transition-colors"
                      >
                        🚀 Next Assignment
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      
                      <button
                       
                        className="w-full inline-flex items-center justify-center gap-2 cursor-pointer font-semibold px-4 py-3 rounded-lg shadow-md transition-colors border border-white border-opacity-30"
                      >
                        ⚙️ Custom Assigment
                        
                      </button>
                    </div>
                    </div>
                 
    </div>
  );
}

export default Assignment; 