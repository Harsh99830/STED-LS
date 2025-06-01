import React from 'react';

export default function StartButton({ isStarted, onClick, onStartRecording, onStopRecording, disabled }) {
  const handleClick = () => {
    if (disabled) return; // Prevent click if disabled
    // Call recording handler if available
    if (isStarted && onStopRecording) {
      onStopRecording(); // Stop recording on Done
    } else if (!isStarted && onStartRecording) {
      onStartRecording(); // Start recording on Start
    }

    onClick(); // Call main click handler
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`${
          isStarted ? 'bg-[#46a052] hover:bg-[#22843b]' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold text-lg text-center h-12 w-28 rounded-lg shadow-lg transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        {isStarted ? 'Done' : 'Start'}
      </button>
    </div>
  );
}