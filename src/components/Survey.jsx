import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, push } from 'firebase/database';

function Survey() {
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ✅ Fetch survey questions
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

  const handleSubmit = () => {
    const userResponseRef = ref(db, 'responses');
    push(userResponseRef, responses);
    setSubmitted(true);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧠 Psychological Survey</h2>
      {!submitted ? (
        <>
          {surveyQuestions.map((q, idx) => (
            <div key={idx} className="mb-6">
              <p className="font-semibold mb-2">{q.question}</p>
              <div className="space-y-2">
                {Object.entries(q.options).map(([key, value]) => (
                  <label key={key} className="block">
                    <input
                      type="radio"
                      name={q.question}
                      value={value}
                      onChange={() => handleChange(q.question, value)}
                      className="mr-2"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </>
      ) : (
        <p className="text-green-600 font-semibold">✅ Thank you! Your response has been recorded.</p>
      )}
    </div>
  );
}

export default Survey;
