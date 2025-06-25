import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDatabase, ref, get, update } from "firebase/database";
import { db } from "../firebase";
import ConceptLearned from "../components/ConceptLearned";
import Learned from "../assets/learned.png";
import Applied from "../assets/applied.png";
import Project from "../assets/project.png";

function Python() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [userData, setUserData] = useState({
    level: "",
    xp: 0,
    tasksCompleted: 0,
    pythonSkill: 0,
    sqlSkill: 0,
    mlSkill: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [conceptStats, setConceptStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [showProjectOverlay, setShowProjectOverlay] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const userRef = ref(db, "users/" + user.id);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (userData.python && userData.python.PythonCurrentProject) {
      setProjectLoading(true);
      setProjectError("");
      const projectRef = ref(db, `PythonProject/${userData.python.PythonCurrentProject}`);
      get(projectRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setProjectData(snapshot.val());
          } else {
            setProjectError("Project not found.");
          }
        })
        .catch((err) => {
          setProjectError("Failed to fetch project: " + err.message);
        })
        .finally(() => {
          setProjectLoading(false);
        });
    } else {
      setProjectData(null);
      setProjectError("");
    }
  }, [userData.python]);

  useEffect(() => {
    async function fetchConceptStats() {
      if (!userData?.python) return;
      // Fetch all concepts
      const allConceptsRef = ref(db, 'PythonProject/AllConcepts/category');
      const allConceptsSnap = await get(allConceptsRef);
      let totalConcepts = 0;
      if (allConceptsSnap.exists()) {
        const data = allConceptsSnap.val();
        totalConcepts = [
          ...Object.values(data.basic || {}),
          ...Object.values(data.intermediate || {}),
          ...Object.values(data.advanced || {}),
        ].length;
      }
      // Get learned concepts
      const learnedConcepts = Array.isArray(userData.python.learnedConcepts) ? userData.python.learnedConcepts : [];
      const learned = learnedConcepts.length;
      const applied = learnedConcepts.filter(c => c.usedInProject).length;
      setConceptStats({ learned, applied, total: totalConcepts });
    }
    fetchConceptStats();
  }, [userData]);

  const toggleProgress = () => {
    setShowProgress(!showProgress);
  };

  const handleStartProject = async () => {
    if (!user) return;

    try {
      const userRef = ref(db, 'users/' + user.id);
      const updates = {
        'python/PythonProjectStarted': true
      };
      await update(userRef, updates);

      // Update local state
      setUserData(prev => ({
        ...prev,
        python: {
          ...prev.python,
          PythonProjectStarted: true
        }
      }));

      // Navigate to project page
      navigate('/python/project');
    } catch (err) {
      console.error('Failed to update project status:', err);
      // Still navigate even if update fails
      navigate('/python/project');
    }
  };

  const handleNextProjectClick = () => {
    setShowProjectOverlay(true);
  };

  const handleCustomProjectClick = () => {
    // TODO: Implement custom project functionality
    console.log("Custom project clicked");
  };

  const handleCloseProjectOverlay = () => {
    setShowProjectOverlay(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 text-base">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Professional top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-purple-600" />

      {/* Navbar */}
      <div className="sticky top-1 z-50 bg-white shadow-sm">
        <Navbar
          onProgressClick={toggleProgress}
          showProgress={showProgress}
          hideProgressButton={true}
        />
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="w-full relative px-4 lg:px-8 pb-12">
          {/* Header Section */}
           
              <div className="text-left mt-6">
                <h1 className="text-3xl font-bold text-slate-800">Python</h1>
            </div>
          

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Stats Cards */}
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Current Level</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                      {userData.level || "Beginner"}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Projects Completed</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                      {userData.tasksCompleted || 0}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className=""><img className="w-7" src={Project} alt="" /></span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Concepts Learned</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                      {conceptStats.learned} / {conceptStats.total}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className="text-2xl"><img className="w-7" src={Learned} alt="" /></span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Concepts Applied</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                      {conceptStats.applied} / {conceptStats.learned}
                    </h3>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-full">
                    <span className="text-2xl"><img className="w-7" src={Applied} alt="" /></span>
                  </div>
                </div>
              </motion.div>

              
            </div>

            {/* Concept Status Card - moved to right side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-between"
            >
              <div>
              <p className="text-sm text-slate-600">Concepts Status</p>
              {(() => {
                  const learnedConcepts = Array.isArray(userData.python?.learnedConcepts) ? userData.python.learnedConcepts : [];
                  const totalLearned = learnedConcepts.length;
                  const statusCounts = learnedConcepts.reduce((acc, c) => {
                    if (c.status === 'understood') acc.understood++;
                    else if (c.status === 'partially understood') acc.partially++;
                    else if (c.status === 'still confused') acc.confused++;
                    return acc;
                  }, { understood: 0, partially: 0, confused: 0 });
                  return (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 mt-3 border-b border-slate-200 pb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-black mr-2"></span>
                        <span className="text-black font-normal">Understood</span>
                        <span className="ml-auto text-black px-2 py-0.5 rounded-full text-lg font-semibold">{statusCounts.understood} / {totalLearned}</span>
                      </div>
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-black mr-2"></span>
                        <span className="text-black font-normal">Partially Understood</span>
                        <span className="ml-auto text-black px-2 py-0.5 rounded-full text-lg font-semibold">{statusCounts.partially} / {totalLearned}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-black mr-2"></span>
                        <span className="text-black font-normal">Still Confused</span>
                        <span className="ml-auto text-black px-2 py-0.5 rounded-full text-lg font-semibold">{statusCounts.confused} / {totalLearned}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row gap-6 mt-13 items-start">
            {/* Learning Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white w-full lg:w-2/3 rounded-lg shadow-md p-6"
            >
              <ConceptLearned />
            </motion.div>

            {/* Project Card - Make sticky on large screens */}
            <motion.div
              className="bg-gradient-to-br from-[#C642F5] via-[#A633D9] to-[#8C1EB6] w-full lg:w-1/3 h-76 rounded-lg shadow-2xl p-6 lg:sticky lg:top-28"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Project
              </h2>
              {userData.python && userData.python.PythonCurrentProject ? (
                projectLoading ? (
                  <div className="text-white">Loading project...</div>
                ) : projectError ? (
                  <div className="text-red-300">{projectError}</div>
                ) : projectData ? (
                  <>
                    <div className="flex justify-center mt-10">
                    <div className="space-y-9 w-100">
                      <button
                        onClick={handleNextProjectClick}
                        className="w-full inline-flex items-center cursor-pointer justify-center gap-2 bg-purple-900 text-white hover:bg-purple-700 font-semibold px-4 py-3 rounded-lg shadow-md transition-colors"
                      >
                        🚀 Next Project
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
                        onClick={handleCustomProjectClick}
                        className="w-full inline-flex items-center justify-center gap-2 text-white cursor-pointer font-semibold px-4 py-3 rounded-lg shadow-md transition-colors border border-white border-opacity-30"
                      >
                        ⚙️ Custom Project
                        
                      </button>
                    </div>
                    </div>
                  </>
                ) : (
                  <div className="text-white">No project assigned. Click "Start Learning" to begin your first project.</div>
                )
              ) : (
                <div className="text-white">No project assigned. Click "Start Learning" to begin your first project.</div>
              )}
            </motion.div>

            {/* Project Details Overlay */}
            <AnimatePresence>
              {showProjectOverlay && projectData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                  onClick={handleCloseProjectOverlay}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{projectData.title}</h2>
                          <p className="text-purple-100 text-sm leading-relaxed">
                            {projectData.description}
                          </p>
                        </div>
                        <button
                          onClick={handleCloseProjectOverlay}
                          className="text-white hover:text-purple-200 transition-colors text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Concepts Used */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-left">
                          <span className="text-purple-600 mr-2">💡</span>
                          Concepts Used
                        </h3>
                        <ul className="space-y-2">
                          {(Array.isArray(projectData.Concept) ? projectData.Concept : projectData.Concept.split(',').map(c => c.trim())).map((concept, index) => (
                            <li
                              key={index}
                              className="bg-purple-100 text-left text-purple-700 px-3 py-2 rounded-lg text-sm font-medium list-none"
                            >
                              {concept}
                            </li>
                          ))}
                        </ul>
                      </div>


                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleStartProject}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          🚀 Start Project
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
                          onClick={handleCloseProjectOverlay}
                          className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Professional bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600" />
    </div>
  );
}

export default Python;
