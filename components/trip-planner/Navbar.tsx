import React from "react";
import { SearchBar } from "../Feed/SearchBar";

export const Navbar = () => {
  return (
    <header className="bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex w-full items-center gap-[40px_100px] justify-between flex-wrap px-8 max-md:max-w-full max-md:px-5">
      <div className="self-stretch flex flex-row overflow-hidden items-center justify-center w-[150px] my-auto px-[30px] py-[38px] max-md:px-5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/07d2cbef23f26a3549400ef750b54958546173a75b673b9e6efd80295862efaa?placeholderIfAbsent=true"
          className="aspect-[1.45] object-contain w-[13px]"
          alt="Logo"
        />
        <SearchBar />
       
      </div>
     
      <nav className="self-stretch flex min-w-60 items-center gap-3 text-base text-black font-medium flex-wrap my-auto max-md:max-w-full">
        <button className="self-stretch gap-2.5 whitespace-nowrap my-auto px-3 py-2">
          Home
        </button>
        <button className="self-stretch gap-2.5 text-[#F86F0A] my-auto px-3 py-2">
          AI Trip Planner
        </button>
        <button className="self-stretch gap-2.5 my-auto px-3 py-2">
          Events & Happenings
        </button>
        <button className="self-stretch gap-2.5 my-auto px-3 py-2">
          About us
        </button>
        <button className="self-stretch gap-2.5 my-auto px-3 py-2">
          Contact Us
        </button>
      </nav>
      <div className="self-stretch flex items-center gap-4 font-normal w-[150px] my-auto">
        <div className="self-stretch bg-[rgba(248,111,10,0.1)] min-h-11 gap-2.5 text-xl text-black whitespace-nowrap w-11 h-11 my-auto px-2.5 rounded-[64px] flex items-center justify-center">
          A
        </div>
        <div className="text-black text-base self-stretch my-auto">
          Alok Kumar
        </div>
      </div>
    </header>
  );
};
