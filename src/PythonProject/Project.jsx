import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import Statement from './Statement';
import AI from './AI';
import { useUser } from '@clerk/clerk-react';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  getProjectConfig, 
  validateCodeAgainstExpected, 
  checkTasksAndSubtasks, 
  analyzeTerminalOutput, 
  validateCodeLogic 
} from './projectConfig';

function Project() {
  const [rightPanel, setRightPanel] = useState('statement');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showEndProjectOverlay, setShowEndProjectOverlay] = useState(false);
  const [showCongratulationsOverlay, setShowCongratulationsOverlay] = useState(false);
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState('');
  const [userCode, setUserCode] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [projectConfig, setProjectConfig] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const [taskCheckResults, setTaskCheckResults] = useState([]);
  const [checkingTaskIndex, setCheckingTaskIndex] = useState(-1);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [subtaskCheckResults, setSubtaskCheckResults] = useState({});

  // Load project configuration
  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      try {
        const userRef = ref(db, 'users/' + user.id + '/python');
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.val();
          const projectKey = userData.PythonCurrentProject;
          if (projectKey) {
            const config = await getProjectConfig(projectKey);
            setProjectConfig(config);
          }
        }
      } catch (err) {
        setProjectConfig(null);
      }
    };
    fetchConfig();
  }, [user]);

  // Handle browser back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      e.preventDefault();
      setShowEndProjectOverlay(true);
      // Push a new state to prevent the back navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Push a state when component mounts to enable popstate detection
    window.history.pushState(null, '', window.location.pathname);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleEndProjectClick = () => {
    setShowEndProjectOverlay(true);
  };

  const handleEndProjectConfirm = async () => {
    try {
      if (user) {
        const userRef = ref(db, 'users/' + user.id);
        const updates = {
          'python/PythonProjectStarted': false
        };
        await update(userRef, updates);
      }
      console.log('Project ended');
      setShowEndProjectOverlay(false);
      navigate('/python');
    } catch (err) {
      console.error('Failed to end project:', err);
      setShowEndProjectOverlay(false);
      navigate('/python');
    }
  };

  const handleEndProjectCancel = () => {
    setShowEndProjectOverlay(false);
  };

  const handleCongratulationsSubmit = async () => {
    try {
      if (user) {
        const userRef = ref(db, 'users/' + user.id);
        // Determine current project number from PythonCurrentProject or fallback to Project1
        const userPythonRef = ref(db, 'users/' + user.id + '/python');
        const userPythonSnap = await get(userPythonRef);
        let currentProject = 'Project1'; // fallback
        if (userPythonSnap.exists()) {
          const userPythonData = userPythonSnap.val();
          currentProject = userPythonData.PythonCurrentProject || 'Project1';
        }
        // Save project data
        const projectData = {
          code: userCode,
          chatHistory: chatMessages,
          completedAt: new Date().toISOString(),
          projectType: projectConfig?.title || 'Personal Finance Tracker',
          terminalOutput: terminalOutput
        };
        // Determine next project
        let nextProject = null;
        if (currentProject === 'Project1') nextProject = 'Project2';
        else if (currentProject === 'Project2') nextProject = 'Project3';
        // Add more as needed
        const updates = {
          [`python/${currentProject}`]: projectData,
          'python/PythonProjectStarted': false
        };
        if (nextProject) {
          updates['python/PythonCurrentProject'] = nextProject;
        }
        await update(userRef, updates);
      }
      console.log('Project submitted successfully');
      setShowCongratulationsOverlay(false);
      navigate('/python');
    } catch (err) {
      console.error('Failed to submit project:', err);
      setShowCongratulationsOverlay(false);
      navigate('/python');
    }
  };

  const handleCongratulationsClose = () => {
    setShowCongratulationsOverlay(false);
  };

  const handleSubmit = async () => {
    if (!projectConfig) return;
    setShowSubmitOverlay(true);
    setTaskCheckResults([]);
    setCheckingTaskIndex(0);
    setSubtaskCheckResults({});
    const tasks = Object.entries(projectConfig.tasks || {});
    let results = [];
    for (let i = 0; i < tasks.length; i++) {
      setCheckingTaskIndex(i);
      const [taskKey, task] = tasks[i];
      const subtaskResults = [];
      for (let j = 0; j < (task.subtasks || []).length; j++) {
        const subtask = task.subtasks[j];
        const prompt = `User's Code:\n\n${userCode}\n\nSubtask: ${subtask}\n\nIs this subtask clearly implemented in the user's code? Respond only with true or false.`;
        let isSubtaskComplete = false;
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const model = 'gemini-1.5-flash';
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          let answer = '';
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            answer = data.candidates[0].content.parts[0].text.trim().toLowerCase();
          }
          const normalized = answer.replace(/[^a-z]/g, '');
          if (normalized.startsWith('true')) isSubtaskComplete = true;
          else if (normalized.startsWith('false')) isSubtaskComplete = false;
        } catch (e) {
          // On error, treat as not complete
        }
        subtaskResults.push({ subtask, complete: isSubtaskComplete });
        // Update subtasks UI as each result comes in
        setSubtaskCheckResults(prev => ({
          ...prev,
          [taskKey]: [...subtaskResults]
        }));
      }
      // Mark task as complete only if all subtasks are complete
      const isTaskComplete = subtaskResults.length > 0 && subtaskResults.every(r => r.complete);
      results.push({ taskTitle: task.title, complete: isTaskComplete });
      setTaskCheckResults([...results]);
    }
    setCheckingTaskIndex(-1);
  };

  const handleStuckClick = () => {
    // Switch to AI tab
    setRightPanel('ai');
    
    // Add a message asking where they're stuck
    const stuckMessage = {
      id: Date.now(),
      type: 'ai',
      content: "I see you're stuck! 🤔 Where exactly are you having trouble?",
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, stuckMessage]);
  };

  const handleTaskClick = async (taskKey, task) => {
    setExpandedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }));
    // Only check subtasks if not already checked
    if (!subtaskCheckResults[taskKey] && task.subtasks && task.subtasks.length > 0) {
      const results = [];
      for (let i = 0; i < task.subtasks.length; i++) {
        const subtask = task.subtasks[i];
        const prompt = `User's Code:\n\n${userCode}\n\nSubtask: ${subtask}\n\nIs this subtask clearly implemented in the user's code? Respond only with true or false.`;
        let isComplete = false;
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const model = 'gemini-1.5-flash';
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          let answer = '';
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            answer = data.candidates[0].content.parts[0].text.trim().toLowerCase();
          }
          const normalized = answer.replace(/[^a-z]/g, '');
          if (normalized.startsWith('true')) isComplete = true;
          else if (normalized.startsWith('false')) isComplete = false;
        } catch (e) {
          // On error, treat as not complete
        }
        results.push({ subtask, complete: isComplete });
      }
      setSubtaskCheckResults(prev => ({ ...prev, [taskKey]: results }));
    }
  };

  return (
      <>
      {/* End Project Confirmation Overlay */}
      {showEndProjectOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            minWidth: '320px',
            textAlign: 'center',
            boxShadow: '0 2px 16px #0003'
          }}>
            <h2 className="text-xl font-semibold mb-4">End Project?</h2>
            <p className="mb-4">Do you want to end this project?</p>
            <div className="flex gap-4 justify-center mt-4">
              <button 
                onClick={handleEndProjectConfirm} 
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                Yes, End Project
              </button>
              <button 
                onClick={handleEndProjectCancel} 
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Congratulations Overlay */}
      {showCongratulationsOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            borderRadius: '20px',
            minWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            color: 'white',
            animation: 'fadeInScale 0.5s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl mb-6">You've successfully completed the Personal Finance Tracker project!</p>
            <p className="text-lg mb-8">All requirements have been met and your code is working perfectly.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleCongratulationsSubmit} 
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold text-lg transition-colors"
              >
                Submit Project
              </button>
              <button 
                onClick={handleCongratulationsClose} 
                className="bg-white text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors"
              >
                Continue Working
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Feedback Overlay */}
      {showSubmitOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10,10,20,0.96)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
        }}>
          <div style={{
            background: '#18181b',
            padding: '36px 32px',
            borderRadius: '18px',
            minWidth: '400px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            color: '#f3f4f6',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            border: '1.5px solid #764ba2',
          }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#a78bfa', letterSpacing: 1 }}>Submission Review</h2>
            <div style={{ fontSize: 18 }}>
              {Object.entries(projectConfig.tasks || {}).map(([taskKey, task], idx) => (
                <div key={taskKey} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#23232a',
                  borderRadius: 10,
                  padding: '16px 20px',
                  marginBottom: 18,
                  border: '1.5px solid #312e81',
                  boxShadow: '0 2px 8px #0002',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                  onClick={() => handleTaskClick(taskKey, task)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: 17 }}>{task.title}</span>
                    {taskCheckResults[idx] ? (
                      taskCheckResults[idx].complete ? (
                        <span style={{ color: '#22c55e', fontSize: 28, fontWeight: 700 }}>✔</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: 28, fontWeight: 700 }}>✖</span>
                      )
                    ) : (
                      idx === checkingTaskIndex ? (
                        <span className="animate-spin" style={{ color: '#a78bfa', fontSize: 26 }}>⏳</span>
                      ) : (
                        <span style={{ color: '#444', fontSize: 28, fontWeight: 700 }}>?</span>
                      )
                    )}
                  </div>
                  {expandedTasks[taskKey] && task.subtasks && (
                    <ul className="mt-4 space-y-2">
                      {(subtaskCheckResults[taskKey] || task.subtasks.map(subtask => ({ subtask, complete: null }))).map((result, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#18181b', borderRadius: 6, padding: '8px 14px' }}>
                          <span style={{ color: '#f3f4f6', fontSize: 15 }}>{result.subtask}</span>
                          {result.complete === true ? (
                            <span style={{ color: '#22c55e', fontSize: 22, fontWeight: 700 }}>✔</span>
                          ) : result.complete === false ? (
                            <span style={{ color: '#ef4444', fontSize: 22, fontWeight: 700 }}>✖</span>
                          ) : (
                            <span style={{ color: '#a1a1aa', fontSize: 22 }}>⏳</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowSubmitOverlay(false)}
                className="px-7 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Project & Submit Buttons */}
      <div style={{ position: 'absolute', top: 12, right: 24, display: 'flex', gap: 8, zIndex: 100 }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '4px 14px',
            background: '#22c55e',
            color: 'white',
            fontWeight: 600,
            fontSize: 13,
            border: '1px solid #15803d',
            borderRadius: 6,
            boxShadow: '0 1px 4px #0004',
            transition: 'background 0.2s',
            minWidth: 0,
            minHeight: 0,
            lineHeight: '1.2',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        <button
          onClick={handleEndProjectClick}
          style={{
            padding: '4px 14px',
            background: '#ef4444',
            color: 'white',
            fontWeight: 600,
            fontSize: 13,
            border: '1px solid #991b1b',
            borderRadius: 6,
            boxShadow: '0 1px 4px #0004',
            transition: 'background 0.2s',
            minWidth: 0,
            minHeight: 0,
            lineHeight: '1.2',
            cursor: 'pointer',
          }}
        >
          End Project
        </button>
      </div>

      <div className="flex h-screen pt-12 p-3 bg-[#0F0F0F] w-screen">
          <div className="w-280 border border-white h-full text-white border-white">
        <CodeEditor onCodeChange={setUserCode} onStuckClick={handleStuckClick} onOutputChange={setTerminalOutput} />
        </div>
      {/* Left side - Code Editor */}
     

      {/* Right side - Statement / AI Panel */}
      <div className="w-150 h-full text-white p-5 border border-white border-white"
      style={{"backgroundColor":"rgb(24, 24, 27)"}}
      >
        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setRightPanel('statement')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              rightPanel === 'statement'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-600 hover:bg-zinc-500'
            }`}
            disabled={isExplaining}
          >
            Statement
          </button>
          <button
            onClick={() => setRightPanel('ai')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              rightPanel === 'ai'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-600 hover:bg-zinc-500'
            }`}
            disabled={isExplaining}
          >
            AI
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-2">
          {rightPanel === 'statement' && (
            <Statement userCode={userCode} projectConfig={projectConfig} />
          )}

          {rightPanel === 'ai' && (
            <AI userCode={userCode} messages={chatMessages} setMessages={setChatMessages} />
          )}
        </div>
      </div>
        </div>
        </>
  );
}

export default Project;
