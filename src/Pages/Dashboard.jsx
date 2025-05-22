import React from 'react';
import { SignOutButton } from '@clerk/clerk-react';

function Dashboard() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4">
        <SignOutButton>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Sign Out
          </button>
        </SignOutButton>
      </div>

      {/* Page Content */}
      <div className="flex justify-center items-center h-full text-3xl font-semibold">
        Dashboard
      </div>
    </div>
  );
}

export default Dashboard;
