'use client'
import React from 'react'
import Link from 'next/link';
import { RxHamburgerMenu } from 'react-icons/rx';
import { IoClose } from 'react-icons/io5';
import { SearchBar } from './Feed/SearchBar';
import { signOut,getCurrentUserData } from '@/lib/authService';
import { useState,useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Nav = () => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedSection, setSelectedSection] = React.useState("home");
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    // const [authStep, setAuthStep] = React.useState('initial'); // 'initial', 'phone-verify', 'email-signin', 'email-signup'
    const [user, setUser] = React.useState<any>(null);
    const [userData, setUserData] = React.useState<{ uid: string; displayName?: string; email?: string; photoURL?: string } | null>(null);
    const [loading, setLoading] = React.useState(true);
    // const [displayName, setDisplayName] = useState('');
    
    // Monitor auth state
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser:any) => {
          setUser(currentUser);
          
          if (currentUser) {
            try {
              const userDetails = await getCurrentUserData();
              setUserData(userDetails);
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else {
            setUserData(null);
          }
          
          setLoading(false);
        });
        
        return () => unsubscribe();
      }, []);
    
    
      useEffect(() => {
        // Set active menu based on URL
        const path = location.pathname;
        if (path === "/") setSelectedSection("home");
        else if (path.includes("TripPlanner")) setSelectedSection("Trip Planner");
        else if (path.includes("Events")) setSelectedSection("Events");
        else if (path.includes("About")) setSelectedSection("About Us");
        else if (path.includes("Contact")) setSelectedSection("Contact Us");
      }, [location.pathname]);

    const handleSignOut = async () => {
        try {
          await signOut();
        } catch (error) {
          console.error("Error signing out:", error);
        }
      };
    

    const toggleAuthModal = () => {
        setShowAuthModal(!showAuthModal);
    };

  return (
    <>
    <div className="NAVBAR sticky flex justify-between shadow-md items-center px-2 md:px-10">
          <div className="flex">
            {/* Hamburger Menu */}
            <button
              className="md:hidden px-2 mt-3"
              onClick={() => setIsOpen(true)}
            >
              <RxHamburgerMenu size={30} />
            </button>
    
            <img src='/OQLogoNew.svg' className="w-[100px] md:w-[130px] py-[0.7rem]" alt="" />
            <div className="hidden  py-[0.7rem] md:flex items-center ml-2">
            <SearchBar />
            </div>
           
    
          </div>  
    
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-[3vw]  items-center cursor-pointer">
            <Link href='/' className={`hover:text-black ${selectedSection === "home" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
              onClick={() => setSelectedSection("home")}>Home</Link>
            <Link href='/TripPlanner' className={`hover:text-black ${selectedSection === "Trip Planner" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
              onClick={() => setSelectedSection("Trip Planner")}>Trip Planner</Link>
            <Link href='/Events' className={`hover:text-black ${selectedSection === "Events" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
              onClick={() => setSelectedSection("Events")}>Events</Link>
            <Link href='/About' className={`hover:text-black ${selectedSection === "About Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
              onClick={() => setSelectedSection("About Us")}>About Us</Link>
            <Link href='/contact' className={`hover:text-black ${selectedSection === "Contact Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
              onClick={() => setSelectedSection("Contact Us")}>Contact Us</Link>
          </div>
    
          {/* User Section */}
          {loading ? (
            <div className="h-[34px] w-[100px] bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center cursor-pointer">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  className="w-[34px] h-[34px] rounded-full" 
                  alt="User" 
                />
              ) : (
                <div className="w-[34px] h-[34px] bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {userData?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex flex-col ml-2">
                <span className="text-sm font-medium">{userData?.displayName || 'User'}</span>
                <button 
                  className="text-xs text-blue-500 text-left"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex cursor-pointer" onClick={toggleAuthModal}>
              <img src="/UserIcon.png" className="w-[34px]" alt="" />
              <div className="flex justify-center items-center ml-2">
                Sign-In/Up
              </div>
            </div>
          )}
    
          {/* Mobile Sidebar (Sliding Menu) */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-30 ${
              isOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setIsOpen(false)}
          ></div>
    
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={24} />
            </button>
    
            {/* User Info (if logged in) */}
            {user && (
              <div className="flex items-center p-4 border-b">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    className="w-[40px] h-[40px] rounded-full" 
                    alt="User" 
                  />
                ) : (
                  <div className="w-[40px] h-[40px] bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {userData?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </div>
                )}
                <div className="ml-2">
                  <div className="font-medium">{userData?.displayName || 'User'}</div>
                  <button 
                    className="text-sm text-blue-500"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
    
            {/* Menu Items */}
            <ul className="flex flex-col gap-6 p-6 text-lg mt-10">
              <li className="hover:text-blue-500 cursor-pointer">Home</li>
              <li className="hover:text-blue-500 cursor-pointer">Trip Planner</li>
              <li className="hover:text-blue-500 cursor-pointer">Events</li>
              <li className="hover:text-blue-500 cursor-pointer">About Us</li>
              <li className="hover:text-blue-500 cursor-pointer">Contact Us</li>
            </ul>
          </div>
    
          
        </div>
      
    </>
  )
}

export default Nav
