import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDatabase, ref, get, update, onValue } from "firebase/database";
import { db } from "../firebase";
import ConceptLearned from "../components/ConceptLearned";
import Learned from "../assets/learned.png";
import Applied from "../assets/applied.png";
import Project from "../assets/project.png";
import ProjectRecommender from '../components/ProjectRecommender';
import SeeAnother from "../assets/SeeAnother.png";
import { getProjectConfig } from '../PythonProject/projectConfig';
import Assignment from '../components/Assignment';
import AssignmentIcon from '../assets/assignment.png';

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
  const [completedProjects, setCompletedProjects] = useState([]);
  const [showProjectDetailsOverlay, setShowProjectDetailsOverlay] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectData, setProjectData] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [conceptStats, setConceptStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [showProjectOverlay, setShowProjectOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProjectTitle, setCurrentProjectTitle] = useState('');
  const [copiedProjectId, setCopiedProjectId] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showCustomProjectOverlay, setShowCustomProjectOverlay] = useState(false);
  const [selectedCustomConcepts, setSelectedCustomConcepts] = useState([]);
  const [customProjectTheme, setCustomProjectTheme] = useState("");
  const [showConceptPicker, setShowConceptPicker] = useState(false);
  const [conceptPickerChecked, setConceptPickerChecked] = useState({});

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (!user) return;
    // Real-time listener for user data
    const userRef = ref(db, 'users/' + user.id);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          }
          setIsLoading(false);
        });
    // Real-time listener for completed projects
    const completedProjectsRef = ref(db, 'users/' + user.id + '/python/PythonCompletedProjects');
    const unsubscribeProjects = onValue(completedProjectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const projects = snapshot.val();
        const projectsArray = Object.entries(projects).map(([key, project]) => ({
          key,
          ...project
        }));
        setCompletedProjects(projectsArray);
      } else {
        setCompletedProjects([]);
      }
    });
    return () => {
      unsubscribeUser();
      unsubscribeProjects();
    };
  }, [user]);

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

  const fetchConceptStats = async () => {
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
    let learnedConcepts = userData.python?.learnedConcepts || [];
    if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
      learnedConcepts = Object.values(learnedConcepts);
    }
      const learned = learnedConcepts.length;
    
    // Analyze concepts used in completed projects
    const conceptsUsedInProjects = new Set();
    
    // Extract concepts from completed projects
    completedProjects.forEach(project => {
      if (project.conceptUsed) {
        const projectConcepts = project.conceptUsed.split(', ').map(concept => concept.trim());
        projectConcepts.forEach(concept => {
          if (concept) {
            conceptsUsedInProjects.add(concept);
          }
        });
      }
    });
    
    // Count how many learned concepts have been used in projects
    const applied = learnedConcepts.filter(concept => {
      // Check if the concept name is in the concepts used in projects
      return conceptsUsedInProjects.has(concept.concept || concept);
    }).length;
    
      setConceptStats({ learned, applied, total: totalConcepts });
  };

  useEffect(() => {
    fetchConceptStats();
  }, [userData, completedProjects]);

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
    setShowCustomProjectOverlay(true);
  };

  const handleCloseProjectOverlay = () => {
    setShowProjectOverlay(false);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetailsOverlay(true);
  };

  const handleCloseProjectDetails = () => {
    setShowProjectDetailsOverlay(false);
    setSelectedProject(null);
  };

  // Add handler for ending project
  const handleEndProject = async () => {
    if (!user) return;
    const userRef = ref(db, 'users/' + user.id);
    await update(userRef, { 'python/PythonProjectStarted': false });
    setUserData(prev => ({
      ...prev,
      python: {
        ...prev.python,
        PythonProjectStarted: false
      }
    }));
  };

  useEffect(() => {
    // Fetch project title for the current project
    const fetchProjectTitle = async () => {
      if (userData.python?.PythonCurrentProject) {
        const config = await getProjectConfig(userData.python.PythonCurrentProject);
        setCurrentProjectTitle(config?.title || userData.python.PythonCurrentProject);
      } else {
        setCurrentProjectTitle('');
      }
    };
    fetchProjectTitle();
  }, [userData.python?.PythonCurrentProject]);

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

      {/* Project Continue/End Box */}
      {userData.python?.PythonProjectStarted && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between mb-8 mt-6 max-w-3xl mx-auto shadow">
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
            <span className="text-lg font-semibold text-yellow-800">Current Project:</span>
            <span className="text-xl font-bold text-yellow-900">{currentProjectTitle || 'Untitled Project'}</span>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
              onClick={() => navigate('/python/project')}
            >
              Continue Project
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
              onClick={handleEndProject}
            >
              End Project
            </button>
          </div>
        </div>
      )}

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
            {/* SP (STED Points) Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (window.handlePointsClick) {
                  window.handlePointsClick();
                }
              }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">SP(STED Points)</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                    {completedProjects.length * 10 + conceptStats.learned * 2 + conceptStats.applied * 5}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </motion.div>

            {/* Projects Completed Card */}
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
                    {completedProjects.length}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className=""><img className="w-7" src={Project} alt="" /></span>
                  </div>
                </div>
              </motion.div>

            {/* Concepts Applied Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (window.handleAppliedConceptsClick) {
                  window.handleAppliedConceptsClick();
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tasks Completed</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">
                    04
                  </h3>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full">
                  <span className="text-2xl"><img className="w-7" src={AssignmentIcon} alt="" /></span>
                </div>
              </div>
            </motion.div>

                        {/* Concepts Learned Card */}
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



            {/* Concepts Applied Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (window.handleAppliedConceptsClick) {
                  window.handleAppliedConceptsClick();
                }
              }}
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

            {/* Concepts Applied Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (window.handleAppliedConceptsClick) {
                  window.handleAppliedConceptsClick();
                }
              }}
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

          {/* Assignment Section */}
         

          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row gap-6 mt-13 items-start">
            {/* Learning Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white w-full lg:w-2/3 rounded-lg shadow-md p-6"
            >
              <ConceptLearned completedProjects={completedProjects} />
            </motion.div>

            {/* Concept Status Box */}
            <motion.div className="bg-white rounded-lg shadow-md p-6 w-150 h-76 flex flex-col justify-between">
              <div>
              <p className="text-sm text-slate-600">Concepts Status</p>
              {(() => {
                  let learnedConcepts = userData.python?.learnedConcepts || [];
                  if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
                    learnedConcepts = Object.values(learnedConcepts);
                  }
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

          {/* --- Project/Assignment Grid --- */}
          <h2 className="text-2xl text-left font-bold text-slate-800 mb-6 mt-10">Apply learning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

             {/* Assignment Box */}
             <div className="w-full">
              <Assignment learnedConcepts={userData.python?.learnedConcepts || []} />
            </div>
            {/* Project Box */}
            <motion.div className="bg-gradient-to-br from-[#C642F5] via-[#A633D9] to-[#8C1EB6] w-full h-76 rounded-lg shadow-2xl p-6 lg:sticky lg:top-28">
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
           
          </div>

            {/* Project Details Overlay */}
            <AnimatePresence>
              {showProjectOverlay && (
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
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                        <button
                          onClick={handleCloseProjectOverlay}
                      className="absolute top-6 right-8 text-slate-700 hover:text-purple-600 text-4xl font-bold z-10 transition-colors"
                        >
                          ×
                        </button>
                    
                    <div className="p-12">
                      <ProjectRecommender learnedConcepts={userData.python?.learnedConcepts} completedProjects={completedProjects}>
                        {({ recommendedProject, loading, error, getNextProject, hasMultipleProjects, currentProjectIndex, totalProjects }) => {
                          if (loading) return (
                            <div className="flex items-center justify-center py-16">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <div className="text-xl text-gray-600">Loading project recommendation...</div>
                      </div>
                    </div>
                          );
                          if (error) return (
                            <div className="text-center py-16">
                              <div className="text-red-500 text-xl mb-4">⚠️</div>
                              <div className="text-red-500 text-lg">{error}</div>
                            </div>
                          );
                          if (!recommendedProject) return (
                            <div className="text-center py-16">
                              <div className="text-gray-500 text-xl mb-4">🔍</div>
                              <div className="text-gray-600 text-lg">No suitable project found for your learned concepts yet.</div>
                            </div>
                          );
                          return (
                            <>
                              <div className="mb-10">
                                <div className="text-center mb-8 relative">
                                  {/* See Another Link */}
                                  {hasMultipleProjects && (
                                    <div className="absolute top-0 right-0 z-10 group">
                                      <button
                                        onClick={getNextProject}
                                        className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors relative"
                                      >
                                        <img className="w-7" src={SeeAnother} alt="" />
                                        {/* Hover Overlay */}
                                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                                          See Another
                                          {/* Arrow pointing down */}
                                          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                  
                                  <h2 className="text-4xl font-bold mb-4 text-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    {recommendedProject.title}
                                  </h2>
                                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto rounded-full"></div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8 border border-purple-100">
                                  <p className="text-gray-700 text-lg leading-relaxed mb-6">{recommendedProject.description}</p>
                                  
                                  <div className="bg-white rounded-xl p-6 border border-purple-200">
                                    <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                      <span className="text-purple-600">📚</span>
                                      Required Concepts
                        </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {recommendedProject.Concept.split(', ').map((concept, index) => (
                                        <span
                              key={index}
                                          className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200"
                            >
                                          {concept.trim()}
                                        </span>
                          ))}
                                    </div>
                                  </div>
                                </div>
                      </div>

                              <div className="flex gap-4">
                        <button
                                  onClick={async () => {
                                    // Set this project as the user's current project in Firebase
                                    if (!user) return;
                                    const userRef = ref(db, 'users/' + user.id);
                                    // Ensure project key starts with capital 'P'
                                    let projectKey = recommendedProject.id || recommendedProject.title;
                                    if (typeof projectKey === 'string' && projectKey.length > 0) {
                                      projectKey = projectKey[0].toUpperCase() + projectKey.slice(1);
                                    }
                                    await update(userRef, {
                                      'python/PythonCurrentProject': projectKey,
                                      'python/PythonProjectStarted': true
                                    });
                                    setUserData(prev => ({
                                      ...prev,
                                      python: {
                                        ...prev.python,
                                        PythonCurrentProject: projectKey,
                                        PythonProjectStarted: true
                                      }
                                    }));
                                    setShowProjectOverlay(false);
                                    navigate('/python/project');
                                  }}
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          🚀 Start Project
                        </button>
                        <button
                          onClick={handleCloseProjectOverlay}
                                  className="px-8 py-4 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-300 font-semibold text-lg"
                        >
                          Cancel
                        </button>
                      </div>
                            </>
                          );
                        }}
                      </ProjectRecommender>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          
        </div>
      </div>


      {/* Project History Section */}
      <div className="w-full mx-auto lg:px-8 text-left mb-10">
        
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Project History</h2>
        <div className="bg-white hover:bg-[#f7f7f7] rounded-lg shadow-md p-6">
          {completedProjects.length === 0 ? (
            <div className="text-slate-500 italic">No completed projects yet.</div>
          ) : (
              <ul className="divide-y divide-slate-200">
              {completedProjects.map((project, idx) => (
                <li 
                  key={project.key} 
                  className="flex flex-col md:flex-row gap-2 md:gap-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleProjectClick(project)}
                >
                    <div className="flex-1">
                    <div className="text-2xl font-semibold text-slate-800">{project.projectTitle || project.key}</div>
                    <div className="text-slate-500 text-sm mt-2">Completed: {new Date(project.completedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex-none flex flex-col items-end gap-2 md:gap-3">
                    <span className="inline-block text-slate-700 px-3 py-1 text-lg">Click to view details</span>
                    {project.publicUrl && (
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-semibold border border-purple-200 transition-colors"
                          onClick={e => {
                            e.stopPropagation();
                            const url = project.publicUrl.replace('/public/python-project/', '/python-project/');
                            navigator.clipboard.writeText(window.location.origin + url);
                            setCopiedProjectId(project._projectKey);
                            setTimeout(() => setCopiedProjectId(null), 1500);
                          }}
                        >
                          {copiedProjectId === project._projectKey ? 'Copied!' : 'Share'}
                        </button>
                        <a
                          href={project.publicUrl.replace('/public/python-project/', '/python-project/')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold border border-blue-200 transition-colors"
                          style={{ fontWeight: 500 }}
                          onClick={e => e.stopPropagation()}
                        >
                          Preview
                        </a>
                      </div>
                    )}
                    </div>
                  </li>
                ))}
              </ul>
          )}
        </div>
      </div>

      {/* Project Details Overlay */}
      <AnimatePresence>
        {showProjectDetailsOverlay && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseProjectDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseProjectDetails}
                className="absolute top-6 right-8 text-slate-700 hover:text-purple-600 text-4xl font-bold z-10 transition-colors"
              >
                ×
              </button>
              
              <div className="p-8 overflow-y-auto max-h-[90vh]">
                {/* Project Header */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-3xl font-bold mb-6 text-purple-700">{selectedProject.projectTitle}</h2>
                  
                  {/* Concepts Used Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                      <span className="text-purple-600">📚</span>
                      Concepts Used
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedProject.conceptUsed ? 
                        selectedProject.conceptUsed.split(', ').map((concept, index) => (
                          <span
                            key={index}
                            className="inline-block bg-white text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-300 shadow-sm hover:shadow-md transition-shadow"
                          >
                            {concept.trim()}
                          </span>
                        )) : 
                        <span className="text-gray-500 italic">No concepts specified</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Code Section with Dropdown */}
                <div className="mb-8">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-purple-600">💻</span>
                        Project Code
                      </h3>
                      <svg 
                        className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4">
                      <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
                        <pre className="text-sm text-left text-white leading-relaxed">{selectedProject.code}</pre>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Terminal Output Section with Dropdown */}
                {selectedProject.terminalOutput && selectedProject.terminalOutput.length > 0 && (
                  <div className="mb-8">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-purple-600">🖥️</span>
                          Terminal Output
                        </h3>
                        <svg 
                          className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-4">
                        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
                          <pre className="text-sm leading-relaxed">{selectedProject.terminalOutput.join('\n')}</pre>
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {/* Project Statistics */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
                    <span>📊</span>
                    Project Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">Code Length</div>
                      <div className="text-lg font-semibold text-purple-700">
                        {selectedProject.code ? selectedProject.code.split('\n').length : 0} lines
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">Completion Date</div>
                      <div className="text-lg font-semibold text-purple-700">
                        {new Date(selectedProject.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(selectedProject.completedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Coming Soon Overlay */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl px-10 py-8 max-w-sm w-full text-center relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold"
                onClick={() => setShowComingSoon(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="text-4xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Coming soon...</h2>
              <p className="text-slate-600 mb-4">Custom projects are on the way! Stay tuned for updates.</p>
              <button
                className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow"
                onClick={() => setShowComingSoon(false)}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Custom Project Overlay */}
      <AnimatePresence>
        {showCustomProjectOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-[2px] drop-shadow-2xl"
            onClick={() => setShowCustomProjectOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white border-2 border-purple-200 rounded-3xl shadow-2xl px-16 py-12 max-w-3xl w-full h-[38rem] text-left relative flex flex-col justify-between"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-7 text-purple-400 hover:text-purple-700 text-3xl font-extrabold bg-white/70 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-purple-100 transition-colors"
                onClick={() => setShowCustomProjectOverlay(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-3xl font-extrabold mb-8 text-purple-800 tracking-tight drop-shadow">Create Custom Project</h2>
              <div className="mb-8">
                <label className="block text-lg font-semibold text-purple-700 mb-3">Concepts Used</label>
                <div className="flex flex-wrap gap-3 min-h-[3.5rem] max-h-40 overflow-y-auto bg-purple-50/60 rounded-xl p-3 mb-3 border border-purple-200">
                  {selectedCustomConcepts.length === 0 && (
                    <span className="text-purple-300 text-base">No concepts selected</span>
                  )}
                  {selectedCustomConcepts.map((c, i) => (
                    <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white border-2 border-purple-300 text-base font-semibold shadow-md">
                      {c}
                    </span>
                  ))}
                </div>
                <button
                  className="mt-2 px-6 py-2 bg-purple-600 cursor-pointer hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                  onClick={() => setShowConceptPicker(true)}
                  type="button"
                >
                  + Add Concept
                </button>
              </div>
              <div className="border-t border-purple-200 my-6"></div>
              <div className="mb-8">
                <label className="block text-lg font-semibold text-purple-700 mb-3">Project Theme (Optional)</label>
                <input
                  type="text"
                  value={customProjectTheme}
                  onChange={e => setCustomProjectTheme(e.target.value)}
                  placeholder="e.g. Personal Finance Tracker"
                  className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg bg-white/80 shadow"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  className="px-6 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-base shadow"
                  onClick={() => setShowCustomProjectOverlay(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-base shadow-lg"
                  onClick={() => setShowCustomProjectOverlay(false)}
                  disabled={selectedCustomConcepts.length === 0 || !customProjectTheme}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Concept Picker Overlay */}
      <AnimatePresence>
        {showConceptPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowConceptPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl px-10 py-8 max-w-lg w-full text-left relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold"
                onClick={() => setShowConceptPicker(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-slate-800">Select Concepts</h2>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {['basic', 'intermediate', 'advanced'].map(cat => {
                  const allConcepts = userData.python?.learnedConcepts
                    ? (Array.isArray(userData.python.learnedConcepts)
                        ? userData.python.learnedConcepts
                        : Object.values(userData.python.learnedConcepts))
                    : [];
                  const catConcepts = allConcepts.filter(c => c.category === cat);
                  if (catConcepts.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="font-semibold text-lg mb-2 capitalize">{cat}</div>
                      <div className="grid grid-cols-2 gap-3">
                        {catConcepts.map((c, i) => (
                          <label key={c.concept} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!conceptPickerChecked[c.concept]}
                              onChange={e => setConceptPickerChecked(prev => ({ ...prev, [c.concept]: e.target.checked }))}
                            />
                            <span>{c.concept}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                  onClick={() => setShowConceptPicker(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                  onClick={() => {
                    const selected = Object.entries(conceptPickerChecked)
                      .filter(([_, v]) => v)
                      .map(([k]) => k);
                    setSelectedCustomConcepts(prev => Array.from(new Set([...prev, ...selected])));
                    setShowConceptPicker(false);
                  }}
                  disabled={Object.values(conceptPickerChecked).every(v => !v)}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Python;
