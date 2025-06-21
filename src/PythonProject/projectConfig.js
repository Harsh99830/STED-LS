import project1Config from './Project1.json';

// Project configurations mapping
const projectConfigs = {
  'project1': project1Config,
  // Add more projects here as they're created
  // 'project2': project2Config,
  // 'project3': project3Config,
};

// Load project configuration
export const getProjectConfig = (projectId) => {
  return projectConfigs[projectId] || null;
};

// Generic validation functions that work with any project config
export const validateCodeAgainstExpected = (userCode, config) => {
  if (!config || !config.validationRules) return [];
  
  const missing = [];
  const userCodeClean = userCode.replace(/\s+/g, ' ').toLowerCase();
  
  // Check required components
  config.validationRules.requiredComponents.forEach(component => {
    if (!userCodeClean.includes(component.toLowerCase())) {
      missing.push(component);
    }
  });
  
  return missing;
};

export const checkTasksAndSubtasks = (userCode, config) => {
  if (!config || !config.tasks) return {};
  
  const tasks = {};
  const userCodeClean = userCode.replace(/\s+/g, ' ').toLowerCase();
  
  Object.entries(config.tasks).forEach(([taskKey, task]) => {
    tasks[taskKey] = {
      title: task.title,
      subtasks: task.subtasks,
      completed: []
    };
    
    // Task-specific validation logic
    switch (taskKey) {
      case 'task1': // Create Menu System
        if (userCodeClean.includes('def show_menu') || userCodeClean.includes('def show_menu(')) {
          tasks[taskKey].completed.push("Create show_menu() function");
        }
        if (userCodeClean.includes('print') && (userCodeClean.includes('personal finance tracker') || userCodeClean.includes('add income') || userCodeClean.includes('add expense') || userCodeClean.includes('view summary') || userCodeClean.includes('exit'))) {
          tasks[taskKey].completed.push("Add print statements for menu options");
        }
        if (userCodeClean.includes('while true') || userCodeClean.includes('while true:') || userCodeClean.includes('while true ')) {
          tasks[taskKey].completed.push("Create main while loop");
        }
        if (userCodeClean.includes('show_menu()') && userCodeClean.includes('while')) {
          tasks[taskKey].completed.push("Call show_menu() in loop");
        }
        if (userCodeClean.includes('input_async')) {
          tasks[taskKey].completed.push("Get user input with input_async()");
        }
        break;
        
      case 'task2': // Add Income Feature
        if (userCodeClean.includes('def add_income') || userCodeClean.includes('async def add_income')) {
          tasks[taskKey].completed.push("Create add_income() function");
        }
        if (userCodeClean.includes('input_async') && userCodeClean.includes('add_income')) {
          tasks[taskKey].completed.push("Use input_async() to get amount");
        }
        if (userCodeClean.includes('float(') && userCodeClean.includes('add_income')) {
          tasks[taskKey].completed.push("Convert input to float");
        }
        if (userCodeClean.includes('return') && userCodeClean.includes('add_income')) {
          tasks[taskKey].completed.push("Return the amount");
        }
        break;
        
      case 'task3': // Add Expense Feature
        if (userCodeClean.includes('def add_expense') || userCodeClean.includes('async def add_expense')) {
          tasks[taskKey].completed.push("Create add_expense() function");
        }
        if (userCodeClean.includes('input_async') && userCodeClean.includes('add_expense')) {
          tasks[taskKey].completed.push("Get expense name with input_async()");
          tasks[taskKey].completed.push("Get expense amount with input_async()");
        }
        if (userCodeClean.includes('return') && userCodeClean.includes('{') && userCodeClean.includes('add_expense')) {
          tasks[taskKey].completed.push("Return dictionary with name and amount");
        }
        break;
        
      case 'task4': // View Balance Feature
        if (userCodeClean.includes('def show_summary(')) {
          tasks[taskKey].completed.push("Create show_summary() function");
        }
        if (userCodeClean.includes('sum(') && userCodeClean.includes('incomes')) {
          tasks[taskKey].completed.push("Calculate total income with sum()");
        }
        if (userCodeClean.includes('sum(') && userCodeClean.includes('expenses')) {
          tasks[taskKey].completed.push("Calculate total expenses with sum()");
        }
        if (userCodeClean.includes('print') && userCodeClean.includes('show_summary')) {
          tasks[taskKey].completed.push("Display formatted summary");
        }
        break;
        
      case 'task5': // Data Management
        if (userCodeClean.includes('incomes = []') || userCodeClean.includes('incomes=[]') || userCodeClean.includes('incomes =[]')) {
          tasks[taskKey].completed.push("Initialize incomes list");
        }
        if (userCodeClean.includes('expenses = []') || userCodeClean.includes('expenses=[]') || userCodeClean.includes('expenses =[]')) {
          tasks[taskKey].completed.push("Initialize expenses list");
        }
        if (userCodeClean.includes('incomes.append') && userCodeClean.includes('add_income')) {
          tasks[taskKey].completed.push("Add income to list in main loop");
        }
        if (userCodeClean.includes('expenses.append') && userCodeClean.includes('add_expense')) {
          tasks[taskKey].completed.push("Add expense to list in main loop");
        }
        break;
        
      case 'task6': // Menu Logic Implementation
        if (userCodeClean.includes("if choice == '1'") || userCodeClean.includes("if choice == '1':")) {
          tasks[taskKey].completed.push("Handle choice == '1' (Add Income)");
        }
        if (userCodeClean.includes("elif choice == '2'") || userCodeClean.includes("if choice == '2'")) {
          tasks[taskKey].completed.push("Handle choice == '2' (Add Expense)");
        }
        if (userCodeClean.includes("elif choice == '3'") || userCodeClean.includes("if choice == '3'")) {
          tasks[taskKey].completed.push("Handle choice == '3' (View Summary)");
        }
        if (userCodeClean.includes("elif choice == '4'") || userCodeClean.includes("if choice == '4'")) {
          tasks[taskKey].completed.push("Handle choice == '4' (Exit)");
        }
        if ((userCodeClean.includes("else:") || userCodeClean.includes("else :")) && (userCodeClean.includes("invalid choice") || userCodeClean.includes("invalid") || userCodeClean.includes("try again"))) {
          tasks[taskKey].completed.push("Handle invalid choices");
        }
        break;
        
      default:
        // Fallback to generic checking for other tasks
        task.codeChecks.forEach(check => {
          if (userCodeClean.includes(check.toLowerCase())) {
            const matchingSubtasks = task.subtasks.filter(subtask => 
              subtask.toLowerCase().includes(check.toLowerCase().replace(/[()]/g, ''))
            );
            matchingSubtasks.forEach(subtask => {
              if (!tasks[taskKey].completed.includes(subtask)) {
                tasks[taskKey].completed.push(subtask);
              }
            });
          }
        });
    }
  });
  
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