import React from 'react';
import { Link } from 'react-router-dom';
import speaker from '../assets/speaker.jpg';

function Home() {
  return (
    
<div className="bg-white w-full min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 overflow-hidden">
      
      {/* Left Section: Text */}
      <div className="flex flex-col items-start text-center lg:text-left max-w-xl overflow-hidden">
        <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800 mb-6">
          A practical way to learn
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-blue-600 mb-10 leading-tight">
          <span className="block leading-[1.2]">Public</span>
          <span className="block">Speaking</span>
        </h1>
        <Link to="/login">
          <button className="px-4 py-2 ml-40 mt-20 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition ">
            Get Started
          </button>
        </Link>
      </div>

      {/* Right Section: Image with Colored Box */}
      <div className="w-full lg:w-1/2 flex justify-center mt-10 lg:mt-0">
        <div className="bg-blue-100 rounded-3xl p-6 sm:p-10 shadow-lg max-w-[400px]">
          <img
            src={speaker}
            alt="Speaker"
            className="w-full h-auto object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
