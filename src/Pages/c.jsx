import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

export default function CDashboard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  
  // State for user data
  const [userData, setUserData] = useState({
    level: 'Beginner',
    xp: 150,
    xpMax: 500,
    modulesCompleted: 3,
    totalModules: 10,
    cBasicSkill: 30,
    functionsSkill: 20,
    pointersSkill: 10
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const progress = Math.round((userData.modulesCompleted / userData.totalModules) * 100);
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 text-base">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

      {/* Navbar */}
      <div className="sticky top-1 z-50 bg-white shadow-sm">
        <Navbar hideProgressButton={true} />
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="w-full relative px-4 lg:px-8 pb-12">
          {/* Header Section */}
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">C Programming Learning Path</h1>
                <p className="text-slate-600 mt-2">Master the fundamentals of C programming language</p>
              </div>
              <Link
                to="/task"
                className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Start Next Challenge
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Level</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.level}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
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
                  <p className="text-sm text-slate-600">Modules Completed</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.modulesCompleted} / {userData.totalModules}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <span className="text-2xl">📚</span>
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
                  <p className="text-sm text-slate-600">Total XP</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.xp} / {userData.xpMax}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <span className="text-2xl">⭐</span>
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
                  <p className="text-sm text-slate-600">Progress</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{progress}%</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Daily Challenge Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Daily Challenge</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900">Largest Number Finder</h3>
                <p className="text-blue-700 mt-2">Write a program to find the largest among three numbers.</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-blue-600">+50 XP</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm text-blue-600">15 minutes</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit Solution
                </button>
                <span className="text-sm text-slate-500">Expires in: 17h 40m</span>
              </div>
            </motion.div>

            {/* Current Task Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Task</h2>
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-orange-900">Variables &amp; Data Types</h3>
                <p className="text-orange-700 mt-2">Odd and Even Number Checker</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-orange-600">Difficulty: Easy</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm text-orange-600">20 minutes</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Continue Task
                </button>
                <span className="text-sm text-slate-500">In Progress</span>
              </div>
            </motion.div>
          </div>

          {/* Upcoming Tasks Section */}
          <div className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Upcoming Modules</h2>
              <div className="space-y-4">
                {[
                  { title: 'Pointers & Memory', status: 'Locked', xp: 75 },
                  { title: 'Loops & Conditions', status: 'Locked', xp: 60 },
                  { title: 'Arrays & Strings', status: 'Locked', xp: 80 },
                  { title: 'Functions in C', status: 'Locked', xp: 100 }
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full mr-3">
                        <span className="text-slate-500">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">{module.title}</h4>
                        <p className="text-sm text-slate-500">{module.status} • {module.xp} XP</p>
                      </div>
                    </div>
                    <button 
                      disabled
                      className="text-sm text-slate-400 px-3 py-1 rounded border border-slate-300"
                    >
                      Locked
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                New modules unlock as you complete the current ones. Keep learning!
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
    </div>
  );
}