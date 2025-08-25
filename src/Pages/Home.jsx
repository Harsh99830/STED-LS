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
  const [pandasStats, setPandasStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [pandasProjects, setPandasProjects] = useState([]);
  const [cStats, setCStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [cProjects, setCProjects] = useState([]);
  const [cplusStats, setCplusStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [cplusProjects, setCplusProjects] = useState([]);
  const [dsaStats, setDsaStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [dsaProjects, setDsaProjects] = useState([]);
  const [devopsStats, setDevopsStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [devopsProjects, setDevopsProjects] = useState([]);
  const [javaStats, setJavaStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [javaProjects, setJavaProjects] = useState([]);
  const [javascriptStats, setJavascriptStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [javascriptProjects, setJavascriptProjects] = useState([]);
  const [nodejsStats, setNodejsStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [nodejsProjects, setNodejsProjects] = useState([]);
  const [numpyStats, setNumpyStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [numpyProjects, setNumpyProjects] = useState([]);
  const [reactjsStats, setReactjsStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [reactjsProjects, setReactjsProjects] = useState([]);
  const [sqlStats, setSqlStats] = useState({ learned: 0, applied: 0, total: 0 });
  const [sqlProjects, setSqlProjects] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  
  // Define color schemes for each skill
  const skillColors = {
    'python': { learned: 'bg-blue-600', applied: 'bg-blue-400' },
    'c': { learned: 'bg-gray-600', applied: 'bg-gray-400' },
    'cplus': { learned: 'bg-indigo-600', applied: 'bg-indigo-400' },
    'dsa': { learned: 'bg-red-600', applied: 'bg-red-400' },
    'devops': { learned: 'bg-green-600', applied: 'bg-green-400' },
    'java': { learned: 'bg-amber-600', applied: 'bg-amber-400' },
    'javascript': { learned: 'bg-yellow-600', applied: 'bg-yellow-400' },
    'nodejs': { learned: 'bg-lime-600', applied: 'bg-lime-400' },
    'numpy': { learned: 'bg-cyan-600', applied: 'bg-cyan-400' },
    'reactjs': { learned: 'bg-sky-600', applied: 'bg-sky-400' },
    'sql': { learned: 'bg-violet-600', applied: 'bg-violet-400' },
    'data-science': { learned: 'bg-fuchsia-600', applied: 'bg-fuchsia-400' },
    'public-speaking': { learned: 'bg-rose-600', applied: 'bg-rose-400' },
    'powerbi': { learned: 'bg-orange-600', applied: 'bg-orange-400' },
    'pandas': { learned: 'bg-emerald-600', applied: 'bg-emerald-400' }
  };
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch Pandas completed projects
      const completedPandasProjectsRef = ref(db, 'users/' + user.id + '/pandas/PandasCompletedProjects');
      get(completedPandasProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setPandasProjects(projects);
        } else {
          setPandasProjects([]);
        }
        setIsLoadingSkills(false);
      });
      // Fetch Pandas learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.pandas?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          // Applied: count learned concepts that are used in any completed project
          const conceptsUsed = new Set();
          (Object.values(data.pandas?.PandasCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          const applied = learnedConcepts.filter(concept => conceptsUsed.has(concept.concept || concept)).length;
          // Fetch total concepts from PandasProject/AllConcepts/category
          get(ref(db, 'PandasProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const data = allConceptsSnap.val();
              total = Object.values(data).reduce((acc, arr) => acc + Object.values(arr || {}).length, 0);
            }
            setPandasStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);
  const pandasIcon = <span className="text-2xl mr-2">🐼</span>;

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

      // Fetch C completed projects
      const completedCProjectsRef = ref(db, 'users/' + user.id + '/c/CCompletedProjects');
      get(completedCProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setCProjects(projects);
        } else {
          setCProjects([]);
        }
      });

      // Fetch C learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.c?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          // Applied: count learned concepts that are used in any completed project
          const conceptsUsed = new Set();
          (Object.values(data.c?.CCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          const applied = learnedConcepts.filter(concept => conceptsUsed.has(concept.concept || concept)).length;
          // Fetch total concepts from CProject/AllConcepts/category
          get(ref(db, 'CProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const data = allConceptsSnap.val();
              total = Object.values(data).reduce((acc, arr) => acc + Object.values(arr || {}).length, 0);
            }
            setCStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch C++ data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch C++ completed projects
      const completedCplusProjectsRef = ref(db, 'users/' + user.id + '/cplus/CplusCompletedProjects');
      get(completedCplusProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setCplusProjects(projects);
        } else {
          setCplusProjects([]);
        }
      });

      // Fetch C++ learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.cplus?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.cplus?.CplusCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'CplusProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setCplusStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch DSA data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch DSA completed projects
      const completedDsaProjectsRef = ref(db, 'users/' + user.id + '/dsa/DsaCompletedProjects');
      get(completedDsaProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setDsaProjects(projects);
        } else {
          setDsaProjects([]);
        }
      });

      // Fetch DSA learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.dsa?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.dsa?.DsaCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'DSAProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setDsaStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Calculate Python SP as in Python page
  useEffect(() => {
    setPythonSP(pythonProjects.length * 10 + pythonStats.learned * 2 + pythonStats.applied * 5);
  }, [pythonProjects, pythonStats]);

  // Fetch SQL data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch SQL completed projects
      const completedSqlProjectsRef = ref(db, 'users/' + user.id + '/sql/SqlCompletedProjects');
      get(completedSqlProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setSqlProjects(projects);
        } else {
          setSqlProjects([]);
        }
      });

      // Fetch SQL learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.sql?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.sql?.SqlCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'SQLProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setSqlStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch ReactJS data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch ReactJS completed projects
      const completedReactjsProjectsRef = ref(db, 'users/' + user.id + '/reactjs/ReactjsCompletedProjects');
      get(completedReactjsProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setReactjsProjects(projects);
        } else {
          setReactjsProjects([]);
        }
      });

      // Fetch ReactJS learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.reactjs?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.reactjs?.ReactjsCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'ReactJSProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setReactjsStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch NumPy data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch NumPy completed projects
      const completedNumpyProjectsRef = ref(db, 'users/' + user.id + '/numpy/NumpyCompletedProjects');
      get(completedNumpyProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setNumpyProjects(projects);
        } else {
          setNumpyProjects([]);
        }
      });

      // Fetch NumPy learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.numpy?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.numpy?.NumpyCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'NumpyProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setNumpyStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch Node.js data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch Node.js completed projects
      const completedNodejsProjectsRef = ref(db, 'users/' + user.id + '/nodejs/NodejsCompletedProjects');
      get(completedNodejsProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setNodejsProjects(projects);
        } else {
          setNodejsProjects([]);
        }
      });

      // Fetch Node.js learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.nodejs?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.nodejs?.NodejsCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'NodeJSProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setNodejsStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch JavaScript data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch JavaScript completed projects
      const completedJavascriptProjectsRef = ref(db, 'users/' + user.id + '/javascript/JavascriptCompletedProjects');
      get(completedJavascriptProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setJavascriptProjects(projects);
        } else {
          setJavascriptProjects([]);
        }
      });

      // Fetch JavaScript learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.javascript?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.javascript?.JavascriptCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'JavascriptProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setJavascriptStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch Java data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch Java completed projects
      const completedJavaProjectsRef = ref(db, 'users/' + user.id + '/java/JavaCompletedProjects');
      get(completedJavaProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setJavaProjects(projects);
        } else {
          setJavaProjects([]);
        }
      });

      // Fetch Java learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.java?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.java?.JavaCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'JavaProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setJavaStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Fetch DevOps data
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      // Fetch DevOps completed projects
      const completedDevopsProjectsRef = ref(db, 'users/' + user.id + '/devops/DevopsCompletedProjects');
      get(completedDevopsProjectsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const projects = Object.values(snapshot.val() || {});
          setDevopsProjects(projects);
        } else {
          setDevopsProjects([]);
        }
      });

      // Fetch DevOps learned/applied concepts and total concepts
      get(ref(db, 'users/' + user.id)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let learnedConcepts = data.devops?.learnedConcepts || [];
          if (typeof learnedConcepts === 'object' && !Array.isArray(learnedConcepts)) {
            learnedConcepts = Object.values(learnedConcepts);
          }
          const learned = learnedConcepts.length;
          
          // Count applied concepts from completed projects
          const conceptsUsed = new Set();
          (Object.values(data.devops?.DevopsCompletedProjects || {})).forEach(project => {
            if (project.conceptUsed) {
              project.conceptUsed.split(',').forEach(c => conceptsUsed.add(c.trim()));
            }
          });
          
          const applied = learnedConcepts.filter(concept => 
            conceptsUsed.has(concept.concept || concept)
          ).length;
          
          // Get total concepts from the database
          get(ref(db, 'DevopsProject/AllConcepts/category')).then((allConceptsSnap) => {
            let total = 0;
            if (allConceptsSnap.exists()) {
              const categories = allConceptsSnap.val();
              Object.values(categories).forEach(category => {
                if (category && typeof category === 'object') {
                  total += Object.keys(category).length;
                }
              });
            }
            setDevopsStats({ learned, applied, total });
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, user]);

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
                {!isLoadingSkills && (
                  <div className="flex items-center mb-10">
                    <Link to="/all-skills" className="text-indigo-600 hover:underline font-semibold text-base" style={{marginRight: 'auto'}}>
                      + add skill
                    </Link>
                  </div>
                )}
                {isLoadingSkills ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                    <div className="w-full max-w-md mx-auto">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                              Loading
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-purple-600">
                              Please wait...
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                          <div 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 animate-pulse"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">Fetching your skills and progress...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6" style={{maxHeight: '66vh', overflowY: 'auto'}}>
                    {/* Show only started skills, matching AllSkills logic */}
                    {(() => {
                  const skillMap = {
                    'python': {
                      route: '/python',
                      node: 'python',
                      currentProjectField: 'PythonCurrentProject',
                      img: python,
                      label: 'Python',
                    },
                    'c': {
                      route: '/c',
                      node: 'c',
                      currentProjectField: 'CCurrentProject',
                      img: null,
                      label: 'C Programming',
                      icon: <span className="text-xl mr-2">🔧</span>,
                    },
                    'cplus': {
                      route: '/cplus',
                      node: 'cplus',
                      currentProjectField: 'CplusCurrentProject',
                      img: null,
                      label: 'C++',
                      icon: <span className="text-xl mr-2">⚙️</span>,
                    },
                    'dsa': {
                      route: '/dsa',
                      node: 'dsa',
                      currentProjectField: 'DSACurrentProject',
                      img: null,
                      label: 'Data Structures & Algorithms',
                      icon: <span className="text-xl mr-2">🧮</span>,
                    },
                    'devops': {
                      route: '/devops',
                      node: 'devops',
                      currentProjectField: 'DevOpsCurrentProject',
                      img: null,
                      label: 'DevOps',
                      icon: <span className="text-xl mr-2">🔄</span>,
                    },
                    'java': {
                      route: '/java',
                      node: 'java',
                      currentProjectField: 'JavaCurrentProject',
                      img: null,
                      label: 'Java',
                      icon: <span className="text-xl mr-2">☕</span>,
                    },
                    'javascript': {
                      route: '/javascript',
                      node: 'javascript',
                      currentProjectField: 'JavascriptCurrentProject',
                      img: null,
                      label: 'JavaScript',
                      icon: <span className="text-xl mr-2">📜</span>,
                    },
                    'nodejs': {
                      route: '/nodejs',
                      node: 'nodejs',
                      currentProjectField: 'NodeJSCurrentProject',
                      img: null,
                      label: 'Node.js',
                      icon: <span className="text-xl mr-2">🟢</span>,
                    },
                    'numpy': {
                      route: '/numpy',
                      node: 'numpy',
                      currentProjectField: 'NumpyCurrentProject',
                      img: null,
                      label: 'NumPy',
                      icon: <span className="text-xl mr-2">🔢</span>,
                    },
                    'reactjs': {
                      route: '/reactjs',
                      node: 'reactjs',
                      currentProjectField: 'ReactJSCurrentProject',
                      img: null,
                      label: 'React.js',
                      icon: <span className="text-xl mr-2">⚛️</span>,
                    },
                    'sql': {
                      route: '/sql',
                      node: 'sql',
                      currentProjectField: 'SQLCurrentProject',
                      img: null,
                      label: 'SQL',
                      icon: <span className="text-xl mr-2">🗃️</span>,
                    },
                    'data-science': {
                      route: '/data-science',
                      node: 'data-science',
                      currentProjectField: 'DataScienceCurrentProject',
                      img: null,
                      label: 'Data Science',
                      icon: <span className="text-xl mr-2">📊</span>,
                    },
                    'public-speaking': {
                      route: '/public-speaking',
                      node: 'public-speaking',
                      currentProjectField: 'PublicSpeakingCurrentProject',
                      img: null,
                      label: 'Public Speaking',
                      icon: <span className="text-xl mr-2">🎤</span>,
                    },
                    'powerbi': {
                      route: '/powerbi',
                      node: 'powerbi',
                      currentProjectField: 'PowerBiCurrentProject',
                      img: PowerBi,
                      label: 'Power BI',
                    },
                    'pandas': {
                      route: '/pandas',
                      node: 'pandas',
                      currentProjectField: 'PandasCurrentProject',
                      img: null,
                      label: 'Pandas',
                      icon: pandasIcon,
                    },
                  };
                  const startedSkills = Object.entries(skillMap).filter(([key, skill]) =>
                    userData && userData[skill.node] && 
                    (userData[skill.node][skill.currentProjectField] !== undefined || 
                     userData[skill.node].learnedConcepts !== undefined)
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
                    // Calculate learned/applied and total for Python, C, PowerBI, and Pandas
                    let learned = 0, applied = 0, total = 0;
                    if (key === 'python') {
                      learned = pythonStats.learned;
                      applied = pythonStats.applied;
                      total = pythonStats.total;
                    } else if (key === 'c') {
                      learned = cStats.learned;
                      applied = cStats.applied;
                      total = cStats.total;
                    } else if (key === 'powerbi') {
                      learned = powerbiStats.learned;
                      applied = powerbiStats.applied;
                      total = powerbiStats.total;
                    } else if (key === 'pandas') {
                      learned = pandasStats.learned;
                      applied = pandasStats.applied;
                      total = pandasStats.total;
                    } else if (key === 'cplus') {
                      learned = cplusStats.learned;
                      applied = cplusStats.applied;
                      total = cplusStats.total;
                    } else if (key === 'dsa') {
                      learned = dsaStats.learned;
                      applied = dsaStats.applied;
                      total = dsaStats.total;
                    } else if (key === 'devops') {
                      learned = devopsStats.learned;
                      applied = devopsStats.applied;
                      total = devopsStats.total;
                    } else if (key === 'java') {
                      learned = javaStats.learned;
                      applied = javaStats.applied;
                      total = javaStats.total;
                    } else if (key === 'javascript') {
                      learned = javascriptStats.learned;
                      applied = javascriptStats.applied;
                      total = javascriptStats.total;
                    } else if (key === 'nodejs') {
                      learned = nodejsStats.learned;
                      applied = nodejsStats.applied;
                      total = nodejsStats.total;
                    } else if (key === 'numpy') {
                      learned = numpyStats.learned;
                      applied = numpyStats.applied;
                      total = numpyStats.total;
                    } else if (key === 'reactjs') {
                      learned = reactjsStats.learned;
                      applied = reactjsStats.applied;
                      total = reactjsStats.total;
                    } else if (key === 'sql') {
                      learned = sqlStats.learned;
                      applied = sqlStats.applied;
                      total = sqlStats.total;
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
                                <div className={`${skillColors[key]?.learned || 'bg-purple-600'} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${total > 0 ? (learned / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs pb-2 text-slate-600">
                                <span>Concepts Applied</span> 
                                <span className="text-xs text-right font-medium text-slate-800">{applied}/{learned}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div className={`${skillColors[key]?.applied || 'bg-yellow-400'} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${learned > 0 ? (applied / learned) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  });
                })()}
              </div>
                )}
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
                      'pandas': {
                        node: 'pandas',
                        currentProjectField: 'PandasCurrentProject',
                      },
                      'c': {
                        node: 'c',
                        currentProjectField: 'CCurrentProject',
                      },
                      'dsa': {
                        node: 'dsa',
                        currentProjectField: 'DSACurrentProject',
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
                          <span key={skill} className="bg-slate-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            {skill && skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
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
                      'c': {
                        node: 'c',
                        currentProjectField: 'CCurrentProject',
                        label: 'C',
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
                      'pandas': {
                        node: 'pandas',
                        currentProjectField: 'PandasCurrentProject',
                        label: 'Pandas',
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