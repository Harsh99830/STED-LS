import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { getDatabase, ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import python from "../assets/python.png";
import PowerBi from "../assets/PowerBi.png";
import { Link } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();
    const [userData, setUserData] = useState({
        level: '',
        xp: 0,
        tasksCompleted: 0,
        python: {},
        'data-science': {},
        'public-speaking': {},
        powerbi: {},
        projectHistory: [],
        observers: [3],
        observing: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isObserving, setIsObserving] = useState(false);

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
                    const data = snapshot.val();
                    setUserData(data);
                    // Check if current user is observing this profile
                    if (data.observers && data.observers.includes(user.id)) {
                        setIsObserving(true);
                    }
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

    const handleObserve = async () => {
        if (!user || !isSignedIn) return;

        const userRef = ref(db, 'users/' + user.id);
        const updates = {};

        if (isObserving) {
            // Remove from observers
            updates.observers = userData.observers.filter(id => id !== user.id);
            updates.observing = userData.observing.filter(id => id !== user.id);
        } else {
            // Add to observers
            updates.observers = [...(userData.observers || []), user.id];
            updates.observing = [...(userData.observing || []), user.id];
        }

        try {
            await update(userRef, updates);
            setIsObserving(!isObserving);
            setUserData(prev => ({
                ...prev,
                observers: updates.observers,
                observing: updates.observing
            }));
        } catch (error) {
            console.error('Error updating observers:', error);
        }
    };

    // Calculate total SP
    const calculateTotalSP = () => {
        let total = 16;
        if (userData.projectHistory) {
            total = userData.projectHistory.reduce((acc, project) => acc + (project.sp || 0), 0);
        }
        return total;
    };

    // Calculate skill-specific SP
    const calculateSkillSP = (skill) => {
        if (!userData.projectHistory) return 0;
        return userData.projectHistory
            .filter(project => project.skill === skill)
            .reduce((acc, project) => acc + (project.sp || 0), 0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-600 text-base">Loading your profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <Navbar />
            </div>

            <div className="flex flex-col lg:flex-row">
                <Sidebar />
                <div className="flex-1 p-8 flex justify-center">
                    <div className="w-full max-w-4xl">
                        {/* Profile Header */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            
                                <div className="flex items-center space-x-6">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        {user?.imageUrl ? (
                                            <img src={user.imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                                        ) : (
                                            <span className="text-4xl">👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-800">{user?.fullName || 'Student'}</h1>
                                        <p className="text-slate-600 text-left pt-2">Total SP: {calculateTotalSP()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center mt-10 text-sm space-x-4">
                                    <div className="flex items-center">
                                        <span className="text-slate-800 font-semibold">{userData.observers?.length || 34}</span>
                                        <span className="text-slate-600 ml-2">Observers</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200"></div>
                                    <div className="flex items-center">
                                        <span className="text-slate-800 font-semibold">{userData.observing?.length || 8}</span>
                                        <span className="text-slate-600 ml-2">Observing</span>
                                    </div>
                                </div>
                            </div>
                       

                        {/* Skills Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Show only started skills */}
                            {(() => {
                                const skillMap = {
                                    'python': {
                                        node: 'python',
                                        currentProjectField: 'PythonCurrentProject',
                                        img: python,
                                        label: 'Python',
                                        route: '/python',
                                    },
                                    'data-science': {
                                        node: 'data-science',
                                        currentProjectField: 'DataScienceCurrentProject',
                                        img: null,
                                        label: 'Data Science',
                                        icon: <span className="text-xl mr-2">📊</span>,
                                        route: '/data-science',
                                    },
                                    'public-speaking': {
                                        node: 'public-speaking',
                                        currentProjectField: 'PublicSpeakingCurrentProject',
                                        img: null,
                                        label: 'Public Speaking',
                                        icon: <span className="text-xl mr-2">🎤</span>,
                                        route: '/public-speaking',
                                    },
                                    'powerbi': {
                                        node: 'powerbi',
                                        currentProjectField: 'PowerBiCurrentProject',
                                        img: PowerBi,
                                        label: 'Power BI',
                                        route: '/powerbi',
                                    },
                                };
                                const startedSkills = Object.entries(skillMap).filter(([key, skill]) =>
                                    userData && userData[skill.node] && userData[skill.node][skill.currentProjectField]
                                );
                                if (startedSkills.length === 0) return <div className="text-center text-slate-500 col-span-full py-8">No skills started yet.</div>;
                                return startedSkills.map(([key, skill]) => (
                                    <Link to={skill.route} key={key}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-center mb-3">
                                                {skill.img ? <img src={skill.img} alt={skill.label} className="w-6 h-6 mr-2" /> : skill.icon}
                                                <h2 className="text-lg font-semibold text-slate-800">{skill.label}</h2>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm text-slate-600">Concept learned</span>
                                                        <span className="text-sm font-medium text-slate-800">{userData[skill.node]?.[skill.label.replace(/\s/g, '') + 'Skill'] || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${key === 'python' ? 'bg-purple-600' : key === 'powerbi' ? 'bg-blue-600' : key === 'data-science' ? 'bg-green-600' : 'bg-yellow-500'}`} style={{ width: `${userData[skill.node]?.[skill.label.replace(/\s/g, '') + 'Skill'] || 0}%` }}></div>
                                                    </div>
                                                    <div className="text-sm text-right font-medium text-slate-800">{userData[skill.node]?.[skill.label.replace(/\s/g, '') + 'Skill'] ? `${userData[skill.node]?.[skill.label.replace(/\s/g, '') + 'Skill']}%` : '0%'}</div>
                                                </div>
                                                {/* Concepts Applied */}
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm text-slate-600">Concepts applied</span>
                                                        <span className="text-sm font-medium text-slate-800">25%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                                                    </div>
                                                    <div className="text-sm text-right font-medium text-slate-800">2/8</div>
                                                </div>
                                                <p className="text-sm text-slate-600">SP Earned: {calculateSkillSP(key)}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ));
                            })()}
                        </div>

                        {/* Project History */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">Project History</h2>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {userData.projectHistory?.length || 0} Projects
                                </div>
                            </div>
                            <div className="space-y-6">
                                {userData.projectHistory && userData.projectHistory.length > 0 ? (
                                    userData.projectHistory.map((project, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start space-x-4 border-b border-slate-200 pb-4 last:border-0"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    {project.skill === 'python' && <img src={python} alt="Python" className="w-6 h-6" />}
                                                    {project.skill === 'powerbi' && <img src={PowerBi} alt="Power BI" className="w-6 h-6" />}
                                                    {project.skill === 'data-science' && <span className="text-xl">📊</span>}
                                                    {project.skill === 'public-speaking' && <span className="text-xl">🎤</span>}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-slate-800">{project.name}</h3>
                                                <p className="text-slate-600 text-sm">{project.description}</p>
                                                <div className="flex items-center mt-2 space-x-4">
                                                    <span className="text-sm text-slate-500">{project.completedDate}</span>
                                                    <span className="text-sm font-medium text-green-600">+{project.sp} SP</span>
                                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {project.skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-slate-600 text-center">No projects completed yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile; 