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
  const [showConceptDetailsOverlay, setShowConceptDetailsOverlay] = useState(false);
  const [selectedConceptDetails, setSelectedConceptDetails] = useState(null);
  const [showAddSourceOverlay, setShowAddSourceOverlay] = useState(false);
  const [newSource, setNewSource] = useState({ sourceName: '', sourceLink: '' });
  const [addingSource, setAddingSource] = useState(false);
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
    // Initialize source fields
    setNewSource({ sourceName: '', sourceLink: '' });
    setShowOverlay(false);
    setShowStatusOverlay(true);
  };

  // Save concepts and statuses to Firebase
  const handleSaveConceptStatuses = async () => {
    if (!user) return;
    setAdding(true);
    
    // Prepare sources array if source information is provided
    let sources = [];
    if (newSource.sourceName && newSource.sourceLink) {
      sources = [newSource];
    }
    
    // Avoid duplicates by concept+category
    const updatedLearnedConcepts = [
      ...learnedConcepts,
      ...selectedConcepts.filter(
        (item) => !learnedConcepts.some((c) => c.category === item.category && c.concept === item.concept)
      ).map((item) => ({
        ...item,
        status: conceptStatuses[`${item.category}:${item.concept}`] || 'understood',
        addedAt: new Date().toISOString(), // Add timestamp
        sources: sources, // Add sources if provided
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
    setNewSource({ sourceName: '', sourceLink: '' });
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

  // Handle concept click to show details overlay
  const handleConceptClick = async (concept, category) => {
    try {
      // Fetch the learnedConcepts object to get sources for this concept
      const learnedConceptsRef = ref(db, `users/${user.id}/python/learnedConcepts`);
      const learnedConceptsSnap = await get(learnedConceptsRef);
      
      let sources = [];
      let addedAt = null;
      if (learnedConceptsSnap.exists()) {
        const learnedConceptsData = learnedConceptsSnap.val();
        const conceptKey = `${category}:${concept}`;
        const conceptData = learnedConceptsData[conceptKey];
        
        if (conceptData) {
          if (conceptData.sources) {
            sources = Array.isArray(conceptData.sources) ? conceptData.sources : Object.values(conceptData.sources || {});
          }
          addedAt = conceptData.addedAt || null;
        }
      }
      
      setSelectedConceptDetails({
        name: concept,
        category: category,
        learnedFrom: sources,
        addedAt: addedAt
      });
      setShowConceptDetailsOverlay(true);
    } catch (err) {
      console.error("Error fetching concept sources:", err);
      setSelectedConceptDetails({
        name: concept,
        category: category,
        learnedFrom: [],
        addedAt: null
      });
      setShowConceptDetailsOverlay(true);
    }
  };

  // Handle adding new source
  const handleAddSource = () => {
    setNewSource({ sourceName: '', sourceLink: '' });
    setShowAddSourceOverlay(true);
  };

  // Save new source to Firebase
  const handleSaveSource = async () => {
    if (!user || !selectedConceptDetails || !newSource.sourceName || !newSource.sourceLink) return;
    
    setAddingSource(true);
    try {
      // Get the existing learnedConcepts object
      const learnedConceptsRef = ref(db, `users/${user.id}/python/learnedConcepts`);
      const learnedConceptsSnap = await get(learnedConceptsRef);
      
      let learnedConceptsData = {};
      if (learnedConceptsSnap.exists()) {
        learnedConceptsData = learnedConceptsSnap.val();
      }
      
      // Create concept key
      const conceptKey = `${selectedConceptDetails.category}:${selectedConceptDetails.name}`;
      
      // Get existing sources for this concept
      let existingSources = [];
      if (learnedConceptsData[conceptKey] && learnedConceptsData[conceptKey].sources) {
        existingSources = Array.isArray(learnedConceptsData[conceptKey].sources) 
          ? learnedConceptsData[conceptKey].sources 
          : Object.values(learnedConceptsData[conceptKey].sources || {});
      }
      
      // Add new source
      const updatedSources = [...existingSources, newSource];
      
      // Update the concept data with new sources
      const updatedConceptData = {
        ...learnedConceptsData[conceptKey],
        sources: updatedSources
      };
      
      // Update the learnedConcepts object
      await update(ref(db, `users/${user.id}/python/learnedConcepts`), {
        [conceptKey]: updatedConceptData
      });
      
      // Update local state
      setSelectedConceptDetails(prev => ({
        ...prev,
        learnedFrom: updatedSources
      }));
      
      setShowAddSourceOverlay(false);
      setNewSource({ sourceName: '', sourceLink: '' });
    } catch (err) {
      console.error('Error saving source:', err);
    }
    setAddingSource(false);
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
                              className="w-full flex items-center justify-between bg-slate-100 rounded-lg px-4 py-2 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                              onClick={() => handleConceptClick(item.concept, category)}
                            >
                              <span className="font-medium text-slate-700">{item.concept}</span>
                              <div className="flex items-center gap-2 min-w-[200px] justify-end">
                                {/* Application Status - Fixed width container */}
                                <div className="w-20 flex justify-center">
                                  {isConceptApplied(item.concept) ? (
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap border border-green-300">
                                      applied
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold whitespace-nowrap border border-yellow-300">
                                      not applied
                                    </span>
                                  )}
                                </div>
                                
                                {/* Divider */}
                                {item.status && (
                                  <div className="w-px h-4 bg-slate-300 mx-2"></div>
                                )}
                                
                                {/* Concept Status - Fixed width container */}
                                <div className="w-32 flex justify-center">
                                  {item.status && (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border
                                        ${item.status === 'understood' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                                        ${item.status === 'partially understood' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''}
                                        ${item.status === 'still confused' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                                      `}
                                    >
                                      {item.status}
                                    </span>
                                  )}
                                </div>
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
            
            {/* Source Information Section */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">📚 Add Learning Source (Optional)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Source Name
                  </label>
                  <input
                    type="text"
                    value={newSource.sourceName}
                    onChange={(e) => setNewSource(prev => ({ ...prev, sourceName: e.target.value }))}
                    placeholder="e.g., Python Official Documentation"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={adding}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Source Link
                  </label>
                  <input
                    type="url"
                    value={newSource.sourceLink}
                    onChange={(e) => setNewSource(prev => ({ ...prev, sourceLink: e.target.value }))}
                    placeholder="https://example.com/tutorial"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={adding}
                  />
                </div>
              </div>
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

      {/* Concept Details Overlay */}
      {showConceptDetailsOverlay && selectedConceptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl font-bold"
              onClick={() => setShowConceptDetailsOverlay(false)}
            >
              ×
            </button>
            
            {/* Concept Name */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-purple-700 mb-2">
                {selectedConceptDetails.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {selectedConceptDetails.category}
                </span>
                {selectedConceptDetails.addedAt && (
                  <span className="text-sm text-slate-500">
                    📅 Added on {new Date(selectedConceptDetails.addedAt).toLocaleDateString()} at {new Date(selectedConceptDetails.addedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Learned From Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-2xl font-semibold text-slate-800">
                  📚 Learned From
                </h3>
                <button
                  onClick={handleAddSource}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                  title="Add new source"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedConceptDetails.learnedFrom.map((source, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-slate-800 mb-1">
                          {source.sourceName}
                        </h4>
                        <a 
                          href={source.sourceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-sm underline"
                        >
                          {source.sourceLink}
                        </a>
                      </div>
                      <div className="ml-4">
                        <a 
                          href={source.sourceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Visit
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Source Overlay */}
      {showAddSourceOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl font-bold"
              onClick={() => setShowAddSourceOverlay(false)}
              disabled={addingSource}
            >
              ×
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-purple-700">
              Add Learning Source
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  value={newSource.sourceName}
                  onChange={(e) => setNewSource(prev => ({ ...prev, sourceName: e.target.value }))}
                  placeholder="e.g., Python Official Documentation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={addingSource}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source Link
                </label>
                <input
                  type="url"
                  value={newSource.sourceLink}
                  onChange={(e) => setNewSource(prev => ({ ...prev, sourceLink: e.target.value }))}
                  placeholder="https://example.com/tutorial"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={addingSource}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <button
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                onClick={() => setShowAddSourceOverlay(false)}
                disabled={addingSource}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                onClick={handleSaveSource}
                disabled={addingSource || !newSource.sourceName || !newSource.sourceLink}
              >
                {addingSource ? 'Adding...' : 'Add Source'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConceptLearned;