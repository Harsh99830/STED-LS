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
  const inputRef = useRef(null);

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
      // Build conversation history (last 6 messages)
      const history = messages.slice(-6).map(
        m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n');
      // Build a list of all tasks and subtasks
      let allTasksText = '';
      if (projectConfig && projectConfig.tasks) {
        allTasksText = Object.entries(projectConfig.tasks).map(
          ([taskKey, task], idx) => {
            const subtasks = (task.subtasks || []).map((s, i) => `    ${i + 1}. ${s}`).join('\n');
            return `${idx + 1}. ${task.title}${subtasks ? '\n' + subtasks : ''}`;
          }
        ).join('\n');
      }
      const prompt = `You are a helpful Python programming tutor. The user is working on a project called "${context.projectTitle}".\n\nProject Description: ${context.projectDescription}\n\nALL TASKS AND SUBTASKS:\n${allTasksText}\n\nUser's Current Code:\n\u0060\u0060\u0060python\n${context.userCode || 'No code written yet'}\n\u0060\u0060\u0060\n\nConversation so far:\n${history}\n\nUser's latest question: ${inputMessage}\n\nIMPORTANT INSTRUCTIONS:\n- Look at the user's code and guess which task and subtask the user is currently working on.\n- Respond ONLY to the user's latest question, and help them with their current task/subtask.\n- Do not provide extra information or answer unasked questions.\n- Give small, chat-like responses (2-3 sentences max)\n- Focus on actionable, specific feedback for the user's code and question\n- Avoid generic encouragements like "Great start" or "Good job" unless the user has completed all tasks\n- DO NOT provide complete code solutions\n- Give hints for the current task/subtask only\n- ONLY give hints about the tasks and subtasks defined in the project\n- If all tasks are complete, congratulate the user and offer to review or answer questions.`;
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

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
      <div className="p-3 border-t text-left border-gray-700">
        <div className="flex space-x-2 items-end">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={e => {
              setInputMessage(e.target.value);
              // Auto-resize
              if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your project..."
            className="flex-1 bg-gray-800 text-left text-white"
            style={{
              borderRadius: 6,
              padding: '7px 10px',
              fontSize: 14,
              minHeight: 40,
              maxHeight: 120,
              resize: 'none',
              lineHeight: 1.3,
              outline: 'none',
              border: '1px solid #444',
              overflow: 'hidden',
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              background: '#a78bfa',
              color: 'white',
              padding: '6px 14px',
              fontSize: 14,
              borderRadius: 6,
              fontWeight: 600,
              minHeight: 40,
              minWidth: 0,
              border: 'none',
              transition: 'background 0.2s',
              cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!inputMessage.trim() || isLoading) ? 0.7 : 1,
            }}
            className="transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AI;