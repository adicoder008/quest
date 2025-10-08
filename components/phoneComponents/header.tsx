'use client'; // This component now uses a hook, so it must be a client component

import { MessageSquareMore, Bell } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { NotificationBadge } from '@/components/Notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth'; // 1. Import the new useAuth hook

const Header = () => { // Changed to uppercase to follow React component naming conventions
  const { user, loading } = useAuth(); // 2. Use the hook to get the current user

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/">
              <img 
                src="/Darklogo.svg" 
                alt="Quest" 
                className="w-20 h-12 object-contain cursor-pointer"
              />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/chats">
            <MessageSquareMore className='text-[#F7CEB0] size-6 hover:text-white transition-colors' />
          </Link>

          {/* 3. The conditional check now works because 'user' is defined */}
          <Link href="/notifications" className="relative">
            <Bell className='text-[#F7CEB0] size-6 hover:text-white transition-colors' />
            {/* We only render the badge if loading is false and a user exists */}
            {!loading && user && <NotificationBadge userId={user.uid} />}
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;
