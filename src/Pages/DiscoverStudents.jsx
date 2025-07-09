import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

// Static student (Alex Chen)
const staticStudents = [
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
  },
];

function DiscoverStudents() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const myEmail = user?.primaryEmailAddress?.emailAddress;
        const usersArr = Object.entries(usersObj)
          .filter(([uid, data]) => {
            // Exclude current user by email
            if (!myEmail) return true;
            return (data.email !== myEmail && data.emailAddress !== myEmail);
          })
          .map(([uid, data]) => {
            const skills = Object.keys(data).filter(k => ['python', 'data-science', 'public-speaking', 'powerbi'].includes(k));
            return {
              id: uid,
              name: data.name || data.username || 'Student',
              avatar: data.avatar || '👤',
              level: data.level || '',
              skills: skills.length > 0 ? skills : ['no skills'],
              isOnline: true, // Optionally implement real online status
              lastActive: '', // Optionally implement last active
            };
          });
        setStudents(usersArr);
      } else {
        setStudents([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Combine static and dynamic students, but keep Alex Chen at the top
  const allStudents = [...staticStudents, ...students];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-h-140 overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-13">
        {allStudents.map((student) => (
          <motion.div
            key={student.id}
          initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-200 flex flex-col w-72 max-w-xs cursor-pointer"
            onClick={() => student.id === '1' ? null : navigate(`/userprofile/${student.id}`)}
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
              <div className="flex justify-between w-full mt-2 text-xs text-slate-600">
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
  );
}

export default DiscoverStudents; 