import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { db } from "../firebase";
import ConceptLearned from "../components/ConceptLearned";
import Learned from "../assets/learned.png";
import AssignmentIcon from '../assets/Assignment.png';

function Javascript() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [userData, setUserData] = useState({
    level: "",
    xp: 0,
    tasksCompleted: 0,
    JavascriptSkill: 0,
    sqlSkill: 0,
    mlSkill: 0,
  });
  const [showProgress, setShowProgress] = useState(false);
  const [conceptStats, setConceptStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
    return () => {
      unsubscribeUser();
    };
  }, [user]);


  const fetchConceptStats = async () => {
      if (!userData?.javascript) return;
    
      // Fetch all concepts
      const allConceptsRef = ref(db, 'JavascriptProject/AllConcepts/category');
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
    let learnedConcepts = userData.javascript?.learnedConcepts || [];
    if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
      learnedConcepts = Object.values(learnedConcepts);
    }
      const learned = learnedConcepts.length;
    
    // For now, set applied to 0 since we're removing project functionality
    const applied = 0;
    
      setConceptStats({ learned, applied, total: totalConcepts });
  };

  useEffect(() => {
    fetchConceptStats();
  }, [userData]);

  const toggleProgress = () => {
    setShowProgress(!showProgress);
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
                <h1 className="text-3xl font-bold text-slate-800">Javascript</h1>
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
                      {conceptStats.learned * 2}
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
                      0
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <span className="text-2xl">🏆</span>
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
              <ConceptLearned skillName="javascript" />
            </motion.div>

            {/* Concept Status Box */}
            <motion.div className="bg-white rounded-lg shadow-md p-6 w-150 h-76 flex flex-col justify-between">
              <div>
              <p className="text-sm text-slate-600">Concepts Status</p>
              {(() => {
                  let learnedConcepts = userData.javascript?.learnedConcepts || [];
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


          <div className='w-full bg-white rounded-lg shadow-md mt-8 p-6'>
            <h2 className='text-2xl text-left font-bold text-slate-800 mb-6'>Projects</h2>
            
            {/* Projects content will go here */}
            <div className='min-h-[200px] flex items-center justify-center text-slate-400'>
              No projects available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Javascript;
