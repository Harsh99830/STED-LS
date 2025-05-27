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
    const { isLoaded, isSignedIn, user  } = useUser(); 
    const [showIntro, setShowIntro] = useState(false);
    const [userData, setUserData] = useState({
    level: '',
     xp: 0,
     tasksCompleted: 0
    });

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
    });
  }
}, [isLoaded, isSignedIn]);


    return (
        <div className="min-h-screen bg-[#F4E7E1] relative pb-32">
            {showIntro && <WelcomeIntro onClose={handleCloseIntro} />}

            {/* Navbar */}
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>

            {/* Main content with sidebar */}
            <div className="flex flex-col lg:flex-row">
                <Sidebar />
                <div className="w-full relative px-4">

                    {/* Responsive container for all 3 blocks */}
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6 mt-12">
                        {/* Tip of the Day */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/90 rounded-2xl p-4 shadow-xl w-full max-w-sm"
                        >
                            <h2 className="text-lg font-semibold mb-1 text-center">💡 Tip of the Day</h2>
                            <p className="text-sm text-center">“Public speaking boosts your confidence, career, and memory!”</p>
                            <p className="text-sm mt-1 text-center">🌱 Growth is a daily habit. One task a day keeps fear away.</p>
                        </motion.div>

                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center justify-center text-center w-full max-w-xl"
                        >
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delayChildren: 0.3,
                                            staggerChildren: 0.2,
                                        },
                                    },
                                }}
                                className="mb-6"
                            >
                                <motion.h1
                                    className="text-3xl sm:text-4xl font-bold mb-2 animate-pulse"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    🎯 Welcome back, Kshitij!
                                </motion.h1>

                                <motion.p
                                    className="text-base sm:text-lg text-gray-700"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    You’re 1 step closer to becoming a confident speaker.
                                </motion.p>

                                <motion.div
                                    className="mt-4"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <Link
                                        to="/task"
                                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 hover:scale-105 transition-transform duration-300"
                                    >
                                        Start Task
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Snapshot */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/80 rounded-xl p-6 shadow-xl w-full max-w-sm"
                        >
                            <h2 className="text-xl font-semibold mb-2">📊 Your Snapshot</h2>
                           <p>Level: <strong>{userData.level}</strong></p>
                            <p>XP: <strong>{userData.xp} / 500 XP</strong></p>
                            <p>Tasks Completed: <strong>{userData.tasksCompleted}</strong></p>
                            <p>🔥 Streak: <strong>1 Day</strong></p>
                            <p>Leaderboard Position: <strong>#17</strong></p>
                            <Link to="/progress" className="text-blue-600 mt-2 inline-block hover:underline">See Full Progress →</Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Home;
