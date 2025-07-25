import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import WelcomeIntro from '../components/WelcomeIntro';
import { getDatabase, ref, get, update } from 'firebase/database';
import { db } from '../firebase'; // make sure this path is correct
import python from "../assets/python.png"
import PowerBi from "../assets/PowerBi.png"
// Placeholder icon for Pandas
const pandasIcon = <span className="text-2xl">🐼</span>;


function AllSkills() {
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
    const [showOverlay, setShowOverlay] = useState(false);
    const [pendingSkill, setPendingSkill] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

    // Map skill to route and Firebase field
    const skillMap = {
        'python': {
            route: '/python',
            value: 'Project1',
            node: 'python',
            currentProjectField: 'PythonCurrentProject',
        },
        'data-science': {
            route: '/data-science',
            value: 'Project1',
            node: 'data-science',
            currentProjectField: 'DataScienceCurrentProject',
        },
        'public-speaking': {
            route: '/public-speaking',
            value: 'Project1',
            node: 'public-speaking',
            currentProjectField: 'PublicSpeakingCurrentProject',
        },
        'powerbi': {
            route: '/powerbi',
            value: 'Project1',
            node: 'powerbi',
            currentProjectField: 'PowerBiCurrentProject',
        },
        'pandas': {
            route: '/pandas',
            value: 'Project1',
            node: 'pandas',
            currentProjectField: 'PandasCurrentProject',
        },
    };

    const handleStartLearning = (skillKey) => {
        const skill = skillMap[skillKey];
        if (userData && skill && userData[skill.node] && userData[skill.node][skill.currentProjectField]) {
            navigate(skill.route);
            return;
        }
        setPendingSkill(skillKey);
        setShowOverlay(true);
        setErrorMsg('');
    };

    const handleOverlayNo = () => {
        setShowOverlay(false);
        setPendingSkill(null);
        setErrorMsg('');
    };

    const handleOverlayYes = async () => {
        if (!pendingSkill || !user) return;
        setIsUpdating(true);
        setErrorMsg('');
        try {
            const skill = skillMap[pendingSkill];
            if (!skill) throw new Error('Unknown skill');
            const userRef = ref(db, 'users/' + user.id);
            const updates = {
                [`${skill.node}/${skill.currentProjectField}`]: skill.value,
            };

            // Add ProjectStarted field for each skill
            if (skill.node === 'python') {
                updates[`${skill.node}/PythonProjectStarted`] = false;
            } else if (skill.node === 'data-science') {
                updates[`${skill.node}/DataScienceProjectStarted`] = false;
            } else if (skill.node === 'public-speaking') {
                updates[`${skill.node}/PublicSpeakingProjectStarted`] = false;
            } else if (skill.node === 'powerbi') {
                updates[`${skill.node}/PowerBiProjectStarted`] = false;
            }

            await update(userRef, updates);
            setShowOverlay(false);
            setPendingSkill(null);
            setIsUpdating(false);
            navigate(skill.route);
        } catch (err) {
            setErrorMsg('Failed to update: ' + err.message);
            setIsUpdating(false);
        }
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

            {/* Overlay for confirmation */}
            {showOverlay && pendingSkill && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 2px 16px #0003' }}>
                        <h2 className="text-xl font-semibold mb-4">Start Learning?</h2>
                        <p className="mb-4">Do you want to start learning <b>{pendingSkill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</b>?</p>
                        {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
                        {isUpdating ? (
                            <div className="text-blue-600">Updating...</div>
                        ) : (
                            <div className="flex gap-4 justify-center mt-4">
                                <button onClick={handleOverlayYes} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Yes</button>
                                <button onClick={handleOverlayNo} className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">No</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Professional top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />

            <div className="sticky top-1 z-50 bg-white shadow-sm">
                <Navbar />
            </div>

            {/* Main content with sidebar */}
            <div className="flex flex-col lg:flex-row">
                <Sidebar />
                <div className="w-full relative px-4 lg:px-8 pb-12">
                    {/* Skills Organization */}
                    <div className="mt-8">
                        {(() => {
                            const startedSkills = [];
                            const availableSkills = [];

                            // Check which skills have been started
                            Object.entries(skillMap).forEach(([key, skill]) => {
                                const hasStarted = userData && userData[skill.node] && userData[skill.node][skill.currentProjectField];
                                if (hasStarted) {
                                    startedSkills.push({ key, ...skill });
                                } else {
                                    availableSkills.push({ key, ...skill });
                                }
                            });

                            return (
                                <>
                                    {/* Your Skills Section */}
                                    {startedSkills.length > 0 && (
                                        <div className="mb-12">
                                            <div className="flex items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-slate-800">Your Skills</h2>
                                                <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    {startedSkills.length} Active
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Only show started skills */}
                                                {startedSkills.map((skill, index) => (
                                                    <motion.div
                                                        key={skill.key}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md border border-green-200 p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                                                    >
                                                        {/* Active indicator */}
                                                        <div className="absolute top-4 right-4">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                        </div>

                                                        <div className="flex items-center mb-4">
                                                            <div className="bg-green-100 rounded-full p-3">
                                                                {skill.key === 'python' && <img style={{ width: "25px" }} src={python} alt="" />}
                                                                {skill.key === 'powerbi' && <img style={{ width: "25px" }} src={PowerBi} alt="" />}
                                                                {skill.key === 'public-speaking' && <span className="text-2xl">🎤</span>}
                                                                {skill.key === 'data-science' && <span className="text-2xl">📊</span>}
                                                                {skill.key === 'pandas' && pandasIcon}
                                                            </div>
                                                            <h3 className="text-xl font-semibold text-slate-800 ml-4">
                                                                {skill.key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </h3>
                                                        </div>

                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                                                <span>Concept learned</span>
                                                                <span>In Progress</span>
                                                            </div>
                                                            <div className="w-full bg-green-200 rounded-full h-2">
                                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm text-slate-500">15 Lessons</span>
                                                                <span className="text-sm text-slate-500">•</span>
                                                                <span className="text-sm text-slate-500">6 Projects</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleStartLearning(skill.key)}
                                                                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                            >
                                                                Continue Learning
                                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Available Skills Section */}
                                    <div>
                                        <div className="flex items-center mb-6">
                                            <h2 className="text-2xl font-semibold text-slate-800">Available Skills</h2>
                                            <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {availableSkills.length} Available
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {availableSkills.map((skill, index) => (
                                                <motion.div
                                                    key={skill.key}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="bg-white rounded-lg shadow-md border-t border-blue-100 p-6 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-center mb-4">
                                                        <div className="bg-blue-50 rounded-full p-3">
                                                            {skill.key === 'python' && <img style={{ width: "25px" }} src={python} alt="" />}
                                                            {skill.key === 'powerbi' && <img style={{ width: "25px" }} src={PowerBi} alt="" />}
                                                            {skill.key === 'public-speaking' && <span className="text-2xl">🎤</span>}
                                                            {skill.key === 'data-science' && <span className="text-2xl">📊</span>}
                                                            {skill.key === 'pandas' && pandasIcon}
                                                        </div>
                                                        <h3 className="text-xl font-semibold text-slate-800 ml-4">
                                                            {skill.key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </h3>
                                                    </div>

                                                    <p className="text-slate-600 mb-4">
                                                        {skill.key === 'python' && "Learn Python programming with hands-on projects. Master variables, functions, loops, and more."}
                                                        {skill.key === 'powerbi' && "Master Power BI for data visualization and business intelligence. Create stunning dashboards and reports."}
                                                        {skill.key === 'public-speaking' && "Master the art of public speaking with our comprehensive curriculum. Build confidence and communication skills."}
                                                        {skill.key === 'data-science' && "Learn data analysis, visualization, and machine learning. Transform raw data into meaningful insights."}
                                                        {skill.key === 'pandas' && "Master data manipulation and analysis with Pandas. Learn to work with DataFrames, clean data, and perform powerful data operations in Python."}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-slate-500">15 Lessons</span>
                                                            <span className="text-sm text-slate-500">•</span>
                                                            <span className="text-sm text-slate-500">6 Projects</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleStartLearning(skill.key)}
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            Start Learning
                                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Professional bottom accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
        </div>
    );
}

export default AllSkills;

