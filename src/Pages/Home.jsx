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

function Home() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState('my-learning')
  const [students, setStudents] = useState([])
  const [learningActivities, setLearningActivities] = useState([])
  const [userData, setUserData] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const navigate = useNavigate();

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
    }
  }, [isLoaded, isSignedIn, user]);

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
                onClick={() => setActiveTab(tab.id)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Python Learning Card */}
                <Link to={'/python'}>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-3">
                    <img src={python} alt="Python" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Python Learning</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts learned</span> 
                        <span className="text-xs text-right font-medium text-slate-800">8/50</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full mb-3 h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Applied</span> 
                        <span className="text-xs text-right font-medium text-slate-800">2/8</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
                {/* Power BI Learning Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-3">
                    <img src={PowerBi} alt="Power BI" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Power BI Learning</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts learned</span> 
                        <span className="text-xs text-right font-medium text-slate-800">7/20</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full mb-3 h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Applied</span> 
                        <span className="text-xs text-right font-medium text-slate-800">2/7</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Data Science Learning Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">📊</span>
                    <h3 className="text-lg font-semibold text-slate-800">Data Science Learning</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts learned</span> 
                        <span className="text-xs text-right font-medium text-slate-800">10/65</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full mb-3 h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Applied</span> 
                        <span className="text-xs text-right font-medium text-slate-800">3/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Public Speaking Learning Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">🎤</span>
                    <h3 className="text-lg font-semibold text-slate-800">Public Speaking Learning</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts learned</span> 
                        <span className="text-xs text-right font-medium text-slate-800">0/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full mb-3 h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-xs pb-2 text-slate-600">
                        <span>Concepts Applied</span> 
                        <span className="text-xs text-right font-medium text-slate-800">0</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-h-145 overflow-y-auto"
              >
                {learningActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{activity.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-slate-800">{activity.student}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500">{activity.time}</span>
                        </div>
                        <p className="text-slate-700 mb-2">
                          <span className="font-medium">{activity.action}</span>
                          {activity.project && (
                            <span> the <span className="font-semibold text-purple-600">{activity.project}</span> project</span>
                          )}
                          {activity.concept && (
                            <span> <span className="font-semibold text-purple-600">{activity.concept}</span> concept</span>
                          )}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {activity.skill}
                          </span>
                          {activity.sp > 0 && (
                            <span className="text-green-600 font-medium">+{activity.sp} SP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'discover' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-h-140 overflow-y-auto"
              >
                <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
                  {students.map((student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-200 flex flex-col w-72 max-w-xs mx-auto cursor-pointer"
                      onClick={() => navigate(`/userprofile/${student.id}`)}
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="text-5xl mb-3">{student.avatar}</div>
                        <div className="flex flex-col items-center mb-2">
                          <h3 className="font-semibold text-slate-800 text-lg">{student.name}</h3>
                          <span className={`w-2 h-2 rounded-full mt-1 ${student.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {student.skills.slice(0, 2).map((skill) => (
                            <span key={skill} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 2 && (
                            <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-full text-xs">
                              +{student.skills.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex w-full justify-center">
                          <button className=" border border-purple-600 text-purple-600 px-12 py-2 rounded-4xl text-sm font-medium hover:bg-purple-700 hover:text-white transition-colors">
                            Observe
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
                  <p className="text-center text-sm mb-2 text-slate-600">Total SP: 16</p>
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
                  {userData.projectHistory && userData.projectHistory.length > 0 ? (
                    <div className="w-full mt-4">
                      <h4 className="text-slate-700 font-semibold text-sm mb-2">Your Skills & SP</h4>
                      <div className="flex flex-col gap-2">
                        {Array.from(new Set(userData.projectHistory.map(p => p.skill))).map((skill) => {
                          const skillSP = userData.projectHistory.filter(p => p.skill === skill).reduce((acc, p) => acc + (p.sp || 0), 0);
                          return (
                            <div key={skill} className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                              <span className="text-purple-700 font-semibold">{skill && skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              <span className="font-semibold text-purple-700">{skillSP} SP</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full mt-4">
                      <h4 className="text-slate-700 font-semibold text-sm mb-2">Your Skills & SP</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                          <span className="text-purple-700 font-semibold">Python</span>
                          <span className="font-semibold text-purple-700">16 SP</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                          <span className="text-purple-700 font-semibold">Data Science</span>
                          <span className="font-semibold text-purple-700">0 SP</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                          <span className="text-purple-700 font-semibold">Public Speaking</span>
                          <span className="font-semibold text-purple-700">0 SP</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-100 rounded px-3 py-1 text-sm">
                          <span className="text-purple-700 font-semibold">Power BI</span>
                          <span className="font-semibold text-purple-700">0 SP</span>
                        </div>
                      </div>
                    </div>
                  )}
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