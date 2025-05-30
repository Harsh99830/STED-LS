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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-800 text-lg font-medium">Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-800 relative">
            {showIntro && <WelcomeIntro onClose={handleCloseIntro} />}

            {/* Navbar with hideProgressButton prop */}
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <Navbar onProgressClick={toggleProgress} showProgress={showProgress} />
            </div>

            {/* Main content with sidebar */}
            <div className="flex flex-col lg:flex-row">
                <Sidebar />
                <div className="w-full relative px-4 lg:px-8">
                    {/* Responsive container for all 3 blocks */}
                    <div className="flex flex-col-reverse lg:flex-row items-start justify-between gap-8 mt-12">
                        {/* Tip of the Day */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white rounded-lg p-6 shadow-lg border border-slate-100 w-full max-w-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-50 rounded-full p-2 mr-3">
                                    <span className="text-2xl">💡</span>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Tip of the Day</h2>
                            </div>
                            <p className="text-slate-600 mb-3 leading-relaxed">"Public speaking boosts your confidence, career, and memory!"</p>
                            <div className="flex items-center text-blue-600 bg-blue-50 rounded-lg p-3">
                                <span className="text-lg mr-2">🌱</span>
                                <p className="text-sm font-medium">Growth is a daily habit. One task a day keeps fear away.</p>
                            </div>
                        </motion.div>

                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center justify-center text-center w-full max-w-xl bg-white rounded-lg p-8 shadow-lg border border-slate-100"
                        >
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delayChildren: 0.3,
                                            staggerChildren: 0.2,
                                        },
                                    },
                                }}
                                className="mb-6"
                            >
                                <motion.div
                                    className="inline-block bg-blue-50 rounded-full px-6 py-2 mb-4"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <span className="text-blue-700 font-semibold">Daily Progress</span>
                                </motion.div>
                                
                                <motion.h1
                                    className="text-3xl sm:text-4xl font-bold mb-4 text-slate-800"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    Welcome back, <span className="text-blue-700">Kshitij!</span>
                                </motion.h1>

                                <motion.p
                                    className="text-lg text-slate-600 mb-6"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    You're 1 step closer to becoming a confident speaker.
                                </motion.p>

                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <Link
                                        to="/task"
                                        className="inline-flex items-center bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-800 transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <span className="mr-2">Start Task</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Snapshot */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white rounded-lg p-6 shadow-lg border border-slate-100 w-full max-w-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-50 rounded-full p-2 mr-3">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Your Snapshot</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Level</span>
                                    <span className="font-semibold text-slate-800">{userData.level}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">XP</span>
                                    <span className="font-semibold text-slate-800">{userData.xp} / 500 XP</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Tasks Completed</span>
                                    <span className="font-semibold text-slate-800">{userData.tasksCompleted}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">🔥 Streak</span>
                                    <span className="font-semibold text-slate-800">1 Day</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Leaderboard</span>
                                    <span className="font-semibold text-slate-800">#17</span>
                                </div>
                            </div>

                            <Link 
                                to="/progress" 
                                className="mt-6 inline-flex items-center text-blue-700 hover:text-blue-800 transition-colors duration-200"
                            >
                                <span className="mr-2">See Full Progress</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Professional Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700" />
        </div>
    );
}

export default Home;
