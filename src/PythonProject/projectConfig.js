// import project1Config from './Project1.json';
import { getDatabase, ref, get } from 'firebase/database';

// Project configurations mapping (no longer needed for dynamic fetch)
// const projectConfigs = {
//   'project1': project1Config,
// };

// Load project configuration from Firebase
export const getProjectConfig = async (projectId) => {
  const db = getDatabase();
  // Capitalize first letter for Firebase path
  const projectKey = projectId.charAt(0).toUpperCase() + projectId.slice(1);
  const projectRef = ref(db, `PythonProject/${projectKey}`);
  const snapshot = await get(projectRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Generic validation functions that work with any project config
export const validateCodeAgainstExpected = (userCode, config) => {
  if (!config || !config.validationRules) return [];
  
  const missing = [];
  const userCodeClean = userCode.replace(/\s+/g, ' ').toLowerCase();
  
  // Check required components with flexible input detection
  config.validationRules.requiredComponents.forEach(component => {
    const componentLower = component.toLowerCase();
    let found = false;
    
    // Special handling for input detection
    if (componentLower === 'input(') {
      found = userCodeClean.includes('input(') || userCodeClean.includes('input_async(');
    } else {
      found = userCodeClean.includes(componentLower);
    }
    
    if (!found) {
      missing.push(component);
    }
  });
  
  return missing;
};

// Anti-gaming detection function
export const detectGamingAttempts = (userCode) => {
  const userCodeClean = userCode.replace(/\s+/g, ' ').toLowerCase();
  const issues = [];
  
  // Check for suspicious text-only implementations
  const suspiciousPatterns = [
    'marked completed',
    'task completed', 
    'completed successfully',
    'done',
    'finished',
    'implemented',
    'working',
    'functional'
  ];
  
  const hasSuspiciousText = suspiciousPatterns.some(pattern => 
    userCodeClean.includes(pattern) && 
    !userCodeClean.includes('print') && 
    !userCodeClean.includes('def') &&
    !userCodeClean.includes('if') &&
    !userCodeClean.includes('while') &&
    !userCodeClean.includes('for')
  );
  
  if (hasSuspiciousText) {
    issues.push('⚠️ Detected text-only implementation attempt. Please write actual code instead of just describing what should happen.');
  }
  
  // Check for code patterns that are just strings
  const codePatterns = [
    'input(',
    'def show_menu',
    'while true',
    'append(',
    'pop(',
    'enumerate',
    't["completed"] = true'
  ];
  
  codePatterns.forEach(pattern => {
    if (userCodeClean.includes(`"${pattern}"`) || userCodeClean.includes(`'${pattern}'`)) {
      issues.push(`⚠️ Found "${pattern}" as a string instead of actual code. Please implement the functionality, not just write it as text.`);
    }
  });
  
  // Check for minimal code that doesn't actually do anything
  const lines = userCode.split('\n').filter(line => line.trim().length > 0);
  const codeLines = lines.filter(line => 
    !line.trim().startsWith('#') && 
    !line.trim().startsWith('"""') &&
    !line.trim().startsWith("'''") &&
    line.trim().length > 0
  );
  
  if (codeLines.length < 5) {
    issues.push('⚠️ Very minimal code detected. Make sure you\'re implementing the full functionality, not just placeholder code.');
  }
  
  // Check for excessive comments vs actual code
  const commentLines = lines.filter(line => 
    line.trim().startsWith('#') || 
    line.trim().startsWith('"""') ||
    line.trim().startsWith("'''")
  );
  
  if (commentLines.length > codeLines.length) {
    issues.push('⚠️ Too many comments compared to actual code. Focus on implementing the functionality.');
  }
  
  return issues;
};

export const checkTasksAndSubtasks = (userCode, config) => {
  if (!config || !config.tasks) return {};
  
  const tasks = {};
  const userCodeClean = userCode.replace(/\s+/g, ' ').toLowerCase();
  
  // Debug: Log the cleaned user code
  console.log('=== DEBUG: User Code Analysis ===');
  console.log('Cleaned user code:', userCodeClean);
  
  // Check for gaming attempts
  const gamingIssues = detectGamingAttempts(userCode);
  if (gamingIssues.length > 0) {
    console.log('=== GAMING DETECTION ===');
    gamingIssues.forEach(issue => console.log(issue));
    console.log('=== END GAMING DETECTION ===');
  }
  
  Object.entries(config.tasks).forEach(([taskKey, task]) => {
    tasks[taskKey] = {
      title: task.title,
      subtasks: task.subtasks,
      completed: [],
      gamingIssues: gamingIssues // Include gaming issues in task results
    };
    
    console.log(`\n--- Checking ${taskKey}: ${task.title} ---`);
    console.log(`  Subtasks:`, task.subtasks);
    console.log(`  Code checks:`, task.codeChecks);
    
    // Generic task validation using codeChecks
    if (task.codeChecks) {
      task.codeChecks.forEach(check => {
        const checkLower = check.toLowerCase();
        let found = false;
        
        // Enhanced validation with anti-gaming checks
        if (checkLower === 'input(') {
          found = (userCodeClean.includes('input(') || userCodeClean.includes('input_async(')) &&
                  !userCodeClean.includes('"input(') && // Not just a string
                  !userCodeClean.includes("'input(");   // Not just a string
        } else if (checkLower === 'def show_menu') {
          found = (userCodeClean.includes('def show_menu') || userCodeClean.includes('async def show_menu')) &&
                  !userCodeClean.includes('"def show_menu') && // Not just a string
                  !userCodeClean.includes("'def show_menu");   // Not just a string
        } else if (checkLower === 'while true') {
          found = (userCodeClean.includes('while true') || userCodeClean.includes('while true:')) &&
                  !userCodeClean.includes('"while true') && // Not just a string
                  !userCodeClean.includes("'while true");   // Not just a string
        } else if (checkLower === 'append(') {
          found = (userCodeClean.includes('append(') || userCodeClean.includes('tasks.append')) &&
                  !userCodeClean.includes('"append(') && // Not just a string
                  !userCodeClean.includes("'append(");   // Not just a string
        } else if (checkLower === 'pop(' || checkLower === 'tasks.pop') {
          found = (userCodeClean.includes('pop(') || userCodeClean.includes('tasks.pop')) &&
                  !userCodeClean.includes('"pop(') && // Not just a string
                  !userCodeClean.includes("'pop(");   // Not just a string
        } else if (checkLower === 'for idx, t in enumerate' || checkLower.includes('enumerate')) {
          found = (userCodeClean.includes('for idx, t in enumerate') || userCodeClean.includes('enumerate(tasks')) &&
                  !userCodeClean.includes('"for idx, t in enumerate') && // Not just a string
                  !userCodeClean.includes("'for idx, t in enumerate");   // Not just a string
        } else if (checkLower === 't["completed"] = true') {
          found = (userCodeClean.includes('t["completed"] = true') || 
                  userCodeClean.includes('t[\'completed\'] = true') || 
                  userCodeClean.includes('completed"] = true')) &&
                  !userCodeClean.includes('"t["completed"] = true') && // Not just a string
                  !userCodeClean.includes("'t['completed'] = true");   // Not just a string
        } else if (checkLower.includes('task added')) {
          // For confirmation messages, we need to see them in print statements or actual output
          found = (userCodeClean.includes('task added') || 
                  userCodeClean.includes('✅ task added') ||
                  userCodeClean.includes('task added.') ||
                  userCodeClean.includes('✅ task added.')) &&
                  (userCodeClean.includes('print') || userCodeClean.includes('f"') || userCodeClean.includes('f\''));
        } else if (checkLower.includes('task marked as completed')) {
          // For confirmation messages, we need to see them in print statements or actual output
          found = (userCodeClean.includes('task marked as completed') || 
                  userCodeClean.includes('✅ task marked as completed') ||
                  userCodeClean.includes('task marked as completed.') ||
                  userCodeClean.includes('✅ task marked as completed.')) &&
                  (userCodeClean.includes('print') || userCodeClean.includes('f"') || userCodeClean.includes('f\''));
        } else if (checkLower.includes('task deleted')) {
          // For confirmation messages, we need to see them in print statements or actual output
          found = (userCodeClean.includes('task deleted') || 
                  userCodeClean.includes('🗑️ task deleted') ||
                  userCodeClean.includes('task deleted.') ||
                  userCodeClean.includes('🗑️ task deleted.')) &&
                  (userCodeClean.includes('print') || userCodeClean.includes('f"') || userCodeClean.includes('f\''));
        } else if (checkLower.includes('invalid task number')) {
          // For error messages, we need to see them in print statements or actual output
          found = (userCodeClean.includes('invalid task number') || 
                  userCodeClean.includes('❌ invalid task number')) &&
                  (userCodeClean.includes('print') || userCodeClean.includes('f"') || userCodeClean.includes('f\''));
        } else {
          // For other patterns, ensure they're not just strings
          found = userCodeClean.includes(checkLower) &&
                  !userCodeClean.includes(`"${checkLower}"`) && // Not just a quoted string
                  !userCodeClean.includes(`'${checkLower}'`);   // Not just a quoted string
        }
        
        console.log(`  Checking "${check}" (${checkLower}): ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
        
        if (found) {
          // Find matching subtasks for this code check
          const matchingSubtasks = task.subtasks.filter(subtask => {
            const subtaskLower = subtask.toLowerCase();
            
            // More flexible matching for different patterns
            if (checkLower === 'input(' || checkLower === 'input_async(') {
              return subtaskLower.includes('input') || subtaskLower.includes('prompt');
            } else if (checkLower === 'def show_menu' || checkLower === 'async def show_menu') {
              return subtaskLower.includes('show_menu') || subtaskLower.includes('function');
            } else if (checkLower === 'while true' || checkLower === 'while true:') {
              return subtaskLower.includes('while') || subtaskLower.includes('loop');
            } else if (checkLower === 'append(' || checkLower === 'tasks.append') {
              return subtaskLower.includes('append') || subtaskLower.includes('add');
            } else if (checkLower === 'pop(' || checkLower === 'tasks.pop') {
              return subtaskLower.includes('pop') || subtaskLower.includes('delete');
            } else if (checkLower === 'for idx, t in enumerate' || checkLower.includes('enumerate')) {
              return subtaskLower.includes('enumerate') || subtaskLower.includes('display') || subtaskLower.includes('view');
            } else if (checkLower.includes('completed')) {
              return subtaskLower.includes('completed') || subtaskLower.includes('mark');
            } else if (checkLower.includes('choice ==')) {
              return subtaskLower.includes('choice') || subtaskLower.includes('handle');
            } else if (checkLower.includes('task added') || checkLower.includes('task deleted') || checkLower.includes('task marked')) {
              return subtaskLower.includes('confirmation') || subtaskLower.includes('message') || subtaskLower.includes('show');
            } else {
              return subtaskLower.includes(checkLower.replace(/[()]/g, '')) ||
                     (checkLower === 'input(' && subtaskLower.includes('input'));
            }
          });
          
          console.log(`    Matching subtasks for "${check}":`, matchingSubtasks);
          
          matchingSubtasks.forEach(subtask => {
            if (!tasks[taskKey].completed.includes(subtask)) {
              tasks[taskKey].completed.push(subtask);
              console.log(`    ✅ Completed: ${subtask}`);
            }
          });
        } else {
          console.log(`    ❌ Pattern "${check}" not found in code`);
        }
      });
    }
    
    // Additional pattern matching for specific subtasks that need multiple patterns
    if (taskKey === 'task3') {
      // For "Show completed and incomplete status" - check if we have both status indicators
      const hasCompletedStatus = userCodeClean.includes('✔️') && userCodeClean.includes('❌');
      const hasCompletedLogic = userCodeClean.includes('t["completed"]') || userCodeClean.includes("t['completed']");
      
      if (hasCompletedStatus && hasCompletedLogic) {
        const statusSubtask = "Show completed and incomplete status";
        if (!tasks[taskKey].completed.includes(statusSubtask)) {
          tasks[taskKey].completed.push(statusSubtask);
          console.log(`    ✅ Completed: ${statusSubtask} (via status indicators)`);
        }
      }
    }
    
    if (taskKey === 'task4') {
      // For "Show confirmation or error" - check if we have both confirmation and error messages
      const hasConfirmation = userCodeClean.includes('task marked as completed') || userCodeClean.includes('✅ task marked as completed');
      const hasError = userCodeClean.includes('invalid task number') || userCodeClean.includes('❌ invalid task number');
      
      if (hasConfirmation && hasError) {
        const confirmationSubtask = "Show confirmation or error";
        if (!tasks[taskKey].completed.includes(confirmationSubtask)) {
          tasks[taskKey].completed.push(confirmationSubtask);
          console.log(`    ✅ Completed: ${confirmationSubtask} (via confirmation and error messages)`);
        }
      }
    }
  });
  
  console.log('=== END DEBUG ===');
  return tasks;
};

export const analyzeTerminalOutput = (output, config) => {
  if (!config || !config.terminalChecks) {
    return {
      hasErrors: false,
      errors: [],
      hasMenu: false,
      hasInput: false,
      isWorking: false,
      feedback: [],
      functionalityChecks: {}
    };
  }
  
  const outputText = output.join('\n');
  console.log('Terminal output being analyzed:', outputText);
  
  const analysis = {
    hasErrors: false,
    errors: [],
    hasMenu: false,
    hasInput: false,
    isWorking: false,
    feedback: [],
    functionalityChecks: {}
  };

  // Check for errors
  if (outputText.includes('❌ Error:') || 
      outputText.includes('SyntaxError') || 
      outputText.includes('NameError') || 
      outputText.includes('IndentationError') ||
      outputText.includes('TypeError') ||
      outputText.includes('AttributeError') ||
      outputText.includes('ZeroDivisionError')) {
    analysis.hasErrors = true;
    analysis.errors.push("Runtime errors detected in terminal output");
  }

  // Check each terminal check from config
  Object.entries(config.terminalChecks).forEach(([checkKey, checkConfig]) => {
    const hasKeyword = checkConfig.keywords.some(keyword => 
      outputText.includes(keyword)
    );
    
    analysis.functionalityChecks[checkKey] = hasKeyword;
    
    if (hasKeyword) {
      analysis.feedback.push(checkConfig.successMessage);
    } else {
      analysis.feedback.push(checkConfig.failureMessage);
    }
    
    // Set specific flags for backward compatibility
    if (checkKey === 'menuDisplay') {
      analysis.hasMenu = hasKeyword;
    }
    if (checkKey === 'inputPrompts') {
      analysis.hasInput = hasKeyword;
    }
  });

  // Overall assessment
  const allFunctionalityWorking = Object.values(analysis.functionalityChecks).every(check => check);
  if (allFunctionalityWorking && !analysis.hasErrors) {
    analysis.isWorking = true;
    analysis.feedback.push("🎉 Program is working correctly!");
  } else if (analysis.hasErrors) {
    analysis.feedback.push("🚨 Fix the errors before proceeding");
  } else {
    analysis.feedback.push("⚠️ Program needs more work - not all functionality tested");
  }

  console.log('Analysis result:', analysis);
  return analysis;
};

export const validateCodeLogic = (userCode, config) => {
  if (!config || !config.validationRules) {
    return {
      hasAllMenuOptions: false,
      hasProperIfElifStructure: false,
      hasBreakStatement: false,
      hasErrorHandling: false,
      hasProperFunctionCalls: false,
      feedback: []
    };
  }
  
  const logicChecks = {
    hasAllMenuOptions: false,
    hasProperIfElifStructure: false,
    hasBreakStatement: false,
    hasErrorHandling: false,
    hasProperFunctionCalls: false,
    feedback: []
  };

  // Check required logic
  const requiredLogic = config.validationRules.requiredLogic || [];
  const missingLogic = requiredLogic.filter(logic => !userCode.includes(logic));
  
  if (missingLogic.length === 0) {
    logicChecks.hasAllMenuOptions = true;
    logicChecks.feedback.push("✅ All menu options are handled");
  } else {
    logicChecks.feedback.push(`❌ Missing logic: ${missingLogic.join(', ')}`);
  }

  // Check for proper if-elif structure
  if (userCode.includes("if choice == '1'") && userCode.includes("elif choice == '2'") && userCode.includes("elif choice == '3'") && userCode.includes("elif choice == '4'")) {
    logicChecks.hasProperIfElifStructure = true;
    logicChecks.feedback.push("✅ Proper if-elif structure for menu handling");
  } else {
    logicChecks.feedback.push("❌ Missing proper if-elif structure for menu handling");
  }

  // Check for break statement
  if (userCode.includes("break")) {
    logicChecks.hasBreakStatement = true;
    logicChecks.feedback.push("✅ Break statement for exit functionality");
  } else {
    logicChecks.feedback.push("❌ Missing break statement for exit functionality");
  }

  // Check for error handling
  if (userCode.includes("else:") && (userCode.toLowerCase().includes("invalid choice") || userCode.toLowerCase().includes("invalid") || userCode.toLowerCase().includes("try again"))) {
    logicChecks.hasErrorHandling = true;
    logicChecks.feedback.push("✅ Error handling for invalid choices");
  } else {
    logicChecks.feedback.push("❌ Missing error handling for invalid choices");
  }

  // Check for proper function calls
  const requiredFunctionCalls = config.validationRules.requiredFunctionCalls || [];
  const missingFunctionCalls = requiredFunctionCalls.filter(call => !userCode.includes(call));
  
  if (missingFunctionCalls.length === 0) {
    logicChecks.hasProperFunctionCalls = true;
    logicChecks.feedback.push("✅ All functions are properly called");
  } else {
    logicChecks.feedback.push(`❌ Missing function calls: ${missingFunctionCalls.join(', ')}`);
  }

  return logicChecks;
};

// Get AI prompt context from config
export const getAIContext = (config, userCode, userQuestion) => {
  if (!config) return '';
  
  return {
    projectTitle: config.title,
    projectDescription: config.description,
    expectedCode: config.expectedCode,
    userCode: userCode || '',
    userQuestion: userQuestion,
    aiPrompts: config.aiPrompts || {}
  };
}; 