import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import speaker from '../assets/Photo1.jpeg';
import mic from '../assets/Photo2.webp';
import ano from '../assets/Photo3.webp';
import speak from '../assets/Photo5.jpg';

function Start() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700" />

      {/* Background bubbles */}
      <div className="absolute top-40 right-40 w-96 h-96 bg-blue-50 rounded-full opacity-30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-slate-50 rounded-full opacity-30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 lg:px-8 min-h-screen flex flex-col lg:flex-row items-center justify-center relative z-10"
      >
        {/* Left Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-col items-start text-center lg:text-left lg:w-1/2 lg:pr-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-blue-50 rounded-lg px-6 py-3 mb-6"
          >
            <span className="text-blue-700 font-semibold text-lg">
              Practice &gt; Theory
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
            <span className="block">Apply & Track</span>
            <span className="block text-blue-700">your <em>Learning</em></span>
          </h1>

          <p className="text-lg text-slate-600 mb-12 max-w-xl leading-relaxed">
            Pick a task → build it → level up. Real projects, instant feedback.
          </p>

          <div className="mt-2">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 
                          rounded-lg font-semibold text-lg shadow-lg 
                          transition-all duration-300 flex items-center group"
              >
                Start Building
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full lg:w-1/2 flex justify-center mt-12 lg:mt-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white shadow-lg rounded-lg transform rotate-3" />

            <div className="relative bg-white p-6 shadow-xl rounded-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="grid grid-cols-2 gap-4">
                {[speaker, speak, ano, mic].map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="relative group overflow-hidden rounded-lg shadow-md"
                  >
                    <motion.img
                      src={img}
                      alt={`Sted Skill ${index + 1}`}
                      className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700" />
    </div>
  );
}

export default Start;
