import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaUserCircle, FaTasks, FaChartLine, FaCog, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  // Close sidebar if clicking outside sidebar
  const handleOverlayClick = () => setOpen(false);

  // Prevent sidebar clicks from closing sidebar
  const handleSidebarClick = (e) => e.stopPropagation();

  return (
    <>
       <button
        onClick={() => setOpen(!open)}
        className="fixed top-5 left-5 z-60 text-2xl text-black focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-64 bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-50 flex flex-col p-6 border border-black/10"
        onClick={handleSidebarClick}  // <-- Prevent overlay close when clicking sidebar
      >
        {/* Profile icon and label */}
        <div className="flex flex-col items-center mb-6 ">
          <FaUserCircle className="text-gray-800" size={80} />
          <p className="mt-2 text-lg font-semibold text-gray-900">Profile</p>
        </div>

        <hr className="border-gray-300 mb-6" />

        {/* Upper menu items */}
        <nav className="flex flex-col gap-4 mb-auto">
          <Link
            to="/profile"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaUserCircle size={20} />
            Profile
          </Link>
          <Link
            to="/mytasks"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaTasks size={20} />
            My Tasks
          </Link>
          <Link
            to="/progress"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaChartLine size={20} />
            Your Progress
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaChartLine size={20} />
            Leaderboard
          </Link>
        </nav>

        {/* Bottom menu items */}
        <nav className="flex flex-col gap-4 mt-auto pt-6 border-t border-gray-300">
          <Link
            to="/settings"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaCog size={20} />
            Settings
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <FaQuestionCircle size={20} />
            Help / FAQ
          </Link>
        </nav>
      </motion.div>

      {/* Overlay behind sidebar when open */}
      {open && (
        <div
          onClick={handleOverlayClick}
          className="fixed top-0 left-64 right-0 bottom-0  bg-opacity-30 z-40"
          aria-hidden="true"
        />
      )}
    </>
  );
}
