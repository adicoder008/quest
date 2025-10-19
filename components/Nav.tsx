
// File: components/Nav.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search,User, Bell, Mail,  Settings, LogOut, Menu } from 'lucide-react';

interface User {
  uid?: string;
  photoURL?: string;
  displayName?: string;
}

interface NavBarProps {
  user: import('firebase/auth').User | null;
  onSignOut: () => void;
}

const OnQuestIcon = () => (
  <img src='/quest_explore_footer.png' className="w-6 h-6" alt="OnQuest Icon" />
);

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 1280) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // derive activeRoute from pathname for better UX
  useEffect(() => {
    try {
      const path = window.location.pathname.split('/')[1] || 'feed';
      setActiveRoute(path || 'feed');
    } catch (e) {
      // ignore on SSR
    }
  }, []);

  const navItems = [
    { icon: Home, label: 'Feed', route: 'feed' },
    { icon: Search, label: 'Explore', route: 'explore' },
    { 
      icon: OnQuestIcon,
      label: 'Quest',
      route: 'quest' 
    },
    { 
      icon: AITripPlannerIcon,
      label: 'AI Trip Planner',
      route: 'aitrip' 
    },
    { icon: Bell, label: 'Notifications', route: 'notifications' },
    { icon: Mail, label: 'Messages', route: 'chats' },
    { icon: User, label: 'Profile', route: 'profile' },
    { icon: Settings, label: 'Settings', route: 'settings' },
  ];

  const handleNavClick = (route: string) => {
    setActiveRoute(route);
    if (route === 'explore') router.push('/explore');
    else if (route === 'profile') router.push(`/profile/${user?.uid}`);
    else if (route === 'quest') router.push('/quest');
    else if (route === 'settings') router.push('/settings');
    else if (route === 'notifications') router.push('/notifications');
    else if (route === 'chats') router.push('/chats');
    else if (route === 'feed') router.push('/feed');
    else router.push('/');
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen border-r border-gray-700 bg-black p-4 flex flex-col transition-all duration-300 z-50 ${
        isExpanded ? 'w-[280px]' : 'w-[80px]'
      }`
      }
      aria-label="Main navigation"
    >
      <div className="mb-8 flex items-center justify-between">
        {isExpanded ? (
          <img src='/Darklogo.svg' className="w-[130px]" alt="OnQuest" />
        ) : (
          <img src='/quest_explore_footer.png' className="w-[40px]" alt="OnQuest" />
        )}
        {screenWidth >= 1280 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-900 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2" role="navigation">
        {navItems.map((item) => {
          const Icon = item.icon as any;
          const isActive = activeRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => handleNavClick(item.route)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors relative group ${
                isActive 
                  ? 'bg-[#EA6100] text-black font-medium' 
                  : 'text-white hover:bg-gray-900'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <span className="flex-shrink-0">
                <Icon />
              </span>
              {isExpanded && <span className="text-lg">{item.label}</span>}

              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 pt-4">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded ? (
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img 
                  src={user?.photoURL || '/default-avatar.png'} 
                  alt={user?.displayName || 'User'}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-900 flex-shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="relative group">
              <button
                onClick={onSignOut}
                className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[#EA6100] transition-all"
                aria-label="Sign out"
              >
                <img 
                  src={user?.photoURL || '/default-avatar.png'} 
                  alt={user?.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                <p className="font-medium">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-400">Click to sign out</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default NavBar;
