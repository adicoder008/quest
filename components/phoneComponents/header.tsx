'use client';

import { MessageSquareMore, Bell } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { NotificationBadge } from '@/components/Notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { RiMessage3Fill } from "react-icons/ri";
import { BiSolidMessageDots } from "react-icons/bi";
import { IoIosNotifications } from "react-icons/io";
import { BiSolidMessageDetail } from "react-icons/bi";

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <>
      {/* Sticky header with glassmorphism effect,bg-[#101828] */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 rounded-md bg-black  backdrop-saturate-150 text-white shadow-lg ">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img 
              src="/OQ_LOGO_MAIN.svg" 
              alt="Quest" 
              className="w-26 object-contain cursor-pointer"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/chats">
            {/* <MessageSquareMore className='text-white size-6 hover:text-white transition-colors cursor-pointer' /> */}
            <BiSolidMessageDetail className='text-white size-5 hover:text-white transition-colors cursor-pointer' />
          </Link>

          <Link href="/notifications" className="relative">
            <IoIosNotifications className='text-white size-6 hover:text-white transition-colors cursor-pointer' />
            {!loading && user && <NotificationBadge userId={user.uid} />}
            {/* <Bell className='text-white size-6 hover:text-white transition-colors cursor-pointer' />
            {!loading && user && <NotificationBadge userId={user.uid} />} */}
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;