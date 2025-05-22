import React from 'react';
import { Link } from 'react-router-dom';
import speaker from '../assets/speaker.jpg'; // Adjust the path if needed

function Home() {
  return (
    <div className="w-full flex items-center justify-between bg-white px-16 overflow-hidden">
      
      {/* Left Section: Text */}
      <div className="flex flex-col" style={{"position":"absolute",top:200,left: 200}}>
        <p className="text-5xl font-semibold text-gray-800 mb-6 pl-30">
          A practical way to learn
        </p>
        <h1 className="text-8xl font-extrabold text-blue-600 mb-10 leading-tight">
          <span className='leading-[1.4]'>Public</span> <br />
          <span className='pl-30'>Speaking</span>
        </h1>
        <button className="px-6 py-3 bg-indigo-600 text-white text-lg rounded-md w-fit hover:bg-indigo-700 transition ml-70 mt-30">
          <Link to='/login'>Get Started</Link>
        </button>
      </div>

      {/* Right Section: Image */}
      <div className=" flex-shrink-0" style={{position:'absolute', right: 0,bottom: 0}}>
        <img
          src={speaker}
          alt="Speaker"
          className="h-full object-contain"
        />
      </div>
    </div>
  );
}

export default Home;
