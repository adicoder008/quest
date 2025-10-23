'use client';

import { MessageSquareMore, Bell } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { NotificationBadge } from '@/components/Notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { user, loading } = useAuth();

  return (
    <>
      {/* Sticky header with glassmorphism effect */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 rounded-md  bg-[#101828] backdrop-saturate-150 text-white shadow-lg ">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img 
              src="/Darklogo.svg" 
              alt="Quest" 
              className="w-26 object-contain cursor-pointer"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/chats">
            <MessageSquareMore className='text-[#EA6100] size-6 hover:text-white transition-colors cursor-pointer' />
          </Link>

          <Link href="/notifications" className="relative">
            <Bell className='text-[#EA6100] size-6 hover:text-white transition-colors cursor-pointer' />
            {!loading && user && <NotificationBadge userId={user.uid} />}
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;