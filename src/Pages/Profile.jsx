import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { getDatabase, ref, get, update, onValue } from 'firebase/database';
import { db } from '../firebase';
import python from "../assets/python.png";
import PowerBi from "../assets/PowerBi.png";

// No image for pandas, use emoji
const pandasIcon = <span className="text-2xl mr-2">🐼</span>;

function Profile() {
    const [showAllSkills, setShowAllSkills] = useState(false);
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();
    const [userData, setUserData] = useState({
        level: '',
        xp: 0,
        tasksCompleted: 0,
        python: {},
        pandas: {},
        'data-science': {},
        'public-speaking': {},
        powerbi: {},
        projectHistory: [],
        observers: [3],
        observing: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isObserving, setIsObserving] = useState(false);
    const [copiedProjectId, setCopiedProjectId] = useState(null);
    const [skillStats, setSkillStats] = useState({
        python: { learned: 0, applied: 0, total: 0 },
        powerbi: { learned: 0, applied: 0, total: 0 },
        pandas: { learned: 0, applied: 0, total: 0 },
        c: { learned: 0, applied: 0, total: 0 },
        cplus: { learned: 0, applied: 0, total: 0 },
        dsa: { learned: 0, applied: 0, total: 0 },
        devops: { learned: 0, applied: 0, total: 0 },
        java: { learned: 0, applied: 0, total: 0 },
        javascript: { learned: 0, applied: 0, total: 0 },
        nodejs: { learned: 0, applied: 0, total: 0 },
        numpy: { learned: 0, applied: 0, total: 0 },
        reactjs: { learned: 0, applied: 0, total: 0 },
        sql: { learned: 0, applied: 0, total: 0 },
        'data-science': { learned: 0, applied: 0, total: 0 },
        'public-speaking': { learned: 0, applied: 0, total: 0 }
    });

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/');
        }
    }, [isLoaded, isSignedIn, navigate]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const userRef = ref(db, 'users/' + user.id);
            // Set up real-time listener
            const unsubscribe = onValue(userRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    
                    // Fetch projects from users/{userId}/projects
                    const projectsRef = ref(db, `users/${user.id}/projects`);
                    const projectsSnap = await get(projectsRef);
                    let projects = [];
                    
                    if (projectsSnap.exists()) {
                        projects = Object.entries(projectsSnap.val()).map(([id, project]) => ({
                            id,
                            name: project.title || 'Project',
                            description: project.description || '',
                            completedDate: project.completedAt ? new Date(project.completedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                            sp: project.sp || 10,
                            skill: project.skills || 'general',
                            publicUrl: project.link || '',
                            timestamp: project.completedAt || Date.now()
                        }));
                        
                        // Sort by timestamp (newest first)
                        projects.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    }
                    
                    // Update state with projects
                    setUserData({ 
                        ...data, 
                        projectHistory: projects,
                        projects: projects
                    });
                    // Check if current user is observing this profile
                    if (data.observers && data.observers.includes(user.id)) {
                        setIsObserving(true);
                    }
                } else {
                    console.log('No data available');
                }
                setIsLoading(false);
            });

            // Fetch skill stats from database
            const fetchSkillStats = async (skillKey, skillName) => {
                try {
                    // Fetch learned concepts
                    const learnedConceptsRef = ref(db, `users/${user.id}/${skillKey}/learnedConcepts`);
                    const learnedConceptsSnap = await get(learnedConceptsRef);
                    
                    let learnedConcepts = [];
                    if (learnedConceptsSnap.exists()) {
                        const data = learnedConceptsSnap.val();
                        learnedConcepts = Array.isArray(data) ? data : Object.values(data || {});
                    }
                    
                    // Fetch completed projects
                    const completedProjectsRef = ref(db, `users/${user.id}/${skillKey}/${skillName}CompletedProjects`);
                    const completedProjectsSnap = await get(completedProjectsRef);
                    
                    const conceptsUsed = new Set();
                    if (completedProjectsSnap.exists()) {
                        const projects = Object.values(completedProjectsSnap.val() || {});
                        projects.forEach(project => {
                            if (project.conceptUsed) {
                                project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
                            }
                        });
                    }
                    
                    // Calculate applied concepts
                    const applied = learnedConcepts.filter(concept => {
                        const conceptName = typeof concept === 'object' ? concept.concept : concept;
                        return conceptsUsed.has(conceptName);
                    }).length;
                    
                    // Get total concepts from the skill's concept directory
                    // Special handling for C++ (cplus)
                    const skillPath = skillKey === 'cplus' ? 'Cplus' : skillName;
                    const totalConceptsRef = ref(db, `${skillPath}Project/AllConcepts/category`);
                    const totalConceptsSnap = await get(totalConceptsRef);
                    
                    let total = 0;
                    if (totalConceptsSnap.exists()) {
                        const categories = totalConceptsSnap.val() || {};
                        total = Object.values(categories).reduce((sum, category) => {
                            return sum + (Array.isArray(category) ? category.length : Object.keys(category || {}).length);
                        }, 0);
                    }
                    
                    // Update stats
                    setSkillStats(prev => ({
                        ...prev,
                        [skillKey]: {
                            learned: learnedConcepts.length,
                            applied,
                            total: total || prev[skillKey]?.total || 30 // Fallback to previous total or 30
                        }
                    }));
                    
                } catch (error) {
                    console.error(`Error fetching ${skillKey} stats:`, error);
                }
            };
            
            // Fetch all skills stats
            const fetchAllSkillStats = async () => {
                const skills = [
                    { key: 'python', name: 'Python' },
                    { key: 'powerbi', name: 'PowerBi' },
                    { key: 'pandas', name: 'Pandas' },
                    { key: 'c', name: 'C' },
                    { key: 'cplus', name: 'CPlus' },
                    { key: 'dsa', name: 'DSA' },
                    { key: 'devops', name: 'Devops' },
                    { key: 'java', name: 'Java' },
                    { key: 'javascript', name: 'Javascript' },
                    { key: 'nodejs', name: 'NodeJS' },
                    { key: 'numpy', name: 'Numpy' },
                    { key: 'reactjs', name: 'ReactJS' },
                    { key: 'sql', name: 'SQL' },
                    { key: 'data-science', name: 'DataScience' },
                    { key: 'public-speaking', name: 'PublicSpeaking' }
                ];
                
                // Fetch stats for all skills in parallel
                await Promise.all(skills.map(skill => 
                    fetchSkillStats(skill.key, skill.name)
                ));
            };
            
            // Initial fetch of all skill stats
            fetchAllSkillStats();
            
            // Set up real-time listener for skill stats
            const skillRef = ref(db, `users/${user.id}`);
            onValue(skillRef, () => {
                fetchAllSkillStats();
            });

            return () => unsubscribe();
        }
    }, [isLoaded, isSignedIn, user]); // Removed userData.powerbi from dependencies

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
        let totalSP = 0;
        // Python SP: (projects * 10) + (learned * 2) + (applied * 5)
        let pythonSP = 0;
        if (userData && userData.python) {
            // Count completed projects
            const pythonProjects = Object.values(userData.python.PythonCompletedProjects || {});
            // Count learned concepts
            let learnedConcepts = userData.python.learnedConcepts || [];
            if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
                learnedConcepts = Object.values(learnedConcepts);
            }
            const learned = learnedConcepts.length;
            // Applied: count learned concepts that are used in any completed project
            const conceptsUsed = new Set();
            pythonProjects.forEach(project => {
                if (project.conceptUsed) {
                    project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
                }
            });
            const applied = learnedConcepts.filter(concept => conceptsUsed.has(concept.concept || concept)).length;
            pythonSP = pythonProjects.length * 10 + learned * 2 + applied * 5;
        }
        totalSP += pythonSP;
        // Other skills: sum SP from projectHistory
        if (userData && userData.projectHistory) {
            const otherSkills = ['data-science', 'public-speaking', 'powerbi'];
            otherSkills.forEach(skill => {
                totalSP += userData.projectHistory
                    .filter(project => project.skill === skill)
                    .reduce((acc, project) => acc + (project.sp || 0), 0);
            });
        }
        return totalSP;
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
                        {(() => {
                            const skillMap = {
                                'python': { node: 'python', currentProjectField: 'PythonCurrentProject', img: python, label: 'Python', route: '/python' },
                                'data-science': { node: 'data-science', currentProjectField: 'DataScienceCurrentProject', img: null, label: 'Data Science', icon: <span className="text-xl mr-2">📊</span>, route: '/data-science' },
                                'public-speaking': { node: 'public-speaking', currentProjectField: 'PublicSpeakingCurrentProject', img: null, label: 'Public Speaking', icon: <span className="text-xl mr-2">🎤</span>, route: '/public-speaking' },
                                'powerbi': { node: 'powerbi', currentProjectField: 'PowerBiCurrentProject', img: PowerBi, label: 'Power BI', route: '/powerbi' },
                                'pandas': { node: 'pandas', currentProjectField: 'PandasCurrentProject', img: null, label: 'Pandas', icon: pandasIcon, route: '/pandas' },
                                'numpy': { node: 'numpy', currentProjectField: 'NumpyCurrentProject', img: null, label: 'NumPy', icon: <span className="text-xl mr-2">🔢</span>, route: '/numpy' },
                                'c': { node: 'c', currentProjectField: 'CCurrentProject', img: null, label: 'C', icon: <span className="text-xl mr-2 font-mono">C</span>, route: '/c' },
                                'cplus': { node: 'cplus', currentProjectField: 'CPlusCurrentProject', img: null, label: 'C++', icon: <span className="text-xl mr-2 font-mono">C++</span>, route: '/cplus' },
                                'devops': { node: 'devops', currentProjectField: 'DevopsCurrentProject', img: null, label: 'DevOps', icon: <span className="text-xl mr-2">🛠️</span>, route: '/devops' },
                                'dsa': { node: 'dsa', currentProjectField: 'DSACurrentProject', img: null, label: 'DSA', icon: <span className="text-xl mr-2">📚</span>, route: '/dsa' },
                                'nodejs': { node: 'nodejs', currentProjectField: 'NodeJSCurrentProject', img: null, label: 'Node.js', icon: <span className="text-xl mr-2">🟢</span>, route: '/nodejs' },
                                'reactjs': { node: 'reactjs', currentProjectField: 'ReactJSCurrentProject', img: null, label: 'React.js', icon: <span className="text-xl mr-2">⚛️</span>, route: '/reactjs' },
                                'javascript': { node: 'javascript', currentProjectField: 'JavascriptCurrentProject', img: null, label: 'JavaScript', icon: <span className="text-xl mr-2">JS</span>, route: '/javascript' },
                                'java': { node: 'java', currentProjectField: 'JavaCurrentProject', img: null, label: 'Java', icon: <span className="text-xl mr-2">☕</span>, route: '/java' },
                                'sql': { node: 'sql', currentProjectField: 'SQLCurrentProject', img: null, label: 'SQL', icon: <span className="text-xl mr-2">🗃️</span>, route: '/sql' },
                            };

                            // Filter to show only skills that the user has started
                            const startedSkills = Object.entries(skillMap).filter(([key, skill]) => {
                                // Check if the skill has any data in user's profile
                                const hasSkillData = userData[skill.node] && (
                                    userData[skill.node][skill.currentProjectField] ||
                                    (userData[skill.node].learnedConcepts && 
                                     Object.keys(userData[skill.node].learnedConcepts || {}).length > 0) ||
                                    Object.keys(userData[skill.node] || {}).some(k => 
                                      k.endsWith('CompletedProjects') && 
                                      Object.keys(userData[skill.node][k] || {}).length > 0
                                    )
                                );
                                return hasSkillData;
                            });

                            const displayedSkills = showAllSkills ? startedSkills : startedSkills.slice(0, 4);
                            const gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';

                            if (startedSkills.length === 0) {
                                return <div className="text-center text-slate-500 col-span-full py-8">No skills available.</div>;
                            }
                            
                            return (
                                <>
                                    <div className={gridClass}>
                                        {displayedSkills.map(([key, skill]) => {
                                            const stats = skillStats[skill.node] || { learned: 0, applied: 0, total: 30 };
                                            const { learned, applied, total } = stats;
                                            
                                            return (
                                                <Link to={skill.route} key={key} className="block h-full">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow h-full flex flex-col"
                                                    >
                                                        <div className="flex items-center mb-3">
                                                            {skill.img ? (
                                                                <img src={skill.img} alt={skill.label} className="w-6 h-6 mr-2 object-contain" />
                                                            ) : skill.icon ? (
                                                                <span className="mr-2">{skill.icon}</span>
                                                            ) : (
                                                                <span className="w-6 h-6 mr-2 flex items-center justify-center">
                                                                    {skill.label.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                            <h2 className="text-lg font-semibold text-slate-800">{skill.label}</h2>
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div>
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-sm text-slate-600">Concepts learned</span>
                                                                    <span className="text-sm font-medium text-slate-800">{learned}/{total}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                                    <div 
                                                                        className={`h-1.5 rounded-full ${
                                                                            key === 'python' ? 'bg-purple-600' : 
                                                                            key === 'powerbi' ? 'bg-blue-600' : 
                                                                            key === 'data-science' ? 'bg-green-600' :
                                                                            key === 'pandas' ? 'bg-yellow-600' : 'bg-indigo-600'
                                                                        }`} 
                                                                        style={{ width: `${total > 0 ? Math.min((learned / total) * 100, 100) : 0}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                           
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    {startedSkills.length > 4 && (
                                        <div className="col-span-full flex justify-center mt-4">
                                            <button
                                                onClick={() => setShowAllSkills(!showAllSkills)}
                                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                                            >
                                                {showAllSkills ? 'Show Less' : `Show All ${startedSkills.length} Skills`}
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Project History */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">My Projects</h2>
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
                                            className="flex items-start text-left space-x-4 border-b border-slate-200 pb-4 last:border-0"
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xl font-medium text-slate-800">{project.name}</h3>
                                                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+{project.sp} SP</span>
                                                </div>
                                                <p className="text-slate-600 w-120 pt-2 text-sm">{project.description}</p>
                                                <div className="flex flex-col mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.isArray(project.skill) 
                                                                ? project.skill.map((skill, idx) => (
                                                                    <span key={idx} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                                                                        {String(skill).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                ))
                                                                : (
                                                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                        {(project.skill || 'General').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <span className="text-sm text-slate-500">{project.completedDate}</span>
                                                    </div>
                                                    {project.skill === 'python' && project.publicUrl && (
                                                        <div className="flex mt-2">
                                                            <button
                                                                className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-semibold border border-purple-200 transition-colors"
                                                                onClick={() => {
                                                                    // Ensure the URL uses /python-project/ instead of /public/python-project/
                                                                    const url = project.publicUrl.replace('/public/python-project/', '/python-project/');
                                                                    navigator.clipboard.writeText(window.location.origin + url);
                                                                    setCopiedProjectId(project.id); // Changed from project._projectKey to project.id
                                                                    setTimeout(() => setCopiedProjectId(null), 1500);
                                                                }}
                                                            >
                                                                {copiedProjectId === project.id ? 'Copied!' : 'Share'}
                                                            </button>
                                                            <a
                                                                href={project.publicUrl.replace('/public/python-project/', '/python-project/')}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold border border-blue-200 transition-colors"
                                                                style={{ fontWeight: 500 }}
                                                            >
                                                                Preview
                                                            </a>
                                                        </div>
                                                    )}
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