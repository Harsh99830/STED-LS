import React from 'react';

export default function StartButton({ isStarted, onClick, onStartRecording, onStopRecording }) {
  const handleClick = () => {
    // Call recording handler if available
    if (isStarted && onStopRecording) {
      onStopRecording(); // Stop recording on Done
    } else if (!isStarted && onStartRecording) {
      onStartRecording(); // Start recording on Start
    }

    onClick(); // Call main click handler
  };

  return (
    <div className="fixed bottom-10 right-50">
      <button
        onClick={handleClick}
        className={`${
          isStarted ? 'bg-[#46a052] hover:bg-[#22843b]' : 'bg-[#155DFC] hover:bg-[#1f4189]'
        } text-white text-lg text-center h-12 w-25 shadow-lg transition-all duration-200 rounded-xl`}
      >
        {isStarted ? 'Done' : 'Start'}
      </button>
    </div>
  );
}
