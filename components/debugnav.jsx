"use client";

import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";

// Minimal debug version to test if click works
const DebugNavbar = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    console.log("Button clicked!");
    alert("Button clicked!"); // Visual confirmation
    setShowAuthModal(true);
  };

  const closeModal = () => {
    console.log("Modal closed!");
    setShowAuthModal(false);
  };

  return (
    <div className="w-full p-4 bg-white shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">OnQuest Debug</h1>
        </div>

        {/* Test Button */}
        <button 
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ cursor: 'pointer' }}
        >
          Click Me to Test
        </button>
      </div>

      {/* Simple Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Modal Works!</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>
            <p>If you see this, the click handler is working!</p>
            <button 
              onClick={closeModal}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugNavbar;