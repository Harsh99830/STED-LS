import React from 'react';
import Sidebar from './Sidebar';
import { UserButton } from "@clerk/clerk-react";

function Navbar({ onProgressClick, showProgress }) {
  return (
    <div className='w-full h-16 bg-white shadow-md flex items-center justify-between px-4'>
      <Sidebar />
      <p className='font-bold text-2xl pl-18'>STED LS</p>

      <div className='flex items-center gap-4'>
        <button
          onClick={onProgressClick}
          className="text-sm w-30 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mr-20 rounded-full transition"
        >
          {showProgress ? "Close" : "Your Progress"}
        </button>

        <div className='transform scale-125'>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
