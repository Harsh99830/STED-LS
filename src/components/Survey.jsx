import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database'; // 👈 added `set`
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react'; // 👈 Clerk hook

function Survey() {
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const name = user.fullName || user.firstName || "Anonymous";
      const email = user.primaryEmailAddress?.emailAddress || "no-email@example.com";
      const userId = user.id;

      // console.log("✅ New user signed up:");
      // console.log("Name:", name);
      // console.log("Email:", email);

      // 👇 Save user info to Firebase
      const userRef = ref(db, `users/${userId}`);
      set(userRef, {
        name,
        email,
        signedUpAt: new Date().toISOString()
      });
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    const surveyRef = ref(db, 'survey');
    onValue(surveyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          question: data[key].question,
          options: data[key].option || {}
        }));
        setSurveyQuestions(formatted);
      }
    });
  }, []);

  const handleChange = (question, answer) => {
    setResponses((prev) => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

const handleSubmit = () => {
  if (isSignedIn && user) {
    const userResponseRef = ref(db, `users/${user.id}/responses`);
    set(userResponseRef, {
      SurveyResponses: responses,
      submittedAt: new Date().toISOString()
    });
  }

  setSubmitted(true);
  localStorage.setItem("showIntro", "true");
  setTimeout(() => navigate('/home'), 2000);
};

  const currentQuestion = surveyQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 via-pink-100 to-yellow-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🧠 Public Speaking Survey
        </h2>

        {!submitted ? (
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                className="mb-6 bg-blue-50 rounded-xl p-4 shadow"
              >
                <p className="font-semibold text-lg mb-3 text-blue-800">
                  {currentQuestion.question}
                </p>
                <div className="space-y-2">
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.question}
                        value={value}
                        onChange={() => handleChange(currentQuestion.question, value)}
                        checked={responses[currentQuestion.question] === value}
                        className="accent-blue-600"
                      />
                      {value}
                    </label>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={!responses[currentQuestion.question]}
                  className={`mt-4 w-full ${
                    responses[currentQuestion.question]
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white py-3 rounded-full font-semibold shadow-lg transition`}
                >
                  {currentQuestionIndex === surveyQuestions.length - 1 ? 'Submit' : 'Next'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-green-600 font-semibold text-center text-xl"
          >
            ✅ Thank you! Your response has been recorded.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default Survey;
