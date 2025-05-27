import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeIntro = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const totalSteps = 4;

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Welcome to STED 🎉</h2>
            <p className="text-gray-800 text-lg mb-10 text-left">
              STED helps you become a confident public speaker through fun and actionable micro-tasks.
            </p>
            <p className="text-[#5b5b5b] text-lg text-left italic">
              Learn by <strong>doing</strong> — not watching boring lectures.
            </p>
          </>
        );

      case 1:
        return (
          <>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">4 Learning Categories 🎯</h2>
            <p className="text-gray-800 text-lg mb-4 text-left">
              Every task focuses on one of these four skills:
            </p>
            <ul className="text-left list-disc list-inside space-y-2 text-[#5b5b5b] text-lg">
              <li>💪 Confidence Building</li>
              <li>🕺 Body Language & Gestures</li>
              <li>🎤 Voice Control & Clarity</li>
              <li>👥 Audience Engagement & Interaction</li>
            </ul>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Track Your Growth 📈</h2>
            <p className="text-gray-800 text-lg mb-4 text-left">
              You can track your progress and see how you improve over time.
            </p>
           <ul className="text-left list-disc list-inside space-y-2 text-[#494848] text-lg">
              <li>⭐ Complete tasks - XP & level up</li>
              <li>🗓️ See your progress snapshot and streak</li>
              <li>🥇 Compete on a fun leaderboard with others.</li>
            </ul>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Let’s Begin 🚀</h2>
            <p className="text-gray-800 text-lg mb-4 text-left">
              You’re ready to unlock your voice and grow every day.
            </p>
            <p className="text-[#5b5b5b] text-lg text-left italic">
              Click below to start learning.
            </p>
          </>
        );

      default:
        return null;
    }
  };

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
          {StepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step - 1)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
              >
                Back
              </motion.button>
            ) : <div />}

            {step < totalSteps - 1 ? (
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
                className="bg-green-600 text-white px-6 py-2 hover:bg-green-700 rounded text-lg transition font-semibold shadow-lg"
              >
                Start
              </motion.button>
            )}
          </div>

          {/* Step Indicators */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
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
