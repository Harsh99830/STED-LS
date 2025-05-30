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
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-b from-slate-50 to-slate-100 w-full min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 overflow-hidden"
    >
      {/* Left Section: Text */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col items-start text-center lg:text-left max-w-xl"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-3xl sm:text-4xl font-medium text-slate-600 mb-4 font-sans">
            A practical way to learn
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 leading-tight font-serif">
            <span className="block">Public</span>
            <span className="block text-blue-700">Speaking</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-slate-600 mb-8 max-w-md"
        >
          Master the art of public speaking with our comprehensive learning platform designed for professionals.
        </motion.p>

        <Link to="/login">
          <motion.button
            whileHover={{ 
              scale: 1.02,
              backgroundColor: '#1e40af'
            }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-blue-700 text-white text-lg rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Start Learning
          </motion.button>
        </Link>
      </motion.div>

      {/* Right Section: Image Grid */}
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full lg:w-1/2 flex justify-center mt-12 lg:mt-0"
      >
        <div className="grid grid-cols-2 gap-4 bg-white rounded-xl p-6 shadow-lg max-w-[500px]">
          {[
            { src: speaker, alt: "Professional Speaker", delay: 0.2 },
            { src: speak, alt: "Speaking Practice", delay: 0.3 },
            { src: ano, alt: "Business Presentation", delay: 0.4 },
            { src: mic, alt: "Professional Microphone", delay: 0.5 }
          ].map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: img.delay + 0.4,
                duration: 0.5
              }}
              className="aspect-square overflow-hidden rounded-lg shadow-sm"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "tween", duration: 0.2 }}
                className="w-full h-full"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Professional Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>
    </motion.div>
  );
}

export default Start;

// Add these styles to your CSS/Tailwind config
/*
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
*/
