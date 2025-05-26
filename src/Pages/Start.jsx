import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import speaker from '../assets/speaker.jpg';
import speak from '../assets/speak.jpg'
import ano from '../assets/ano.jpg'
import mic from '../assets/mic.jpg'

function Start() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-gradient-to-tr from-[#E0F2FE] via-[#BAE6FD] to-[#DFF6FF] w-full min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 overflow-hidden"
    >
      {/* Left Section: Text */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-start text-center lg:text-left max-w-xl overflow-hidden"
      >
        <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#374151] mb-6 font-sans">
          A practical way to learn
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#4F46E5] mb-10 leading-tight font-serif">
          <span className="block leading-[1.2]">Public</span>
          <span className="block">Speaking</span>
        </h1>
        <Link to="/login">
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)', // Orange glow
              backgroundColor: '#EA580C', // Deep Orange on hover
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#F97316] text-white text-lg rounded-md transition font-semibold"
          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>
      {/* Right Section: Image with Colored Box */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex justify-center mt-10 lg:mt-0"
      >
        <div className="grid grid-cols-2 gap-6 bg-[#BFDBFE] rounded-3xl p-4 sm:p-6 max-w-[500px]">
          <motion.img
            src={speaker}
            alt="Speaker"
            className="w-full h-auto object-contain rounded-2xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <motion.img
            src={speak}
            alt="Speaking Practice"
            className="w-full h-auto object-contain rounded-2xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <motion.img
            src={ano}
            alt="Another Speaker"
            className="w-full h-auto object-contain rounded-2xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <motion.img
            src={mic}
            alt="Mic"
            className="w-full h-auto object-contain rounded-2xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </div>
      </motion.div>

    </motion.div>
  );
}

export default Start;
