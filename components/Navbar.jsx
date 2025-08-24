"use client";

import React, { useState, useEffect } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useRouter } from 'next/navigation'; // Fixed import
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { AvatarSelector } from './AvatarSelector';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  sendPhoneVerificationCode, 
  verifyPhoneCode,
  signOut,
  getCurrentUserData
} from '../lib/authService.js';
import { SearchBar } from './Feed_old/SearchBar.jsx';

// Define avatar options (since it was missing)
const GOOGLE_AVATAR_OPTIONS = [
  'https://www.gstatic.com/webp/gallery/1.jpg',
  'https://www.gstatic.com/webp/gallery/2.jpg',
  'https://www.gstatic.com/webp/gallery/3.jpg',
  'https://www.gstatic.com/webp/gallery/4.jpg',
  'https://www.gstatic.com/webp/gallery/5.jpg'
];

const Navbar = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('initial');

  // Auth states
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
    // Set active menu based on URL (for Next.js)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === "/") setSelectedSection("home");
      else if (path.includes("TripPlanner")) setSelectedSection("Trip Planner");
      else if (path.includes("Events")) setSelectedSection("Events");
      else if (path.includes("About")) setSelectedSection("About Us");
      else if (path.includes("Contact")) setSelectedSection("Contact Us");
    }
  }, []);

  const toggleAuthModal = () => {
    console.log("toggleAuthModal called, current state:", showAuthModal); // Debug log
    setShowAuthModal(!showAuthModal);
    resetForm();
  };

  const resetForm = () => {
    setAuthStep('initial');
    setPhoneNumber('');
    setVerificationCode('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setIsLoading(false);
  };

  const handlePhoneLogin = async () => {
    try {
      if (!phoneNumber || phoneNumber.length !== 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }

      setError('');
      setAuthStep('phone-verify');
      setIsLoading(true);

      await sendPhoneVerificationCode(`+91${phoneNumber}`, 'recaptcha-container');
    } catch (error) {
      console.error('Phone login error:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError('');
      setIsLoading(true);
      await verifyPhoneCode(verificationCode, displayName || null);
      toggleAuthModal();
      router.push('/feed'); // Fixed navigation for Next.js
    } catch (error) {
      console.error('Verify code error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithEmail(email, password);
      toggleAuthModal();
      router.push('/feed'); // Fixed navigation for Next.js
    } catch (error) {
      console.error('Email signin error:', error);
      setError(error.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      if (!email || !password || !displayName) {
        throw new Error('Please fill all fields');
      }

      const finalAvatar = selectedAvatar || 
        GOOGLE_AVATAR_OPTIONS[Math.floor(Math.random() * GOOGLE_AVATAR_OPTIONS.length)];
      
      await signUpWithEmail(email, password, displayName, finalAvatar);
      
      setError('');
      toggleAuthModal();
      alert('Sign up successful! Welcome to our community!');
      router.push('/feed'); // Navigate to feed after signup
      
    } catch (error) {
      console.error('Email signup error:', error);
      setError(error.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      toggleAuthModal();
      router.push('/feed'); // Fixed navigation for Next.js
    } catch (error) {
      console.error('Google signin error:', error);
      setError(error.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/'); // Navigate to home after signout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false); // Close mobile menu
  };

  const renderAuthContent = () => {
    switch (authStep) {
      case 'initial':
        return (
          <>
            {/* Phone Number Input */}
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <div className="flex items-center pr-2 border-r border-gray-400">
                <span className="text-gray-500">+91</span>
                <span className="ml-1">▼</span>
              </div>
              <input
                type="text"
                className="ml-2 w-full outline-none text-gray-500"
                placeholder="Enter Mobile Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Continue Button */}
            <button 
              className={`w-full ${phoneNumber && !isLoading ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!phoneNumber || isLoading}
              onClick={handlePhoneLogin}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-400"></div>
              <span className="text-gray-500 text-sm">Other login options:</span>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            {/* Google Login */}
            <button 
              className="w-full flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 shadow-md hover:bg-gray-50 disabled:opacity-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img src="google.png" alt="Google" className="w-6 h-6" />
              <span className="font-medium">{isLoading ? 'Signing in...' : 'Log in with Google'}</span>
            </button>

            {/* Email Login */}
            <button 
              className="w-full flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 shadow-md hover:bg-gray-50"
              onClick={() => setAuthStep('email-signin')}
            >
              <img src="mail.png" alt="Email" className="w-6 h-6" />
              <span className="font-medium">Log in with Email ID</span>
            </button>
            
            <div id="recaptcha-container"></div>
          </>
        );
        
      case 'phone-verify':
        return (
          <>
            <p className="text-gray-600">We've sent a verification code to +91 {phoneNumber}</p>
            
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="text"
                className="w-full outline-none text-gray-700"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            {!user && (
              <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
                <input
                  type="text"
                  className="w-full outline-none text-gray-700"
                  placeholder="Enter your name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <button 
              className={`w-full ${verificationCode && !isLoading ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!verificationCode || isLoading}
              onClick={handleVerifyCode}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            
            <button 
              className="text-blue-500 hover:underline"
              onClick={() => setAuthStep('initial')}
            >
              Back
            </button>
          </>
        );
        
      case 'email-signin':
        return (
          <>
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="email"
                className="w-full outline-none text-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="password"
                className="w-full outline-none text-gray-700"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              className={`w-full ${email && password && !isLoading ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!email || !password || isLoading}
              onClick={handleEmailSignIn}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <p className="text-center">
              Don't have an account?{" "}
              <button 
                className="text-blue-500 hover:underline"
                onClick={() => setAuthStep('email-signup')}
              >
                Sign Up
              </button>
            </p>
            
            <button 
              className="text-blue-500 hover:underline"
              onClick={() => setAuthStep('initial')}
            >
              Back
            </button>
          </>
        );
        
      case 'email-signup':
        return (
          <>
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="text"
                className="w-full outline-none text-gray-700"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <AvatarSelector 
              onSelect={(avatar) => setSelectedAvatar(avatar)} 
            />

            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="email"
                className="w-full outline-none text-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="password"
                className="w-full outline-none text-gray-700"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <button 
              className={`w-full ${email && password && displayName && !isLoading ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!email || !password || !displayName || isLoading}
              onClick={handleEmailSignUp}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
            
            <p className="text-center">
              Already have an account?{" "}
              <button 
                className="text-blue-500 hover:underline"
                onClick={() => setAuthStep('email-signin')}
              >
                Sign In
              </button>
            </p>
            
            <button 
              className="text-blue-500 hover:underline"
              onClick={() => setAuthStep('initial')}
            >
              Back
            </button>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="NAVBAR sticky flex justify-between shadow-md items-center px-2 mt-1.5 md:px-10">
      <div className="flex">
        <button
          className="md:hidden px-2 mt-3"
          onClick={() => setIsOpen(true)}
        >
          <RxHamburgerMenu size={30} />
        </button>

        <img src='/OQLogoNew.svg' className="w-[100px] md:w-[130px] py-[0.7rem]" alt="" />
        <div className="hidden py-[0.7rem] md:flex items-center ml-2">
          <SearchBar />
        </div>
      </div>  

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-[3vw] items-center cursor-pointer">
        <button 
          onClick={() => handleNavigation('/')} 
          className={`hover:text-black ${selectedSection === "home" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`}
        >
          Home
        </button>
        <button 
          onClick={() => handleNavigation('/TripPlanner')} 
          className={`hover:text-black ${selectedSection === "Trip Planner" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`}
        >
          Trip Planner
        </button>
        <button 
          onClick={() => handleNavigation('/Events')} 
          className={`hover:text-black ${selectedSection === "Events" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`}
        >
          Events
        </button>
        <button 
          onClick={() => handleNavigation('/About')} 
          className={`hover:text-black ${selectedSection === "About Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`}
        >
          About Us
        </button>
        <button 
          onClick={() => handleNavigation('/contact')} 
          className={`hover:text-black ${selectedSection === "Contact Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`}
        >
          Contact Us
        </button>
      </div>

      {/* User Section - Fixed click handler */}
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
              className="text-xs text-blue-500 text-left hover:underline"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="flex cursor-pointer hover:opacity-80 bg-transparent border-none p-0 items-center" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Sign-In/Up button clicked!"); // Debug log
            setShowAuthModal(true);
          }}
          style={{ background: 'none', border: 'none' }}
        >
          <img src="/UserIcon.png" className="w-[34px]" alt="User Icon" />
          <div className="flex justify-center items-center ml-2 text-black">
            Sign-In/Up
          </div>
        </button>
      )}

      {/* Mobile Sidebar */}
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
        <button
          className="absolute top-4 right-4 text-gray-600"
          onClick={() => setIsOpen(false)}
        >
          <IoClose size={24} />
        </button>

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
                className="text-sm text-blue-500 hover:underline"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-6 p-6 text-lg mt-10">
          <li className="hover:text-blue-500 cursor-pointer" onClick={() => handleNavigation('/')}>Home</li>
          <li className="hover:text-blue-500 cursor-pointer" onClick={() => handleNavigation('/TripPlanner')}>Trip Planner</li>
          <li className="hover:text-blue-500 cursor-pointer" onClick={() => handleNavigation('/Events')}>Events</li>
          <li className="hover:text-blue-500 cursor-pointer" onClick={() => handleNavigation('/About')}>About Us</li>
          <li className="hover:text-blue-500 cursor-pointer" onClick={() => handleNavigation('/contact')}>Contact Us</li>
        </ul>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={toggleAuthModal}
        >
          <div 
            className="flex w-full max-w-2xl h-auto bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hidden md:block relative w-2/5">
              <img 
                className="w-full h-full object-cover rounded-l-xl" 
                src="login.png" 
                alt="Travel" 
              />
              <div className="absolute bottom-8 left-4 text-white text-3xl">
                <i className="font-bold">Travel</i>
                <i> with us</i>
              </div>
            </div>

            <div className="w-full md:w-3/5 p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">
                  {authStep === 'email-signup' ? 'Create Account' : 'Log in to OnQuest'}
                </h2>
                <button onClick={toggleAuthModal} className="hover:bg-gray-100 p-1 rounded">
                  <IoClose size={24} />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {renderAuthContent()}
              
              {authStep === 'initial' && (
                <p className="text-center text-sm text-gray-500">
                  By proceeding, you agree to our <span className="text-blue-500">T&C</span> and
                  <span className="text-blue-500"> Privacy policy</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;