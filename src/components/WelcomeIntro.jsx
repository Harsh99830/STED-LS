import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeIntro = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to STED 🎉",
      content: "STED helps you become a confident public speaker through daily micro-tasks.",
    },
    {
      title: "4 Learning Categories 🎯",
      content: "You'll grow in Confidence, Voice Control, Body Language, and Audience Engagement.",
    },
    {
      title: "Learn by Doing 🧠",
      content: "Complete one small task every day to build your speaking superpower consistently.",
    },
    {
      title: "Let's Begin 🚀",
      content: "Get ready to unlock your voice! Click below to start your journey.",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 w-full h-full z-[9999] backdrop-blur-sm bg-black/30 flex items-center justify-center"
      >
        <motion.div
          key={step}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-purple-200 via-pink-100 to-yellow-100 rounded-2xl shadow-2xl w-[90%] max-w-xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-4">{steps[step].title}</h2>
          <p className="text-gray-800 text-lg mb-6">{steps[step].content}</p>

          <div className="flex justify-between">
            {step > 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step - 1)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
              >
                Back
              </motion.button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step + 1)}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition font-semibold shadow-md"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 text-lg transition font-semibold shadow-lg"
              >
                Start Learning
              </motion.button>
            )}
          </div>

          <div className="mt-6 flex justify-center space-x-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-blue-600 scale-110' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeIntro;
