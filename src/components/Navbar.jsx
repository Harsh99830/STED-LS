import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { UserButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  // Mock skills for demonstration (replace with real userData if available)
  const mySkills = ["Python", "Data Science", "Public Speaking", "Power BI"];
  const [showSkills, setShowSkills] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="w-full h-20 bg-white shadow-md flex items-center justify-between px-6
                    animate-[fadeIn_0.8s_ease-out] transition-all duration-500 z-50">

      {/* Sidebar */}
      <div className="flex items-center h-full">
        <Sidebar />
      </div>

      {/* Logo */}
     <Link to={"/home"}>
      <p className="text-xl font-semibold text-gray-800 h-full select-none">
        STED LS
      </p>
     </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          </div>
        </form>
      </div>

      {/* My Skills Dropdown */}
      <div className="relative mr-6">
        <button
          onClick={() => setShowSkills((prev) => !prev)}
          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium text-sm shadow hover:bg-purple-200 transition-colors"
        >
          My learning
        </button>
        {showSkills && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-3 flex flex-col gap-2">
            {mySkills.map((skill) => (
              <Link key={skill} to={`/${skill.toLowerCase().replace(/ /g, '-')}`}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium transition-colors">
                {skill}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6 h-full">

        {/* Progress Button (conditionally rendered) */}
        {/* {!hideProgressButton && (
          <button
            onClick={onProgressClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 
                       rounded-full font-semibold shadow-lg tracking-wide 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       text-sm flex items-center"
          >
            {showProgress ? "Close" : "Your Progress"}
          </button>
        )} */}

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
