import { useState } from "react";

export const SearchBar = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="box-border flex items-center w-[361px] border shadow-[4px_4px_10px_rgba(0,0,0,0.1)] bg-white pl-2.5 pr-1.5 py-1 rounded-[28px] border-solid border-[#8B8A8F] max-sm:w-full max-sm:max-w-[320px]">
      <svg
        className="w-5 h-5 mr-2.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 21L16.657 16.657M16.657 16.657C17.3999 15.9141 17.9892 15.0322 18.3912 14.0615C18.7933 13.0909 19.0002 12.0506 19.0002 11C19.0002 9.94939 18.7933 8.90908 18.3912 7.93845C17.9892 6.96782 17.3999 6.08588 16.657 5.34299C15.9141 4.6001 15.0322 4.01081 14.0615 3.60877C13.0909 3.20672 12.0506 2.99979 11 2.99979C9.94939 2.99979 8.90908 3.20672 7.93845 3.60877C6.96782 4.01081 6.08588 4.6001 5.34299 5.34299C3.84266 6.84332 2.99979 8.87821 2.99979 11C2.99979 13.1218 3.84266 15.1567 5.34299 16.657C6.84332 18.1573 8.87821 19.0002 11 19.0002C13.1218 19.0002 15.1567 18.1573 16.657 16.657Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="box-border grow bg-transparent border-none outline-none text-[#8B8A8F]"
      />
      <button className="box-border text-white cursor-pointer bg-[#EA6100] px-4 py-1.5 rounded-[28px] border-none">
        Search
      </button>
    </div>
  );
};
