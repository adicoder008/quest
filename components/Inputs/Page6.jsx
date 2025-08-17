'use client'
import React, { useState } from 'react';

const Page6 = ({ onSubmit }) => {
  const [budget, setBudget] = useState(1000); // Default value: ₹1,000

  // Handle direct input changes
  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    value = Math.min(Math.max(value, 0), 10000); // Keep within range
    setBudget(value);
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-4 items-center justify-center">
      {/* Label */}
      <div className="font-[600] text-3xl font-arsenal italic">
        What is your budget for this trip?
      </div>
      <div>Excluding major transportation fares like flights and trains</div>

      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="10000"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        className="w-[50vw] h-1 rounded-lg appearance-none bg-gray-300 cursor-pointer"
        style={{
          background: `linear-gradient(to right, #F86F0A ${(budget / 10000) * 100}%, #D1D5DB ${(budget / 10000) * 100}%)`, // Orange progress
        }}
      />

      {/* Custom Slider Thumb */}
      <style>
        {`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
            cursor: pointer;
          }
        `}
      </style>

      {/* Min-Max Values */}
      <div className="flex justify-between w-[50vw] text-[0.8rem]">
        <div>₹ 0</div>
        <div>₹ 10,000</div>
      </div>

      {/* Editable Budget Input */}
      <input
        type="text"
        value={`₹ ${Number(budget).toLocaleString('en-IN')}`}
        onChange={handleInputChange}
        className="text-center text-lg border-[1px] border-[#8B8A8F] rounded-md px-5 py-3 w-[150px]"
      />
    </div>
  );
};

export default Page6;