import { MessageSquareMore } from 'lucide-react';
import React from 'react'
import { IoMdChatboxes } from "react-icons/io";
import { MdNotifications } from "react-icons/md";

const header = () => {
  return (
    <>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img 
              src="/Darklogo.svg" 
              alt="Quest" 
              className="w-20 h-12 object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* <IoMdChatboxes className='text-[#F7CEB0] size-6' /> */}
            <MessageSquareMore className='text-[#F7CEB0] size-6' />
            <MdNotifications className='text-[#F7CEB0] size-6'/>

            {/* <MessageCircle className="w-6 h-6" /> */}
            {/* <div className="w-6 h-6 bg-peach-200 rounded-full" /> */}
          </div>
        </div>
      
    </>
  )
}

export default header
