import React from 'react';

export default function StartButton({ isStarted, onClick }) {
  return (
    <div className="fixed bottom-10 right-50">
      <button
        onClick={onClick}
        className={`${
          isStarted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
        } text-white text-lg  text-center h-10 w-20 shadow-lg transition-all duration-200 rounded-full`}
      >
        {isStarted ? 'Done' : 'Start'}
      </button>
    </div>
  );
}
