import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { getDatabase, ref, get } from 'firebase/database'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Feed from '../components/Feed'
import openImg from '../assets/open.png'
import python from '../assets/python.png';
import PowerBi from '../assets/PowerBi.png';
import DiscoverStudents from './DiscoverStudents';

function Home() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sted-active-tab') || 'my-learning')
  const [students, setStudents] = useState([])
  const [learningActivities, setLearningActivities] = useState([])
  const [userData, setUserData] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const navigate = useNavigate();
  const [pythonSP, setPythonSP] = useState(0);
  const [pythonStats, setPythonStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [pythonProjects, setPythonProjects] = useState([]);
  const [powerbiStats, setPowerbiStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [powerbiProjects, setPowerbiProjects] = useState([]);

  // Add calculateSkillSP at the top level inside Home
  const calculateSkillSP = (skillKey) => {
    if (!userData || !userData.projectHistory) return 0;
    return userData.projectHistory
      .filter(project => project.skill === skillKey)
      .reduce((acc, project) => acc + (project.sp || 0), 0);
  };

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching students and activities
    setStudents([
      {
        id: 1,
        name: "Alex Chen",
        avatar: "👨‍💻",
        level: "Intermediate",
        skills: ["Python", "Data Science"],
        conceptsLearned: 15,
        projectsCompleted: 3,
        isOnline: true,
        lastActive: "2 minutes ago"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        avatar: "👩‍🎓",
        level: "Beginner",
        skills: ["Python", "Public Speaking"],
        conceptsLearned: 8,
        projectsCompleted: 1,
        isOnline: false,
        lastActive: "1 hour ago"
      },
      {
        id: 3,
        name: "Mike Rodriguez",
        avatar: "👨‍🔬",
        level: "Advanced",
        skills: ["Python", "Machine Learning", "Power BI"],
        conceptsLearned: 28,
        projectsCompleted: 6,
        isOnline: true,
        lastActive: "5 minutes ago"
      }
    ])

    setLearningActivities([
      {
        id: 1,
        student: "Alex Chen",
        avatar: "👨‍💻",
        action: "completed",
        project: "Personal Finance Tracker",
        skill: "Python",
        time: "2 hours ago",
        sp: 10
      },
      {
        id: 2,
        student: "Sarah Johnson",
        avatar: "👩‍🎓",
        action: "learned",
        concept: "Functions and Lists",
        skill: "Python",
        time: "4 hours ago",
        sp: 4
      },
      {
        id: 3,
        student: "Mike Rodriguez",
        avatar: "👨‍🔬",
        action: "completed",
        project: "Data Visualization Dashboard",
        skill: "Power BI",
        time: "6 hours ago",
        sp: 10
      },
      {
        id: 4,
        student: "Alex Chen",
        avatar: "👨‍💻",
        action: "completed",
        project: "Personal Finance Tracker",
        skill: "Python",
        time: "2 hours ago",
        sp: 10
      },
      {
        id: 5,
        student: "Sarah Johnson",
        avatar: "👩‍🎓",
        action: "learned",
        concept: "Functions and Lists",
        skill: "Python",
        time: "4 hours ago",
        sp: 4
      },
      {
        id: 6,
        student: "Mike Rodriguez",
        avatar: "👨‍🔬",
        action: "completed",
        project: "Data Visualization Dashboard",
        skill: "Power BI",
        time: "6 hours ago",
        sp: 10
      }
    ])
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      const userRef = ref(db, 'users/' + user.id);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      }).finally(() => setIsLoadingProfile(false));

      // Fetch Python completed projects
      const completedProjectsRef = ref(db, 'users/' + user.id + '/python/PythonCompletedProjects');
      get(completedProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setPythonProjects(projects);
        } else {
          setPythonProjects([]);
        }
      });

      // Fetch Python learned/applied concepts and total concepts
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.python?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          // Applied: count learned concepts that are used in any completed project
          const conceptsUsed = new Set();
          (Object.values(data.python?.PythonCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          const applied = learnedConcepts.filter(concept => conceptsUsed.has(concept.concept || concept)).length;
          // Fetch total concepts from PythonProject/AllConcepts/category
          get(ref(db, 'PythonProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const data = allConceptsSnap.val();
              total = [
                ...Object.values(data.basic || {}),
                ...Object.values(data.intermediate || {}),
                ...Object.values(data.advanced || {}),
              ].length;
            }
            setPythonStats({ learned, applied, total });
          });
        }
      });

      // Fetch PowerBI completed projects
      const completedPowerbiProjectsRef = ref(db, 'users/' + user.id + '/powerbi/PowerBiCompletedProjects');
      get(completedPowerbiProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setPowerbiProjects(projects);
        } else {
          setPowerbiProjects([]);
        }
      });
      // Fetch PowerBI learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.powerbi?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          // Applied: count learned concepts that are used in any completed project
          const conceptsUsed = new Set();
          (Object.values(data.powerbi?.PowerBiCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          const applied = learnedConcepts.filter(concept => conceptsUsed.has(concept.concept || concept)).length;
          // Fetch total concepts from PowerBiProject/AllConcepts/category
          get(ref(db, 'PowerBiProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const data = allConceptsSnap.val();
              total = Object.values(data).reduce((acc, arr) => acc + Object.values(arr || {}).length, 0);
            }
            setPowerbiStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    // Calculate Python SP as in Python page
    setPythonSP(pythonProjects.length * 10 + pythonStats.learned * 2 + pythonStats.applied * 5);
  }, [pythonProjects, pythonStats]);

  // When tab changes, persist to localStorage
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('sted-active-tab', tabId);
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Tab Navigation */}
        <div className="flex justify-left w-130 mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'my-learning', label: 'My Learning' },
              { id: 'feed', label: 'Learning Feed' },
              { id: 'discover', label: 'Discover Students' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
        </div>

        {/* Tab Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 max-w-300 w-full">
            {activeTab === 'my-learning' && (
              <div className="space-y-6">
                <div className="flex items-center mb-10">
                  <Link to="/all-skills" className="text-indigo-600 hover:underline font-semibold text-base" style={{marginRight: 'auto'}}>
                    + add skill
                  </Link>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Show only started skills, matching AllSkills logic */}
                {(() => {
                  const skillMap = {
                    'python': {
                      route: '/python',
                      node: 'python',
                      currentProjectField: 'PythonCurrentProject',
                      img: python,
                      label: 'Python Learning',
                    },
                    'data-science': {
                      route: '/data-science',
                      node: 'data-science',
                      currentProjectField: 'DataScienceCurrentProject',
                      img: null,
                      label: 'Data Science Learning',
                      icon: <span className="text-xl mr-2">📊</span>,
                    },
                    'public-speaking': {
                      route: '/public-speaking',
                      node: 'public-speaking',
                      currentProjectField: 'PublicSpeakingCurrentProject',
                      img: null,
                      label: 'Public Speaking Learning',
                      icon: <span className="text-xl mr-2">🎤</span>,
                    },
                    'powerbi': {
                      route: '/powerbi',
                      node: 'powerbi',
                      currentProjectField: 'PowerBiCurrentProject',
                      img: PowerBi,
                      label: 'Power BI Learning',
                    },
                  };
                  const startedSkills = Object.entries(skillMap).filter(([key, skill]) =>
                    userData && userData[skill.node] && userData[skill.node][skill.currentProjectField]
                  );
                  if (startedSkills.length === 0) {
                    return (
                      <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-md transition-colors"
                          onClick={() => navigate('/all-skills')}
                        >
                          Add Skills
                        </button>
                      </div>
                    );
                  }
                  return startedSkills.map(([key, skill]) => {
                    // Calculate learned/applied and total for Python and PowerBI
                    let learned = 0, applied = 0, total = 0;
                    if (key === 'python') {
                      learned = pythonStats.learned;
                      applied = pythonStats.applied;
                      total = pythonStats.total;
                    } else if (key === 'powerbi') {
                      learned = powerbiStats.learned;
                      applied = powerbiStats.applied;
                      total = powerbiStats.total;
                    }
                    return (
                      <Link to={skill.route} key={key}>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-3">
                            {skill.img ? <img src={skill.img} alt={skill.label} className="w-6 h-6 mr-2" /> : skill.icon}
                            <h3 className="text-lg font-semibold text-slate-800">{skill.label}</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Learned</span> 
                                <span className="text-xs text-right font-medium text-slate-800">{learned}/{total}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full mb-3 h-1.5">
                                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${total > 0 ? (learned / total) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Applied</span> 
                                <span className="text-xs text-right font-medium text-slate-800">{applied}/{learned}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${learned > 0 ? (applied / learned) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
                    );
                  });
                })()}
              </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <Feed />
                    </div>
            )}

            {activeTab === 'discover' && (
              <DiscoverStudents />
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col space-y-6 w-72 min-w-[26rem] max-w-xs">
            {/* Mini Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative rounded-lg shadow-sm p-6 flex flex-col items-center w-full bg-white"
            >
              <Link to={'/profile'}>
              <div className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center">
                <img src={openImg} alt="Open" className="w-6 h-6 object-contain" />
              </div>
              </Link>
              {isLoadingProfile ? (
                <div className="w-full flex justify-center items-center h-24">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userData ? (
                <>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3 border-4 border-white">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-center text-slate-800 drop-shadow">{user?.fullName || 'Student'}</h3>
                  {(() => {
                    // Calculate total SP for all started skills
                    let totalSP = 0;
                    const skillMap = {
                      'python': {
                        node: 'python',
                        currentProjectField: 'PythonCurrentProject',
                      },
                      'data-science': {
                        node: 'data-science',
                        currentProjectField: 'DataScienceCurrentProject',
                      },
                      'public-speaking': {
                        node: 'public-speaking',
                        currentProjectField: 'PublicSpeakingCurrentProject',
                      },
                      'powerbi': {
                        node: 'powerbi',
                        currentProjectField: 'PowerBiCurrentProject',
                      },
                    };
                    const startedSkills = Object.entries(skillMap).filter(([key, skill]) =>
                      userData && userData[skill.node] && userData[skill.node][skill.currentProjectField]
                    );
                    startedSkills.forEach(([key]) => {
                      if (key === 'python') {
                        totalSP += pythonSP;
                      } else {
                        totalSP += calculateSkillSP(key);
                      }
                    });
                    return <p className="text-center text-sm mb-2 text-slate-600">Total SP: {totalSP}</p>;
                  })()}
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {userData.projectHistory && userData.projectHistory.length > 0 ? (
                      Array.from(new Set(userData.projectHistory.map(p => p.skill))).map((skill) => {
                        const skillSP = userData.projectHistory.filter(p => p.skill === skill).reduce((acc, p) => acc + (p.sp || 0), 0);
                        return (
                          <span key={skill} className="bg-slate-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">{skill && skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        );
                      })
                    ) : null}
                  </div>
                  {/* Skills and SP List */}
                  {(() => {
                    // Define started skills logic
                    const skillMap = {
                      'python': {
                        node: 'python',
                        currentProjectField: 'PythonCurrentProject',
                        label: 'Python',
                      },
                      'data-science': {
                        node: 'data-science',
                        currentProjectField: 'DataScienceCurrentProject',
                        label: 'Data Science',
                      },
                      'public-speaking': {
                        node: 'public-speaking',
                        currentProjectField: 'PublicSpeakingCurrentProject',
                        label: 'Public Speaking',
                      },
                      'powerbi': {
                        node: 'powerbi',
                        currentProjectField: 'PowerBiCurrentProject',
                        label: 'Power BI',
                      },
                    };
                    const startedSkills = Object.entries(skillMap).filter(([key, skill]) =>
                      userData && userData[skill.node] && userData[skill.node][skill.currentProjectField]
                    );
                    if (startedSkills.length === 0) return null;
                    return (
                    <div className="w-full mt-4">
                      <h4 className="text-slate-700 font-semibold text-sm mb-2">Your Skills & SP</h4>
                      <div className="flex flex-col gap-2">
                          {startedSkills.map(([key, skill]) => (
                            <div key={key} className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                              <span className="text-purple-700 font-semibold">{skill.label}</span>
                              <span className="font-semibold text-purple-700">
                                {key === 'python' ? `${pythonSP} SP` : `${calculateSkillSP(key)} SP`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-slate-500 text-center">No profile data</div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 w-full"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/python">
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                    🐍 Continue Python Learning
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Home