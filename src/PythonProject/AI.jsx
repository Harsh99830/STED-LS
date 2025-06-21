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

  // Load project configuration
  useEffect(() => {
    // For now, hardcode to project1 - later this will come from user's current project
    const config = getProjectConfig('project1');
    setProjectConfig(config);
  }, []);

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
      // Prepare context for Gemini
      const context = {
        projectTitle: projectConfig?.title || 'Python Project',
        projectDescription: projectConfig?.description || '',
        projectTasks: projectConfig?.ProjectTasks || {},
        userCode: userCode || '',
        userQuestion: inputMessage
      };

      // Call Gemini API (you'll need to replace this with your actual API call)
      const response = await callGeminiAPI(context);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const getIncompleteTasks = (userCode) => {
    const incompleteTasks = [];
    
    // Check for show_menu function
    if (!userCode.includes('def show_menu()') && !userCode.includes('def show_menu(')) {
      incompleteTasks.push('Task1: Create Menu System');
    } else {
      // If show_menu exists, check if it's being used in a loop
      if (!userCode.includes('while True:') && !userCode.includes('while True')) {
        incompleteTasks.push('Task1: Create Menu System (need main loop)');
      }
    }
    
    // Only check for add_income if show_menu and main loop are complete
    if (userCode.includes('def show_menu(') && userCode.includes('while True')) {
      if (!userCode.includes('def add_income()') && !userCode.includes('def add_income(')) {
        incompleteTasks.push('Task2: Add Income Feature');
      }
    }
    
    // Only check for add_expense if previous tasks are complete
    if (userCode.includes('def show_menu(') && userCode.includes('while True') && 
        (userCode.includes('def add_income(') || userCode.includes('def add_income()'))) {
      if (!userCode.includes('def add_expense()') && !userCode.includes('def add_expense(')) {
        incompleteTasks.push('Task3: Add Expense Feature');
      }
    }
    
    // Only check for show_summary if previous tasks are complete
    if (userCode.includes('def show_menu(') && userCode.includes('while True') && 
        (userCode.includes('def add_income(') || userCode.includes('def add_income()')) &&
        (userCode.includes('def add_expense(') || userCode.includes('def add_expense()'))) {
      if (!userCode.includes('def show_summary(')) {
        incompleteTasks.push('Task4: View Balance Feature');
      }
    }
    
    return incompleteTasks;
  };

  const getCurrentTaskSubtasks = (userCode) => {
    // If show_menu exists but no main loop, focus on Task1 subtasks
    if (userCode.includes('def show_menu(') && !userCode.includes('while True')) {
      return [
        "1. Create a main loop with `while True:`",
        "2. Call `show_menu()` inside the loop",
        "3. Get user input with `choice = await input_async('Choose an option (1-4): ')`",
        "4. Add basic if/elif structure to handle choices"
      ];
    }
    
    // If main loop exists but no add_income, focus on Task2 subtasks
    if (userCode.includes('def show_menu(') && userCode.includes('while True') && 
        !userCode.includes('def add_income(')) {
      return [
        "1. Create `add_income()` function",
        "2. Use `input_async()` to get income amount",
        "3. Convert input to float with `float()`",
        "4. Return the amount"
      ];
    }
    
    // If add_income exists but no add_expense, focus on Task3 subtasks
    if (userCode.includes('def add_income(') && !userCode.includes('def add_expense(')) {
      return [
        "1. Create `add_expense()` function",
        "2. Get expense name with `input_async()`",
        "3. Get expense amount with `input_async()`",
        "4. Return a dictionary with name and amount"
      ];
    }
    
    // If add_expense exists but no show_summary, focus on Task4 subtasks
    if (userCode.includes('def add_expense(') && !userCode.includes('def show_summary(')) {
      return [
        "1. Create `show_summary()` function",
        "2. Calculate total income with `sum(incomes)`",
        "3. Calculate total expenses with `sum(item['amount'] for item in expenses)`",
        "4. Display the summary with formatted output"
      ];
    }
    
    return [];
  };

  const callGeminiAPI = async (context) => {
    const { projectTitle, projectDescription, userCode, userQuestion } = context;
    
    if (!projectConfig) {
      return "Sorry, I couldn't load the project configuration. Please try again.";
    }
    
    // Check if API key is available
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment variables');
      return "Sorry, the AI service is not properly configured. Please check your environment setup.";
    }
    
    try {
      // Get AI context from project config
      const aiContext = getAIContext(projectConfig, userCode, userQuestion);
      
      // Get current incomplete tasks and subtasks
      const incompleteTasks = getIncompleteTasks(userCode);
      const currentSubtasks = getCurrentTaskSubtasks(userCode);
      
      const prompt = `You are a helpful Python programming tutor. The user is working on a project called "${aiContext.projectTitle}".

Project Description: ${aiContext.projectDescription}

CURRENT INCOMPLETE TASK:
${incompleteTasks[0] || 'All tasks completed!'}

NEXT SUBTASKS TO COMPLETE:
${currentSubtasks.join('\n')}

COMPLETE PROJECT SOLUTION (for reference only - don't give this to the user):
\`\`\`python
${aiContext.expectedCode}
\`\`\`

User's Current Code:
\`\`\`python
${aiContext.userCode || 'No code written yet'}
\`\`\`

User's Question: ${aiContext.userQuestion}

IMPORTANT INSTRUCTIONS:
- IGNORE the "async def __main__():" and "await __main__()" wrapper code - this is just the editor setup
- Focus on the code inside the main function
- Give small, chat-like responses (2-3 sentences max)
- Be encouraging and helpful
- Don't tell them to remove the async wrapper
- Give specific, actionable hints for their current step
- DO NOT provide complete code solutions
- You can show syntax examples like: "Use def function_name(): to create a function"
- Give hints that guide them to figure it out themselves
- If they ask for syntax, show the basic structure but not the full implementation
- Use the complete project solution above to understand what they're building and give accurate hints
- Compare their current code with the solution to see what they're missing or need help with
- FOCUS ONLY ON THE CURRENT INCOMPLETE TASK - don't jump ahead to future tasks
- Give hints for the specific subtasks listed above
- If they ask about future tasks, redirect them to complete the current task first
- NEVER suggest functions or features that are not in the project requirements
- ONLY give hints about the tasks and subtasks defined in the project

Keep your response short, friendly, and focused on the current incomplete task only.`;

      console.log('Sending prompt to Gemini:', prompt);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback to local hints if API fails
      return `I understand you're working on the **${aiContext.projectTitle}** project. 

**Project Context:**
${aiContext.projectDescription}

**Your Current Code:**
\`\`\`python
${aiContext.userCode || 'No code written yet'}
\`\`\`

**Based on your question: "${aiContext.userQuestion}"**

${aiContext.aiPrompts?.fallbackHint || "💡 **Hint**: Take it step by step! Break down your problem into smaller parts."}`;
    }
  };

  const generateContextualHint = (question, tasks, userCode) => {
    const lowerQuestion = question.toLowerCase();
    
    // Check if user is asking about specific tasks
    const taskKeywords = {
      'menu': 'Task1',
      'function': 'Task1',
      'add': 'Task2',
      'view': 'Task3',
      'remove': 'Task4',
      'input': 'Task2',
      'loop': 'Task1',
      'while': 'Task1'
    };
    
    for (const [keyword, taskKey] of Object.entries(taskKeywords)) {
      if (lowerQuestion.includes(keyword) && tasks[taskKey]) {
        return `💡 **Task-Specific Hint**: You're working on **${tasks[taskKey].title}**. Here's what you need to do:

${Object.entries(tasks[taskKey])
  .filter(([k]) => k !== 'title')
  .map(([k, v]) => `${k}. ${v}`)
  .join('\n')}

**Code Suggestion**: ${getCodeSuggestion(keyword, userCode)}`;
      }
    }
    
    // General hints based on question content
    if (lowerQuestion.includes('function') || lowerQuestion.includes('def')) {
      return "💡 **Hint**: Remember to use the `def` keyword to define functions. Functions should have a clear purpose and descriptive names. Don't forget to call your functions after defining them!";
    }
    
    if (lowerQuestion.includes('loop') || lowerQuestion.includes('while') || lowerQuestion.includes('for')) {
      return "💡 **Hint**: Loops help you repeat code. Use `while` for indefinite loops and `for` for iterating over sequences. Make sure you have a way to exit the loop!";
    }
    
    if (lowerQuestion.includes('list') || lowerQuestion.includes('array')) {
      return "💡 **Hint**: Lists in Python use square brackets `[]`. You can add items with `.append()`, access them by index, and loop through them easily.";
    }
    
    if (lowerQuestion.includes('dictionary') || lowerQuestion.includes('dict')) {
      return "💡 **Hint**: Dictionaries use curly braces `{}` and store key-value pairs. They're great for organizing related data!";
    }
    
    if (lowerQuestion.includes('input') || lowerQuestion.includes('user')) {
      return "💡 **Hint**: Use `input()` to get user input. Remember to convert strings to numbers if needed using `int()` or `float()`.";
    }
    
    return "💡 **Hint**: Take it step by step! Break down your problem into smaller parts. What's the first thing you need to do?";
  };

  const getCodeSuggestion = (keyword, userCode) => {
    const suggestions = {
      'menu': 'Create a function like `def show_menu():` that displays options to the user',
      'function': 'Use `def function_name():` to define a new function',
      'add': 'Create a function that uses `input_async()` to get data and adds it to a list',
      'view': 'Loop through your list and display each item with numbering',
      'remove': 'Ask user for an index and use `list.pop(index)` or `del list[index]`',
      'input': 'Use `user_input = await input_async("Enter something: ")` to get user data',
      'loop': 'Use `while True:` for infinite loops or `for item in list:` for iteration',
      'while': 'Use `while condition:` to repeat code while a condition is true'
    };
    
    return suggestions[keyword] || 'Think about what data structure you need and how to manipulate it.';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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