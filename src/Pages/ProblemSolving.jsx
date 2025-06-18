import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { getDatabase, ref, get } from 'firebase/database';
import { db } from '../firebase';

function ProblemSolving() {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();
    const [userData, setUserData] = useState({
        level: '',
        xp: 0,
        tasksCompleted: 0,
        analyticalSkill: 0,
        logicSkill: 0,
        creativitySkill: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/');
        }
    }, [isLoaded, isSignedIn, navigate]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const userRef = ref(db, 'users/' + user.id);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    setUserData(snapshot.val());
                } else {
                    console.log('No data available');
                }
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isLoaded, isSignedIn, user]);

    const toggleProgress = () => {
        setShowProgress(!showProgress);
    };

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
            {/* Professional top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

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
                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Problem Solving Learning Path</h1>
                                <p className="text-slate-600 mt-2">Develop analytical thinking and problem-solving skills</p>
                            </div>
                            <Link
                                to="/task"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.level || 'Beginner'}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <span className="text-2xl">💻</span>
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
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.tasksCompleted || 0}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <span className="text-2xl">🌐</span>
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
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{userData.xp || 0}</h3>
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
                                    <p className="text-sm text-slate-600">Learning Streak</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">5 Days</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <span className="text-2xl">🔥</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Next Project Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Next Project</h2>
                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                <h3 className="font-medium text-blue-900">Algorithm Challenge</h3>
                                <p className="text-blue-700 mt-2">Solve complex algorithmic problems and optimize solutions</p>
                                <div className="flex items-center mt-4">
                                    <span className="text-sm text-blue-600">+200 XP</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-sm text-blue-600">90 minutes</span>
                                </div>
                            </div>
                            <Link
                                to="/web-devlopment/task"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Start Project
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>

                        {/* Skill Progress */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Skill Progress</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Analytical Thinking</span>
                                        <span className="text-sm text-blue-600">{userData.analyticalSkill || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full">
                                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${userData.analyticalSkill || 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Logical Reasoning</span>
                                        <span className="text-sm text-blue-600">{userData.logicSkill || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full">
                                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${userData.logicSkill || 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Creative Solutions</span>
                                        <span className="text-sm text-blue-600">{userData.creativitySkill || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full">
                                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${userData.creativitySkill || 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Achievements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Learning Resources</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                                        <span className="text-lg">🧠</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800">Algorithm Fundamentals</h3>
                                        <p className="text-slate-600 text-sm mt-1">Learn core algorithms and data structures</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                                        <span className="text-lg">🔍</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800">Problem Solving Patterns</h3>
                                        <p className="text-slate-600 text-sm mt-1">Common problem solving approaches and techniques</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                                        <span className="text-lg">🎯</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800">Code Challenges</h3>
                                        <p className="text-slate-600 text-sm mt-1">Practice problems to improve your skills</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Professional bottom accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600" />
        </div>
    );
}

export default ProblemSolving;