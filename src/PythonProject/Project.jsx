import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import Statement from './Statement';
import AI from './AI';
import { useUser } from '@clerk/clerk-react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Project() {
  const [rightPanel, setRightPanel] = useState('statement');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showEndProjectOverlay, setShowEndProjectOverlay] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

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

      {/* End Project Button */}
      <div className="absolute top-2 right-4">
        <button
          onClick={handleEndProjectClick}
          className="px-6 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
        >
          End Project
        </button>
      </div>

      <div className="flex h-screen pt-12 p-3 bg-[#0F0F0F] w-screen">
          <div className="w-280 border border-white h-full text-white border-white">
        <CodeEditor />
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
            <AI />
          )}
        </div>
      </div>
        </div>
        </>
  );
}

export default Project;
