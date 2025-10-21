'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Bookmark,
  Check,
  Calendar,
  SlidersHorizontal,
  HelpCircle,
  Bell,
  Lock,
  Globe,
  Palette,
  Eye,
  Shield,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  title: string;
  description: string;
  route: string;
  badge?: string;
}

const SettingsPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');
  const isLoggedIn = true; // Replace with actual auth state
  const userName = "Harshini";

  const accountItems: MenuItem[] = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your profile information',
      route: '/account/profile',
    },
    {
      icon: Bookmark,
      title: 'Saved Quests',
      description: 'View your saved adventures',
      route: '/account/saved-quests',
      badge: '12',
    },
    {
      icon: Check,
      title: 'Completed Quests',
      description: 'Your adventure history',
      route: '/account/completed-quests',
      badge: '24',
    },
    {
      icon: Calendar,
      title: 'Upcoming Quests',
      description: 'Quests you have planned',
      route: '/account/upcoming-quests',
      badge: '3',
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      route: '/account/notifications',
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Control your privacy settings',
      route: '/account/privacy',
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'Set your language and location',
      route: '/account/language',
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize your experience',
      route: '/account/appearance',
    },
    {
      icon: Eye,
      title: 'Display',
      description: 'Adjust display settings',
      route: '/account/display',
    },
  ];

  const supportItems: MenuItem[] = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Find answers to common questions',
      route: '/account/help',
    },
    {
      icon: Shield,
      title: 'Report a Problem',
      description: 'Let us know if something is wrong',
      route: '/account/report',
    },
  ];

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log('Sign out');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white lg:bg-gray-50">
        <div className="lg:ml-[280px]">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Account</h1>
              <p className="text-gray-600 mt-2">Sign in to access your account</p>
            </div>

            {/* Sign In Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-[#EA6100]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-[#EA6100]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hello, {userName}
                </h2>
                <p className="text-gray-600 mb-6">
                  Start your Quest here! Sign in to unlock all features.
                </p>
                <button
                  onClick={() => console.log('Sign in')}
                  className="w-full sm:w-auto px-8 py-3 bg-[#EA6100] hover:bg-[#d55600] text-white font-medium rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              {settingsItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#EA6100] transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#EA6100]/10 transition-colors">
                          <Icon className="w-6 h-6 text-gray-600 group-hover:text-[#EA6100]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#EA6100]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      {/* Desktop: Account for sidebar */}
      <div className="lg:ml-[280px]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and preferences</p>
          </div>

          {/* Desktop: Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Navigation (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection('account')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                      activeSection === 'account'
                        ? 'bg-[#EA6100] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User size={18} />
                      <span className="font-medium">Account</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('settings')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                      activeSection === 'settings'
                        ? 'bg-[#EA6100] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal size={18} />
                      <span className="font-medium">Settings</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('support')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                      activeSection === 'support'
                        ? 'bg-[#EA6100] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle size={18} />
                      <span className="font-medium">Support</span>
                    </div>
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} />
                      <span className="font-medium">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Section */}
              {(activeSection === 'account' || window.innerWidth < 1024) && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 lg:hidden">Account</h2>
                  {accountItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.route}
                        onClick={() => navigateTo(item.route)}
                        className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#EA6100] transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#EA6100]/10 transition-colors flex-shrink-0">
                              <Icon className="w-6 h-6 text-gray-600 group-hover:text-[#EA6100]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                {item.badge && (
                                  <span className="px-2 py-0.5 bg-[#EA6100] text-white text-xs font-medium rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#EA6100] flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Settings Section */}
              {(activeSection === 'settings' || window.innerWidth < 1024) && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                  {settingsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.route}
                        onClick={() => navigateTo(item.route)}
                        className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#EA6100] transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#EA6100]/10 transition-colors flex-shrink-0">
                              <Icon className="w-6 h-6 text-gray-600 group-hover:text-[#EA6100]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#EA6100] flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Support Section */}
              {(activeSection === 'support' || window.innerWidth < 1024) && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Support</h2>
                  {supportItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.route}
                        onClick={() => navigateTo(item.route)}
                        className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#EA6100] transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#EA6100]/10 transition-colors flex-shrink-0">
                              <Icon className="w-6 h-6 text-gray-600 group-hover:text-[#EA6100]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#EA6100] flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sign Out Button (Mobile Only) */}
              <div className="lg:hidden">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-white rounded-xl shadow-sm border border-red-200 p-5 hover:border-red-400 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-600">Sign Out</h3>
                      <p className="text-sm text-red-600/70 mt-0.5">Log out of your account</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;