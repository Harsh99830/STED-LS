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
  const [userCode, setUserCode] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [projectConfig, setProjectConfig] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  // Load project configuration
  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      try {
        const userRef = ref(db, 'users/' + user.id + '/python');
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.val();
          const projectKey = userData.PythonCurrentProject || 'Project1';
          const config = await getProjectConfig(projectKey);
          setProjectConfig(config);
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
        let currentProject = 'Project1';
        if (user.PythonCurrentProject) {
          currentProject = user.PythonCurrentProject;
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

  const handleSubmit = () => {
    console.log('Submit button clicked!');
    console.log('Current terminal output:', terminalOutput);
    console.log('Current user code:', userCode);
    console.log('Project config:', projectConfig);
    
    if (!projectConfig) {
      console.error('No project configuration loaded');
      return;
    }
    
    // Debug: Check specific patterns in user code
    console.log('=== DEBUG: Code Pattern Detection ===');
    console.log('Has def show_menu:', userCode.includes('def show_menu'));
    console.log('Has print statements:', userCode.includes('print'));
    console.log('Has menu text:', userCode.includes('Personal Finance Tracker') || userCode.includes('Add Income') || userCode.includes('Add Expense'));
    console.log('Has while True:', userCode.includes('while True'));
    console.log('Has show_menu() call:', userCode.includes('show_menu()'));
    console.log('Has input_async:', userCode.includes('input_async'));
    console.log('Has else clause:', userCode.includes('else:'));
    console.log('Has invalid choice handling:', userCode.includes('Invalid choice') || userCode.includes('invalid') || userCode.includes('try again'));
    console.log('=== END DEBUG ===');
    
    // 1. Check code structure against expected code
    const missingComponents = validateCodeAgainstExpected(userCode, projectConfig);
    
    // 2. Check all tasks and subtasks
    const taskProgress = checkTasksAndSubtasks(userCode, projectConfig);
    
    // 3. Analyze terminal output
    const outputAnalysis = analyzeTerminalOutput(terminalOutput, projectConfig);
    
    // 4. Validate code logic and structure
    const logicValidation = validateCodeLogic(userCode, projectConfig);
    
    // Build comprehensive feedback
    let feedbackContent = `**📋 COMPREHENSIVE CODE REVIEW - ${projectConfig.title}**\n\n`;
    
    // Gaming detection section
    const allGamingIssues = Object.values(taskProgress)
      .filter(task => task.gamingIssues && task.gamingIssues.length > 0)
      .flatMap(task => task.gamingIssues);
    
    if (allGamingIssues.length > 0) {
      feedbackContent += `**🚨 GAMING DETECTION WARNINGS:**\n`;
      allGamingIssues.forEach(issue => {
        feedbackContent += `• ${issue}\n`;
      });
      feedbackContent += `\n`;
    }
    
    // Missing components section
    if (missingComponents.length > 0) {
      feedbackContent += `**❌ Missing Components:**\n${missingComponents.map(item => `• ${item}`).join('\n')}\n\n`;
    } else {
      feedbackContent += `**✅ All required components present**\n\n`;
    }
    
    // Logic validation section
    feedbackContent += `**🔍 Logic & Structure Analysis:**\n${logicValidation.feedback.join('\n')}\n\n`;
    
    // Task progress section
    feedbackContent += `**📊 Task Progress:**\n`;
    Object.entries(taskProgress).forEach(([taskKey, task]) => {
      const completed = task.completed.length;
      const total = task.subtasks.length;
      const percentage = Math.round((completed / total) * 100);
      const status = completed === total ? '✅' : '🔄';
      
      feedbackContent += `${status} ${task.title}: ${completed}/${total} (${percentage}%)\n`;
      
      if (completed < total) {
        const missingSubtasks = task.subtasks.filter(subtask => !task.completed.includes(subtask));
        feedbackContent += `   Missing: ${missingSubtasks.join(', ')}\n`;
      }
    });
    
    // Terminal output analysis
    feedbackContent += `\n**🖥️ Terminal Analysis:**\n${outputAnalysis.feedback.join('\n')}`;
    
    // Overall assessment - Much stricter now
    const allTasksComplete = Object.values(taskProgress).every(task => task.completed.length === task.subtasks.length);
    const allLogicValid = Object.entries(logicValidation)
      .filter(([key, value]) => typeof value === 'boolean')
      .every(([key, value]) => value);
    const allFunctionalityWorking = outputAnalysis.functionalityChecks ? 
      Object.values(outputAnalysis.functionalityChecks).every(check => check) : false;
    const noGamingAttempts = allGamingIssues.length === 0;
    
    const isFullyWorking = allTasksComplete && 
                          allLogicValid && 
                          outputAnalysis.isWorking && 
                          missingComponents.length === 0 &&
                          allFunctionalityWorking &&
                          noGamingAttempts;
    
    feedbackContent += `\n\n**🎯 Overall Status:** ${isFullyWorking ? '🎉 PROJECT COMPLETED!' : '🔄 Work in Progress'}`;
    
    if (!isFullyWorking) {
      feedbackContent += `\n\n**📝 To Complete:**`;
      if (!allTasksComplete) feedbackContent += `\n• Complete all tasks and subtasks`;
      if (!allLogicValid) feedbackContent += `\n• Fix logic and structure issues`;
      if (!outputAnalysis.isWorking) feedbackContent += `\n• Fix runtime errors`;
      if (missingComponents.length > 0) feedbackContent += `\n• Add missing components`;
      if (!allFunctionalityWorking) feedbackContent += `\n• Test all functionality`;
      if (!noGamingAttempts) feedbackContent += `\n• Fix gaming detection issues - write actual code, not just text`;
    }
    
    const submitMessage = {
      id: Date.now(),
      type: 'ai',
      content: feedbackContent,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, submitMessage]);
    setRightPanel('ai');
    
    // Show congratulations overlay if project is completed
    if (isFullyWorking) {
      setTimeout(() => {
        setShowCongratulationsOverlay(true);
      }, 1000);
    }
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

      {/* End Project Button */}
      <div className="absolute top-2 right-4">
        <button
          onClick={handleEndProjectClick}
          className="px-6 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
        >
          End Project
        </button>
      </div>

      {/* Submit Button */}
      <div className="absolute top-2 right-32">
        <button
          onClick={handleSubmit}
          className="px-6 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
        >
          Submit
        </button>
      </div>

      <div className="flex h-screen pt-12 p-3 bg-[#0F0F0F] w-screen">
          <div className="w-280 border border-white h-full text-white border-white">
        <CodeEditor onCodeChange={setUserCode} onStuckClick={handleStuckClick} onOutputChange={setTerminalOutput} />
        </div>
      {/* Left side - Code Editor */}
     

      {/* Right side - Statement / AI Panel */}
      <div className="w-150 h-full bg-zinc-700 text-white p-5 border border-white border-white">
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
            <Statement/>
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
