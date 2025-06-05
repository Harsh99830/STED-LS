import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; 
import { motion } from 'framer-motion';
import WelcomeIntro from '../components/WelcomeIntro'; 
import { getDatabase, ref, get } from 'firebase/database';
import { db } from '../firebase'; // make sure this path is correct


function Home() {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user  } = useUser(); 
    const [showIntro, setShowIntro] = useState(false);
    const [userData, setUserData] = useState({
        level: '',
        xp: 0,
        tasksCompleted: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/');
        }
    }, [isLoaded, isSignedIn, navigate]);

    useEffect(() => {
        const shouldShowIntro = localStorage.getItem("showIntro");
        if (shouldShowIntro === "true") {
            setShowIntro(true);
        }
    }, []);

    const handleCloseIntro = () => {
        localStorage.removeItem("showIntro");
        setShowIntro(false);
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const db = getDatabase();
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
    }, [isLoaded, isSignedIn]);

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
            {showIntro && <WelcomeIntro onClose={handleCloseIntro} />}

            {/* Professional top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

            {/* Navbar with hideProgressButton prop */}
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
                    {/* Responsive container for all 3 blocks */}
                    <div className="flex flex-col-reverse lg:flex-row items-start justify-between gap-6 mt-8">
                        {/* Tip of the Day */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 w-full max-w-sm"
                        >
                            <div className="flex items-center mb-4 pb-4 border-b border-slate-100">
                                <div className="bg-slate-50 rounded-lg p-2 mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">Tip of the Day</h2>
                            </div>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">"Public speaking boosts your confidence, career, and memory!"</p>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-600">Growth is a daily habit. One task a day keeps fear away.</p>
                            </div>
                        </motion.div>

                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-xl bg-white rounded-lg shadow-md border-t border-blue-100 p-8"
                        >
                            <div className="text-center">
                                
                                <h1 className="text-2xl font-semibold text-slate-800 mb-3">
                                    Welcome back, <span className="text-blue-600">{userData.name}</span>
                                </h1>

                                <p className="text-slate-600 mb-6">
                                    You're 1 step closer to becoming a confident speaker.
                                </p>

                                <Link
                                    to="/task"
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
                                >
                                    Start Task
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Snapshot */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 w-full max-w-sm"
                        >
                            <div className="flex items-center mb-4 pb-4 border-b border-slate-100">
                                <div className="bg-slate-50 rounded-lg p-2 mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">Your Snapshot</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">Level</span>
                                    <span className="font-medium text-slate-800">{userData.level}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">XP</span>
                                    <span className="font-medium text-slate-800">{userData.xp} / 500 XP</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">Tasks Completed</span>
                                    <span className="font-medium text-slate-800">{userData.tasksCompleted}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">Streak</span>
                                    <span className="font-medium text-slate-800">1 Day</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">Leaderboard</span>
                                    <span className="font-medium text-slate-800">#17</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link 
                                    to="/progress" 
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                >
                                    View Full Progress
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Professional bottom accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
        </div>
    );
}

export default Home;

