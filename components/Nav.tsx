'use client';

import React from 'react';
import { useRouter  } from 'next/navigation';
import { Home, Search, Bell, Mail, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

// Define the type for the user prop
interface User {
  uid?: string;
  photoURL?: string;
  displayName?: string;
}

interface NavBarProps {
  user: User | null;
  onSignOut: () => void;
}

// Custom component to render your OnQuest SVG icon
const OnQuestIcon = () => (
  <img src='/quest_explore_footer.png' className="w-6 h-6" alt="OnQuest Icon" />
);

// Custom SVG component for the AI Trip Planner icon
const AITripPlannerIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-6 h-6"
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
        <path d="m12 2-1.09 2.22 2.22 1.09L14.22 3 12 2Z"/>
        <path d="M18 5.89 16.91 8.11 19.13 9.2 20 7l-2-1.11Z"/>
        <path d="m6 5.89 1.09 2.22-2.22 1.09L3.78 7 6 5.89Z"/>
    </svg>
);


const NavBar = ({ user, onSignOut }: NavBarProps) => {
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState('feed');

  // Updated navItems to use custom icon components and string labels
  const navItems = [
    { icon: Home, label: 'Feed', route: 'feed' },
    { icon: Search, label: 'Explore', route: 'explore' },
    { 
      icon: OnQuestIcon,       // Use the custom SVG component for the icon
      label: 'Quest',           // Use a simple string for the label
      route: 'quest' 
    },
    { 
      icon: AITripPlannerIcon, // Use the custom SVG component for the icon
      label: 'AI Trip Planner', // Use a simple string for the label
      route: 'aitrip' 
    },
    { icon: Bell, label: 'Notifications', route: 'notifications' },
    { icon: Mail, label: 'Messages', route: 'chats' },
    { icon: User, label: 'Profile', route: 'profile' },
    { icon: Settings, label: 'Settings', route: 'settings' },
  ];

  const handleNavClick = (route: string) => {
    setActiveRoute(route);
    if (route === 'explore') {
      router.push('/explore');
    } else if (route === 'profile') {
      router.push(`/profile/${user?.uid}`);
    } else if (route === 'quest') {
      router.push('/quest');
    } else if (route === 'settings') {
      router.push('/settings');
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-[280px] border-r border-gray-700 bg-black p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <img src='/Darklogo.svg' className="w-[130px]" alt="OnQuest" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon; // This will now correctly reference your custom components
          const isActive = activeRoute === item.route;
          
          return (
            <button
              key={item.route}
              onClick={() => handleNavClick(item.route)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                isActive 
                  ? 'bg-[#F7CEB0] text-black font-medium' 
                  : 'text-white hover:bg-gray-900'
              }`}
            >
              <Icon /> {/* Render the icon component */}
              <span className="text-lg">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user?.photoURL || '/default-avatar.png'} 
              alt={user?.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-sm font-medium truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                @{user?.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}
              </p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-900"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

