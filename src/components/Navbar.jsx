import React from 'react';
import Sidebar from './Sidebar';
import { UserButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

function Navbar({ onProgressClick, showProgress, hideProgressButton }) {
  return (
    <div className="w-full h-20 bg-white shadow-md flex items-center justify-between px-6
                    animate-[fadeIn_0.8s_ease-out] transition-all duration-500 z-50">

      {/* Sidebar */}
      <div className="flex items-center h-full">
        <Sidebar />
      </div>

      {/* Logo */}
      <Link to="/home" className="text-xl font-semibold text-gray-800 ml-16 flex items-center h-full select-none">
        STED LS
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-6 h-full">

        {/* Progress Button (conditionally rendered) */}
        {!hideProgressButton && (
          <button
            onClick={onProgressClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 
                       rounded-full font-semibold shadow-lg tracking-wide 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       text-sm flex items-center"
          >
            {showProgress ? "Close" : "Your Progress"}
          </button>
        )}

        {/* User Button */}
        <div className="transform scale-110 hover:scale-125 transition-transform duration-300 mr-2 flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default Navbar;
