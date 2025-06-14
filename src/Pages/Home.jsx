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
    const { isLoaded, isSignedIn, user } = useUser();
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
                    {/* Subject Cards */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Available Subjects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Public Speaking Card */}
                            {/* <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">🎤</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Public Speaking</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Master the art of public speaking with our comprehensive curriculum. Build confidence and communication skills.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">12 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">4 Projects</span>
                                    </div>
                                    <Link
                                        to="/public-speaking"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}

                            {/* Data Science Card
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Data Science</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Learn data analysis, visualization, and machine learning. Transform raw data into meaningful insights.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">15 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">6 Projects</span>
                                    </div>
                                    <Link
                                        to="/data-science"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}

                            {/* Web Development Card
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">💻</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Web Development</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Build modern websites and web applications using HTML, CSS, JavaScript, and React. Learn full-stack development.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">20 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">8 Projects</span>
                                    </div>
                                    <Link
                                        to="/web-devlopment"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}

                            {/* Ethical Hacking Card
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Ethical Hacking</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Learn cybersecurity fundamentals, penetration testing, and secure coding practices to protect systems.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">18 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">5 Projects</span>
                                    </div>
                                    <Link
                                        to="/ethical-hacking"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}

                            {/* Decision Making Card
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Decision Making</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Develop critical thinking and analytical skills to make informed decisions in both personal and professional life.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">14 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">3 Projects</span>
                                    </div>
                                    <Link
                                        to="/decision-making"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}

                            {/* Problem Solving Card */}
                            {/* <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">Problem Solving</h3>
                                </div>
                                <p className="text-slate-600 mb-4">Enhance your problem-solving skills with structured approaches and creative thinking techniques.</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">16 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">4 Projects</span>
                                    </div>
                                    <Link
                                        to="/problem-solving"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div> */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-50 rounded-full p-3">
                                        <span className="text-2xl">🖥️</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 ml-4">C Programming</h3>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Master C fundamentals, pointers, memory management, and algorithms with practical projects.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-500">14 Lessons</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">5 Projects</span>
                                    </div>
                                    <Link
                                        to="/c"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start Learning
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional bottom accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
        </div>
    );
}

export default Home;

