import React from 'react';

function Colab() {
  return (
    <div
      className="h-full w-full border border-white text-white flex flex-col p-4 bg-[#18181b]"
      >
      <h2 className="text-xl font-bold mb-4 text-purple-300">Colab</h2>
      <div className="flex-1 overflow-y-auto">
        {/* Add your Colab content here. For now, it's a placeholder. */}
        <div className="text-gray-400 text-base">This is your Colab area. Add notes, links, or anything you want here!</div>
      </div>
    </div>
  );
}

export default Colab;
