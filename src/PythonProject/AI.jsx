import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { getProjectConfig, getAIContext } from './projectConfig';

function AI({ userCode, messages, setMessages }) {
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectConfig, setProjectConfig] = useState(null);
  const messagesEndRef = useRef(null);
  const [taskCheckStatus, setTaskCheckStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalSubtasks, setModalSubtasks] = useState([]);

  // Fetch project data when component mounts
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user) return;
      
      try {
        // Get user's current project
        const userRef = ref(db, 'users/' + user.id + '/python');
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.val();
          const projectKey = userData.PythonCurrentProject;
          
          if (projectKey) {
            // Get project data
            const projectRef = ref(db, 'PythonProject/' + projectKey);
            const projectSnap = await get(projectRef);
            if (projectSnap.exists()) {
              setProjectConfig(projectSnap.val());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message only if no messages exist
  useEffect(() => {
    if (projectConfig && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hi! I'm here to help you with your **${projectConfig.title}** project.  What would you like help with?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [projectConfig, messages.length, setMessages]);

  // Generic: find first incomplete task and subtasks
  const getIncompleteTaskAndSubtasks = () => {
    if (!projectConfig || !projectConfig.tasks) return {};
    const userCodeLower = (userCode || '').toLowerCase();
    for (const [taskKey, task] of Object.entries(projectConfig.tasks)) {
      const allSubtasks = task.subtasks || [];
      // Consider a subtask complete if any keyword from codeChecks is present in user code
      const completed = (task.codeChecks || []).filter(check => 
        userCodeLower.includes(check.toLowerCase().replace(/[`'"().:]/g, ''))
      );
      if (completed.length < (task.codeChecks ? task.codeChecks.length : allSubtasks.length)) {
        return {
          taskTitle: task.title,
          subtasks: allSubtasks.filter((_, idx) => !(completed.includes((task.codeChecks||[])[idx])))
        };
      }
    }
    return {};
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const context = getAIContext(projectConfig, userCode, inputMessage);
      const { taskTitle, subtasks } = getIncompleteTaskAndSubtasks();
      const prompt = `You are a helpful Python programming tutor. The user is working on a project called "${context.projectTitle}".\n\nProject Description: ${context.projectDescription}\n\nCURRENT INCOMPLETE TASK: ${taskTitle || 'All tasks completed!'}\nNEXT SUBTASKS TO COMPLETE:\n${subtasks && subtasks.length ? subtasks.map((s, i) => `${i+1}. ${s}`).join('\n') : 'None'}\n\nUser's Current Code:\n\`\`\`python\n${context.userCode || 'No code written yet'}\n\`\`\`\n\nUser's Question: ${context.userQuestion}\n\nIMPORTANT INSTRUCTIONS:\n- Give small, chat-like responses (2-3 sentences max)\n- Be encouraging and helpful\n- DO NOT provide complete code solutions\n- Give hints for the current incomplete task/subtasks only\n- ONLY give hints about the tasks and subtasks defined in the project\n- If all tasks are complete, congratulate the user and offer to review or answer questions.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      let aiText = 'Sorry, I encountered an error. Please try again.';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        aiText = data.candidates[0].content.parts[0].text;
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', content: aiText, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeUserCode = (code) => {
    if (!code || code.trim() === '') {
      return "You haven't written any code yet. Start by creating the basic structure!";
    }

    const analysis = [];
    
    if (code.includes('def ')) {
      analysis.push("✅ You have functions defined");
    } else {
      analysis.push("⚠️ No functions found - you'll need to create functions for this project");
    }
    
    if (code.includes('input_async(') || code.includes('input(')) {
      analysis.push("✅ You're getting user input");
    }
    
    if (code.includes('while ') || code.includes('for ')) {
      analysis.push("✅ You have loops in your code");
    }
    
    if (code.includes('[') && code.includes(']')) {
      analysis.push("✅ You're using lists");
    }
    
    if (code.includes('{') && code.includes('}')) {
      analysis.push("✅ You're using dictionaries");
    }
    
    if (code.includes('if ') || code.includes('elif ') || code.includes('else:')) {
      analysis.push("✅ You have conditional statements");
    }
    
    return analysis.length > 0 ? analysis.join('\n') : "Your code looks good! Keep going!";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTaskCheck = (taskKey) => {
    if (!projectConfig || !projectConfig.tasks) return;
    const task = projectConfig.tasks[taskKey];
    const userCodeLower = (userCode || '').toLowerCase();
    const completed = (task.codeChecks || []).filter(check =>
      userCodeLower.includes(check.toLowerCase().replace(/[`'"().:]/g, ''))
    );
    const allComplete = completed.length === (task.codeChecks ? task.codeChecks.length : (task.subtasks ? task.subtasks.length : 0));
    if (allComplete) {
      setTaskCheckStatus(prev => ({ ...prev, [taskKey]: true }));
    } else {
      // Find incomplete subtasks
      const incomplete = (task.subtasks || []).filter((_, idx) => !(completed.includes((task.codeChecks||[])[idx])));
      setModalSubtasks(incomplete);
      setTaskCheckStatus(prev => ({ ...prev, [taskKey]: false }));
      setShowModal(true);
    }
  };

  // Helper to provide what to do for a subtask
  const getSubtaskHelp = (subtask) => {
    // You can customize this mapping for more detailed help per subtask
    if (subtask.toLowerCase().includes('function')) return 'Write the required function definition in your code.';
    if (subtask.toLowerCase().includes('input')) return 'Use input_async() or input() to get user input.';
    if (subtask.toLowerCase().includes('print')) return 'Use print() to display output.';
    if (subtask.toLowerCase().includes('loop')) return 'Implement a while or for loop as needed.';
    if (subtask.toLowerCase().includes('list')) return 'Initialize and use a list as described.';
    if (subtask.toLowerCase().includes('dictionary')) return 'Use a dictionary to store data as needed.';
    if (subtask.toLowerCase().includes('return')) return 'Make sure to return the required value from your function.';
    if (subtask.toLowerCase().includes('summary')) return 'Display the summary as described.';
    return 'Check the project instructions for this subtask.';
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white h-155">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-purple-400">🤖 AI Assistant</h2>
        <p className="text-sm text-gray-400 mt-1">
          {projectConfig ? `Helping with: ${projectConfig.title}` : 'Loading project...'}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 text-left space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t text-left border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your project..."
            className="flex-1 bg-gray-800 text-left text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AI;