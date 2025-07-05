import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

function ConceptLearned({ completedProjects = [] }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [allConcepts, setAllConcepts] = useState({ basic: [], intermediate: [], advanced: [] });
  const [learnedConcepts, setLearnedConcepts] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [showStatusOverlay, setShowStatusOverlay] = useState(false);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [conceptStatuses, setConceptStatuses] = useState({});
  const { user } = useUser();

  // Fetch all concepts and user's learned concepts
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all concepts
        const allConceptsRef = ref(db, 'PythonProject/AllConcepts/category');
        const allConceptsSnap = await get(allConceptsRef);
        if (allConceptsSnap.exists()) {
          const data = allConceptsSnap.val();
          setAllConcepts({
            basic: Object.values(data.basic || {}),
            intermediate: Object.values(data.intermediate || {}),
            advanced: Object.values(data.advanced || {}),
          });
        }

        // Fetch user's learned concepts
        const userConceptsRef = ref(db, `users/${user.id}/python/learnedConcepts`);
        const userConceptsSnap = await get(userConceptsRef);
        if (userConceptsSnap.exists()) {
          const val = userConceptsSnap.val() || {};
          // Convert object to array for UI
          setLearnedConcepts(Array.isArray(val) ? val : Object.values(val));
        }
      } catch (err) {
        console.error("Error fetching concepts:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Open overlay
  const handleOpenOverlay = () => {
    setShowOverlay(true);
  };

  // Handle check/uncheck
  const handleCheck = (category, concept) => {
    setChecked((prev) => ({
      ...prev,
      [`${category}:${concept}`]: !prev[`${category}:${concept}`],
    }));
  };

  // Add selected concepts to user's learned concepts (step 1: show status overlay)
  const handleAddConcepts = () => {
    const selected = Object.entries(checked)
      .filter(([_, v]) => v)
      .map(([k]) => {
        const [cat, concept] = k.split(':');
        return { category: cat, concept, usedInProject: false };
      });
    if (selected.length === 0) {
      setShowOverlay(false);
      setChecked({});
      return;
    }
    setSelectedConcepts(selected);
    // Initialize statuses to empty
    const initialStatuses = {};
    selected.forEach((item) => {
      initialStatuses[`${item.category}:${item.concept}`] = '';
    });
    setConceptStatuses(initialStatuses);
    setShowOverlay(false);
    setShowStatusOverlay(true);
  };

  // Save concepts and statuses to Firebase
  const handleSaveConceptStatuses = async () => {
    if (!user) return;
    setAdding(true);
    // Avoid duplicates by concept+category
    const updatedLearnedConcepts = [
      ...learnedConcepts,
      ...selectedConcepts.filter(
        (item) => !learnedConcepts.some((c) => c.category === item.category && c.concept === item.concept)
      ).map((item) => ({
        ...item,
        status: conceptStatuses[`${item.category}:${item.concept}`] || 'understood',
      })),
    ];
    // Save as object, key by concept:category
    const learnedConceptsObj = {};
    updatedLearnedConcepts.filter(Boolean).forEach((c) => {
      learnedConceptsObj[`${c.category}:${c.concept}`] = c;
    });
    try {
      await update(ref(db, `users/${user.id}/python`), {
        learnedConcepts: learnedConceptsObj,
      });
      setLearnedConcepts(Object.values(learnedConceptsObj));
    } catch (err) {
      console.error('Error saving concept statuses:', err);
    }
    setAdding(false);
    setShowStatusOverlay(false);
    setChecked({});
    setSelectedConcepts([]);
    setConceptStatuses({});
  };
  
  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // Calculate progress
  const getCounts = (category) => {
    const total = allConcepts[category].length;
    const learned = learnedConcepts.filter((c) => c.category === category).length;
    return { total, learned };
  };

  const basicCounts = getCounts('basic');
  const intermediateCounts = getCounts('intermediate');
  const advancedCounts = getCounts('advanced');

  const totalLearned = basicCounts.learned + intermediateCounts.learned + advancedCounts.learned;
  const totalConcepts = basicCounts.total + intermediateCounts.total + advancedCounts.total;
  const progressPercentage = totalConcepts > 0 ? (totalLearned / totalConcepts) * 100 : 0;
  
  const isLearned = (category, concept) => {
    return learnedConcepts.some(c => c.category === category && c.concept === concept);
  };

  // Check if a concept has been used in completed projects
  const isConceptApplied = (concept) => {
    return completedProjects.some(project => {
      if (project.conceptUsed) {
        const projectConcepts = project.conceptUsed.split(', ').map(c => c.trim());
        return projectConcepts.includes(concept);
      }
      return false;
    });
  };

  return (
    <div className='text-left'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Concept Learned
        </h2>
        <button
          className='border border-slate-300 rounded-md py-1 px-2 cursor-pointer hover:bg-slate-50 transition-colors'
          onClick={handleOpenOverlay}
        >
          ➕ Add Concept
        </button>
      </div>

      <div className='w-full flex items-center gap-2'>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className='text-sm font-medium text-slate-600'>{totalLearned}/{totalConcepts}</span>
      </div>

      <div className='pt-3 flex flex-col space-y-2'>
        {['basic', 'intermediate', 'advanced'].map((category) => {
          const counts = getCounts(category);
          const categoryLearnedConcepts = learnedConcepts.filter((c) => c.category === category);
          const isOpen = openCategory === category;

          return (
            <div key={category} className="bg-slate-50 p-3 rounded-lg shadow-sm">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <div className='text-lg font-medium text-slate-700 capitalize'>
                  {category} <span className='font-normal text-slate-500'>({counts.learned}/{counts.total})</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown className='text-slate-500' />
                </motion.div>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '12px' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-200 pt-3">
                      {categoryLearnedConcepts.length > 0 ? (
                        <div className="space-y-2">
                          {categoryLearnedConcepts.map((item) => (
                            <div
                              key={item.concept}
                              className="w-full flex items-center justify-between bg-slate-100 rounded-lg px-4 py-2 shadow-sm border border-slate-200"
                            >
                              <span className="font-medium text-slate-700">{item.concept}</span>
                              <div className="flex items-center gap-2">
                                {!isConceptApplied(item.concept) && (
                                  <span className="ml-3 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold whitespace-nowrap">
                                    not applied
                                  </span>
                                )}
                                {item.status && (
                                  <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
                                      ${item.status === 'understood' ? 'bg-green-100 text-green-700' : ''}
                                      ${item.status === 'partially understood' ? 'bg-orange-100 text-orange-700' : ''}
                                      ${item.status === 'still confused' ? 'bg-red-100 text-red-700' : ''}
                                    `}
                                  >
                                    {item.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="italic text-slate-400">No concepts learned in this category yet.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Overlay for adding concepts */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-800 text-xl"
              onClick={() => setShowOverlay(false)}
              disabled={adding}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Add Concepts</h3>
            {loading ? (
              <div className="text-center py-8">Loading concepts...</div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {['basic', 'intermediate', 'advanced'].map((cat) => (
                  <div key={cat}>
                    <div className="font-semibold text-lg mb-2 capitalize">{cat}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {allConcepts[cat].map((concept) => (
                        <label key={concept} className={`flex items-center gap-2 ${isLearned(cat, concept) ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={!!checked[`${cat}:${concept}`]}
                            onChange={() => handleCheck(cat, concept)}
                            disabled={adding || isLearned(cat, concept)}
                          />
                          <span>{concept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6 gap-3">
              <button
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                onClick={() => setShowOverlay(false)}
                disabled={adding}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                onClick={handleAddConcepts}
                disabled={adding || loading}
              >
                {adding ? 'Adding...' : 'Add Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for concept status selection */}
      {showStatusOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-800 text-xl"
              onClick={() => { setShowStatusOverlay(false); setAdding(false); }}
              disabled={adding}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Set Concept Status</h3>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {selectedConcepts.map((item) => (
                <div key={`${item.category}:${item.concept}`} className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-medium text-slate-700 w-48">{item.concept} <span className="text-xs text-slate-400">({item.category})</span></span>
                  <select
                    className="border rounded px-2 py-1"
                    value={conceptStatuses[`${item.category}:${item.concept}`] || ''}
                    onChange={e => setConceptStatuses(s => ({ ...s, [`${item.category}:${item.concept}`]: e.target.value }))}
                    disabled={adding}
                  >
                    <option value="">Select status</option>
                    <option value="understood">Understood</option>
                    <option value="partially understood">Partially Understood</option>
                    <option value="still confused">Still Confused</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                onClick={() => { setShowStatusOverlay(false); setAdding(false); }}
                disabled={adding}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                onClick={handleSaveConceptStatuses}
                disabled={adding || Object.values(conceptStatuses).some(v => !v)}
              >
                {adding ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConceptLearned;