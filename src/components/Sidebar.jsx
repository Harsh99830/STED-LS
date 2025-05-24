import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import React from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-5 left-4 z-50">
      <button onClick={() => setOpen(!open)} className="text-black text-2xl">
        <FaBars />
      </button>

      {open && (
        <div className="bg-white p-4 shadow-lg rounded-xl mt-2 w-40">
          <Link to="/dashboard" className="block py-1 hover:text-blue-600">Dashboard</Link>
          <Link to="/profile" className="block py-1 hover:text-blue-600">Profile</Link>
        </div>
      )}
    </div>
  );
}
