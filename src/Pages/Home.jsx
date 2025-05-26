import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react'; 
function Home() {
    const navigate = useNavigate();
    const {isLoaded, isSignedIn } = useUser(); 
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/');
        }
    }, [isLoaded, isSignedIn, navigate]);
    return (
        <div className="min-h-screen bg-[#F4E7E1] pb-32">
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            <div className="flex">
                <Sidebar />
                <div className="w-full px-4 py-10">
                    {/* Tip of the Day on Top Left */}
                    <div className="bg-white/90 rounded-2xl p-4 shadow mb-10 w-fit h-50 mt-6 ml-6">
                        <h2 className="text-lg font-semibold mb-1 text-center">💡 Tip of the Day</h2>
                        <p className="text-sm text-center">“Public speaking boosts your confidence, career, and memory!”</p>
                        <p className="text-sm mt-1 text-center">🌱 Growth is a daily habit. One task a day keeps fear away.</p>
                    </div>

                    {/* Welcome Section */}
                    <div className="text-center mb-10 ml-6 max-w-md mx-auto md:mx-0">
                        <h1 className="text-4xl font-bold mb-2">🎯 Welcome back, Kshitij!</h1>
                        <p className="text-lg text-gray-700">You’re 1 step closer to becoming a confident speaker.</p>
                        <Link
                            to="/task"
                            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
                        >
                            Start Task
                        </Link>
                    </div>

                    {/* Snapshot Section */}
                    <div className="absolute right-6 top-24 z-10 ">
                        <div className="flex flex-col gap-6 w-fit">
                            <div className="bg-white/80 rounded-xl p-6 shadow w-full h-105" style={{ width: '400px' }}>
                                <h2 className="text-xl font-semibold mb-2">📊 Your Snapshot</h2>
                                <p>Level: <strong>Level 1 – New Explorer</strong></p>
                                <p>XP: <strong>0 / 500 XP</strong></p>
                                <p>🔥 Streak: <strong>1 Day</strong></p>
                                <p>Tasks Completed: <strong>0</strong></p>
                                <p>Leaderboard Position: <strong>#17</strong></p>
                                <Link to="/progress" className="text-blue-600 mt-2 inline-block hover:underline">See Full Progress →</Link>
                            </div>
                        </div>
                    </div>
                    {/* Survey Button */}
                    <div className="mb-10 text-center ">
                        <button
                            onClick={() => alert('Survey button clicked!')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
                        >
                            Take Quick Survey
                        </button>
                    </div>

                    {/* Leaderboard Preview */}
                    <div className="bg-white/80 rounded-xl p-6 shadow mb-10 mx-4 w-fit ">
                        <h2 className="text-xl font-semibold mb-2">👑 Top Performers</h2>
                        <ul className="list-disc pl-5 ">
                            <li>Ananya — 800 XP</li>
                            <li>Rahul — 750 XP</li>
                            <li>Priya — 720 XP</li>
                            <li>You’re at #17 — climb the ranks!</li>
                        </ul>
                        <Link to="/leaderboard" className="text-blue-600 mt-2 inline-block hover:underline">View Leaderboard →</Link>
                    </div>
                </div>
            </div>

            {/* Floating CTA */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <Link
                    to="/tasks"
                    className="bg-purple-600 text-white px-8 py-3 rounded-full shadow-xl hover:bg-purple-700 transition text-lg"
                >
                    🔥 Ready to grow? Start Your First Task!
                </Link>
            </div>
        </div>
    );
}

export default Home;
