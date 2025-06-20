import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import Statement from './Statement';
import AI from './AI';

function Project() {
  const [rightPanel, setRightPanel] = useState('statement');
  const [isExplaining, setIsExplaining] = useState(false);

  return (
      <div className="flex h-screen bg-gray-900 w-screen">
        <div className="w-280 h-190 text-white pt-5 border-l border-white">
        <CodeEditor />
        </div>
      {/* Left side - Code Editor */}
     

      {/* Right side - Statement / AI Panel */}
      <div className="w-150 h-190 bg-zinc-700 text-white p-5 border-l border-white">
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
            <AI />
          )}
        </div>
      </div>
    </div>
  );
}

export default Project;
