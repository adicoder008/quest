import React from 'react'
import { HiHome } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { FaSearchLocation } from "react-icons/fa";
import { FaRegPlusSquare } from "react-icons/fa";
import { HiUser } from "react-icons/hi2";

const Footer = () => {
  return (
    <>
    {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-t border-peach-200/20">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex flex-col items-center text-peach-200">
            {/* <div className="w-6 h-6 mb-1">🏠</div> */}
            <HiHome size={24}/>
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center text-white">
            {/* <div className="w-6 h-6 mb-1">🔍</div> */}
            <IoSearch size={24}/>
            {/* <FaSearchLocation size={22}/> */}
            
            <span className="text-xs">Explore</span>
          </div>
          <div className="flex flex-col items-center text-white">
            {/* <div className="w-6 h-6 mb-1">➕</div> */}
            <FaRegPlusSquare size={22} className="text-[#F7CEB0]" />
            <span className="text-xs">Post</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-6 h-6 mb-1">🎯</div>
            <span className="text-xs">Quest</span>
          </div>
          <div className="flex flex-col items-center text-white">
            {/* <div className="w-6 h-6 mb-1">👤</div> */}
            <HiUser size={22} className="text-[#F7CEB0]"/>
            <span className="text-xs">Account</span>
          </div>
        </div>
      </div>
      
    </>
  )
}

export default Footer
