import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import python from "../assets/python.png";
import PowerBi from "../assets/PowerBi.png";
import learned from "../assets/learned.png";
import applied from "../assets/applied.png";

// Mock data for demonstration
const mockStudents = [
  {
    id: 1,
    name: 'Alex Chen',
    avatar: '👨‍💻',
    level: 'Intermediate',
    skills: ['Python', 'Data Science'],
    conceptsLearned: 15,
    projectsCompleted: 3,
    isOnline: true,
    lastActive: '2 minutes ago',
    observers: [2, 3],
    observing: [3],
    projectHistory: [
      { name: 'Personal Finance Tracker', description: 'A finance app', completedDate: '2024-06-01', sp: 10, skill: 'python' },
      { name: 'Data Dashboard', description: 'BI dashboard', completedDate: '2024-06-05', sp: 10, skill: 'powerbi' }
    ],
    python: { PythonSkill: 16 },
    powerbi: { PowerBiSkill: 40 },
    'data-science': { dataSkill: 20 },
    'public-speaking': { speakingSkill: 0 },
  },
  // ...add more mock students as needed
];

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find((s) => String(s.id) === id);
  const [userData, setUserData] = useState(student || {});
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [activeSkillDetailTab, setActiveSkillDetailTab] = useState('sp');

  useEffect(() => {
    if (student) setUserData(student);
  }, [student]);

  useEffect(() => {
    if (selectedSkill) {
      setActiveSkillDetailTab('sp');
    }
  }, [selectedSkill]);

  const calculateTotalSP = () => {
    if (!userData.projectHistory) return 0;
    return userData.projectHistory.reduce((acc, project) => acc + (project.sp || 0), 0);
  };
  const calculateSkillSP = (skill) => {
    if (!userData.projectHistory) return 0;
    return userData.projectHistory.filter(project => project.skill === skill).reduce((acc, project) => acc + (project.sp || 0), 0);
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl text-slate-600 mb-4">Student not found</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const renderSkillDetails = () => {
    if (!selectedSkill) return null;

    const skillNameMapping = {
      'python': 'Python',
      'powerbi': 'Power BI',
      'data-science': 'Data Science',
      'public-speaking': 'Public Speaking'
    };

    const skillName = skillNameMapping[selectedSkill];
    const projects = userData.projectHistory?.filter(p => p.skill === selectedSkill) || [];
    const sp = calculateSkillSP(selectedSkill);

    const detailContent = {
      sp: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">STED Points Breakdown</h4>
          <p className="mb-4">Total STED Points earned in {skillName}: <span className="font-bold">{sp}</span></p>
          <ul className="list-disc pl-6 space-y-2">
            {projects.filter(p => p.sp > 0).map((p, i) => (
              <li key={i}>{p.name}: <span className="font-semibold">+{p.sp} SP</span></li>
            ))}
          </ul>
        </motion.div>
      ),
      projects: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">{skillName} Projects</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {projects.length > 0 ? projects.map((p, i) => (
              <div key={i} className="bg-slate-100 rounded p-3">
                <div className="font-medium text-slate-800">{p.name}</div>
                <div className="text-slate-600 text-sm">{p.description}</div>
                <div className="flex items-center text-xs text-slate-500 mt-1">
                  <span>{p.completedDate}</span>
                  <span className="mx-2">|</span>
                  <span>+{p.sp} SP</span>
                </div>
              </div>
            )) : <div className="text-slate-500">No projects completed yet.</div>}
          </div>
        </motion.div>
      ),
      learned: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">Concepts Learned in {skillName}</h4>
          <p className="mb-4">Total concepts learned: <span className="font-bold">8/50</span></p>
          <div className="flex flex-wrap gap-2">
            {[...Array(8).keys()].map(i => (
              <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Learned Concept #{i + 1}</span>
            ))}
          </div>
        </motion.div>
      ),
      applied: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">Concepts Applied in {skillName}</h4>
          <p className="mb-4">Total concepts applied: <span className="font-bold">0/8</span></p>
          <div className="text-slate-500">No concepts applied in projects yet.</div>
        </motion.div>
      )
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-slate-50 rounded-lg p-6 border border-slate-200 relative">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{skillName} Details</h3>
          <button onClick={() => setSelectedSkill(null)} className="text-slate-500 hover:text-slate-800 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* STED Points */}
          <div
            onClick={() => setActiveSkillDetailTab('sp')}
            className={`bg-white rounded-lg shadow-md p-6 min-h-[120px] flex flex-col justify-between cursor-pointer transition-all relative ${activeSkillDetailTab === 'sp' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">SP (STED Points)</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{sp}</h3>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-purple-50 p-2 rounded-full">
              <span className="text-xl">�</span>
            </div>
          </div>
          {/* Projects Completed */}
          <div
            onClick={() => setActiveSkillDetailTab('projects')}
            className={`bg-white rounded-lg shadow-md p-6 min-h-[120px] flex flex-col justify-between cursor-pointer transition-all relative ${activeSkillDetailTab === 'projects' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Projects Completed</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{projects.length}</h3>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-purple-50 p-2 rounded-full">
              <span><img className="w-5 h-5" src={PowerBi} alt="" /></span>
            </div>
          </div>
          {/* Concepts Learned */}
          <div
            onClick={() => setActiveSkillDetailTab('learned')}
            className={`bg-white rounded-lg shadow-md p-6 min-h-[120px] flex flex-col justify-between cursor-pointer transition-all relative ${activeSkillDetailTab === 'learned' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Concepts Learned</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">8/50</h3>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-purple-50 p-2 rounded-full">
              <span className="text-xl"><img className="w-5 h-5" src={learned} alt="" /></span>
            </div>
          </div>
          {/* Concepts Applied */}
          <div
            onClick={() => setActiveSkillDetailTab('applied')}
            className={`bg-white rounded-lg shadow-md p-6 min-h-[120px] flex flex-col justify-between cursor-pointer transition-all relative ${activeSkillDetailTab === 'applied' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Concepts Applied</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">0/8</h3>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-yellow-50 p-2 rounded-full">
              <span className="text-xl"><img className="w-5 h-5" src={applied} alt="" /></span>
            </div>
          </div>
        </div>

        {/* Detail Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
          {detailContent[activeSkillDetailTab]}
        </div>
      </motion.div>
    );
  };

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
              <div className="flex items-center space-x-6 w-full">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">{student.avatar}</span>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
                    <p className="text-slate-600 text-left pt-2">Total SP: 76</p>
                  </div>
                  <button className="border border-purple-600 text-purple-600 px-12 py-2 rounded-4xl text-sm font-medium hover:bg-purple-700 hover:text-white transition-colors ml-6">
                    Observe
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-10 text-sm space-x-4">
                <div className="flex items-center">
                  <span className="text-slate-800 font-semibold">{userData.observers?.length || 0}</span>
                  <span className="text-slate-600 ml-2">Observers</span>
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center">
                  <span className="text-slate-800 font-semibold">{userData.observing?.length || 0}</span>
                  <span className="text-slate-600 ml-2">Observing</span>
                </div>
              </div>
            </div>
            {/* Skills Grid */}
            {selectedSkill ? renderSkillDetails() : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Python Skills */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSkill('python')}>
                  <div className="flex items-center mb-3">
                    <img src={python} alt="Python" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Python</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Concept learned</span>
                        <span className="text-sm font-medium text-slate-800">16%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${userData.python?.PythonSkill || 0}%` }}></div>
                      </div>
                    <div className="text-sm text-right font-medium text-slate-800">8/50</div>

                    </div>
                    <p className="text-sm text-slate-600">SP Earned: {calculateSkillSP('python')}</p>
                  </div>
                </motion.div>
                {/* Power BI Skills */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSkill('powerbi')}>
                  <div className="flex items-center mb-3">
                    <img src={PowerBi} alt="Power BI" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Power BI</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Concept learned</span>
                        <span className="text-sm font-medium text-slate-800">{userData.powerbi?.PowerBiSkill || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${userData.powerbi?.PowerBiSkill || 0}%` }}></div>
                      </div>
                    <div className="text-sm text-right font-medium text-slate-800">7/20</div>
                    </div>
                    <p className="text-sm text-slate-600">SP Earned: {calculateSkillSP('powerbi')}</p>
                  </div>
                </motion.div>
                {/* Data Science Skills */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSkill('data-science')}>
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">📊</span>
                    <h3 className="text-lg font-semibold text-slate-800">Data Science</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Concept learned</span>
                        <span className="text-sm font-medium text-slate-800">{userData['data-science']?.dataSkill || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${userData['data-science']?.dataSkill || 0}%` }}></div>
                      </div>
                    <div className="text-sm text-right font-medium text-slate-800">10/65</div>
                    </div>
                    <p className="text-sm text-slate-600">SP Earned: {calculateSkillSP('data-science')}</p>
                  </div>
                </motion.div>
                {/* Public Speaking Skills */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSkill('public-speaking')}>
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">🎤</span>
                    <h3 className="text-lg font-semibold text-slate-800">Public Speaking</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Concept learned</span>
                        <span className="text-sm font-medium text-slate-800">{userData['public-speaking']?.speakingSkill || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${userData['public-speaking']?.speakingSkill || 0}%` }}></div>
                      </div>
                    <div className="text-sm text-right font-medium text-slate-800">0/10</div>
                    </div>
                    <p className="text-sm text-slate-600">SP Earned: {calculateSkillSP('public-speaking')}</p>
                  </div>
                </motion.div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 