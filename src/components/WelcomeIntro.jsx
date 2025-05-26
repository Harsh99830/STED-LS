import React, { useState } from 'react';

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
    <div className="fixed top-0 left-0 w-full h-full z-[9999] backdrop-blur-md bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{steps[step].title}</h2>
        <p className="text-gray-700 mb-6">{steps[step].content}</p>

        <div className="flex justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back
            </button>
          ) : <div />}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 text-lg"
            >
              Start Learning
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i === step ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeIntro;
