"use client";

import { Search } from "lucide-react";
import React from "react";

const SearchBar: React.FC = () => {
  return (
    <div className="flex items-center w-full max-w-md mx-auto bg-white rounded-md shadow p-2">
      {/* Search Icon */}
      <Search className="w-5 h-5 text-black font-bold ml-2" />

      {/* Input */}
      <input
        type="text"
        placeholder="Where to today..."
        className="flex-1 bg-transparent outline-none px-3 text-black  placeholder-black"
      />

      {/* Button */}
      <button
        type="button"
        className="bg-black text-white px-4 py-1 rounded-xl hover:bg-gray-800"
      >
        Go
      </button>
    </div>
  );
};

export default SearchBar;
