import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'
import Feed from '../components/Feed'

function Home() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('feed')
  const [students, setStudents] = useState([])
  const [learningActivities, setLearningActivities] = useState([])

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
      }
    ])
  }, [])

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Tab Navigation */}
        <div className="flex justify-left w-100 mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {students.map((student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{student.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-slate-800">{student.name}</h3>
                            <span className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                          </div>
                          <p className="text-slate-600 text-sm mb-3">{student.level} • {student.lastActive}</p>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {student.skills.map((skill) => (
                                <span key={skill} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex space-x-4 text-sm text-slate-500">
                              <span>{student.conceptsLearned} concepts learned</span>
                              <span>{student.projectsCompleted} projects completed</span>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                              Add Friend
                            </button>
                            <button className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Your SP</h3>
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-semibold text-lg">Total SP</span>
                    <span className="font-bold text-slate-800 text-2xl">16</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Python</span>
                  <span className="font-semibold text-purple-600">16</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Data Science</span>
                  <span className="font-semibold text-blue-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Public Speaking</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Power BI</span>
                  <span className="font-semibold text-orange-600">0</span>
                </div>
              </div>
            </motion.div>


            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/python">
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                    🐍 Continue Python Learning
                  </button>
                </Link>
                <Link to="/data-science">
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    📊 Start Data Science
                  </button>
                </Link>
                <Link to="/public-speaking">
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                    🎤 Practice Speaking
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