import React from "react";

export default function StartedModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 text-center shadow-lg w-72">
        <img
          src="https://media.giphy.com/media/111ebonMs90YLu/giphy.gif"
          alt="Started"
          className="w-24 mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-green-600">Task Started!</h2>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
