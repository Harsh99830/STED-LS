import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

function Survey() {
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const checkIfAlreadySubmitted = async () => {
      if (isLoaded && isSignedIn && user) {
        const userId = user.id;
        const responseRef = ref(db, `users/${userId}/responses`);

        onValue(responseRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            navigate('/home');
          }
        });
      }
    };

    checkIfAlreadySubmitted();
  }, [isLoaded, isSignedIn, user, navigate]);

  useEffect(() => {
    if (isSignedIn && user) {
      const name = user.fullName || user.firstName || "Anonymous";
      const email = user.primaryEmailAddress?.emailAddress || "no-email@example.com";
      const userId = user.id;

      const userRef = ref(db, `users/${userId}`);
      set(userRef, {
        name,
        email,
        currentTask: "task1",
        xp: 0,
        level: 1,
        tasksCompleted: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl" />

      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden"
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-blue-500/20 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-blue-500/20 rounded-br-3xl" />

          {!submitted ? (
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                      Question {currentQuestionIndex + 1} of {surveyQuestions.length}
                    </span>
                    <div className="flex-1 mx-4">
                      <motion.div
                        className="h-2 bg-slate-100 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{
                          width: '100%'
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${((currentQuestionIndex + 1) / surveyQuestions.length) * 100}%`
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-8 shadow-inner">
                    <h3 className="text-3xl font-bold text-slate-800 mb-8 leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <motion.label
                          key={key}
                          whileHover={{ scale: 1.02, translateX: 8 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            responses[currentQuestion.question] === value
                              ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg'
                              : 'bg-white hover:bg-white/80 shadow-md'
                          }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.question}
                            value={value}
                            onChange={() => handleChange(currentQuestion.question, value)}
                            checked={responses[currentQuestion.question] === value}
                            className="hidden"
                          />
                          <span className="ml-3 text-lg">{value}</span>
                          {responses[currentQuestion.question] === value && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto text-xl"
                            >
                              ✨
                            </motion.span>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!responses[currentQuestion.question]}
                    className={`w-full ${
                      responses[currentQuestion.question]
                        ? 'bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500'
                        : 'bg-slate-200 cursor-not-allowed'
                    } text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 text-lg`}
                  >
                    {currentQuestionIndex === surveyQuestions.length - 1 ? 'Submit Survey' : 'Next Question'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
                className="w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl"
              >
                <span className="text-5xl">✨</span>
              </motion.div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 mb-4">
                Thank you for completing the survey!
              </h3>
              <p className="text-slate-600 text-lg">
                Redirecting you to your personalized dashboard...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600" />
    </div>
  );
}

export default Survey;
