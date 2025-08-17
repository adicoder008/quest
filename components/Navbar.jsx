"use client";

import React, { useState, useEffect } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { Link,useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
// import Feed from '../pages/Feed';
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
import { SearchBar } from './Feed/SearchBar';
import useRouter from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('initial'); // 'initial', 'phone-verify', 'email-signin', 'email-signup'

  
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
    // Set active menu based on URL
    const path = location.pathname;
    if (path === "/") setSelectedSection("home");
    else if (path.includes("TripPlanner")) setSelectedSection("Trip Planner");
    else if (path.includes("Events")) setSelectedSection("Events");
    else if (path.includes("About")) setSelectedSection("About Us");
    else if (path.includes("Contact")) setSelectedSection("Contact Us");
  }, [location.pathname]);

  const toggleAuthModal = () => {
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
  };

 const handlePhoneLogin = async () => {
  try {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }


    // Update UI state
    setError('');
    setAuthStep('phone-verify');
    setIsLoading(true);

    // Send verification code
    await sendPhoneVerificationCode(`+91${phoneNumber}`, 'recaptcha-container');
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleVerifyCode = async () => {
    try {
      setError('');
      await verifyPhoneCode(verificationCode, displayName || null);
      toggleAuthModal();
      navigate('/Feed');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setError('');
      await signInWithEmail(email, password);
      toggleAuthModal();
      navigate('/Feed');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailSignUp = async (avatar) => {
    try {
      setError('');
      setIsLoading(true);
      
      // Basic validation
      if (!email || !password || !displayName) {
        throw new Error('Please fill all fields');
      }
  
      const finalAvatar = avatar || 
        GOOGLE_AVATAR_OPTIONS[Math.floor(Math.random() * GOOGLE_AVATAR_OPTIONS.length)];
      
      await signUpWithEmail(email, password, displayName, finalAvatar);
      
      // Show success message
      setError('');
      setAuthStep('initial');
      setShowAuthModal(false);
      
      // Optional: Show toast notification
      alert('Sign up successful! Welcome to our community!');
      
    } catch (error) {
      setError(error.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      toggleAuthModal();
      navigate('/Feed');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
              />
            </div>

            {/* Continue Button */}
            <button 
              className={`w-full ${phoneNumber ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!phoneNumber}
              onClick={handlePhoneLogin}
            >
              Continue
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-400"></div>
              <span className="text-gray-500 text-sm">Other login options:</span>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            {/* Google Login */}
            <button 
              className="w-full flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 shadow-md"
              onClick={handleGoogleSignIn}
            >
              <img src="google.png" alt="Google" className="w-6 h-6" />
              <span className="font-medium">Log in with Google</span>
            </button>

            {/* Email Login */}
            <button 
              className="w-full flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 shadow-md"
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
            
            {/* Verification Code Input */}
            <div className="flex items-center border border-gray-400 rounded-lg h-14 px-2">
              <input
                type="text"
                className="w-full outline-none text-gray-700"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            
            {/* For new users, ask for display name */}
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

            {/* Verify Button */}
            <button 
              className={`w-full ${verificationCode ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!verificationCode}
              onClick={handleVerifyCode}
            >
              Verify & Continue
            </button>
            
            <button 
              className="text-blue-500"
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
              className={`w-full ${email && password ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!email || !password}
              onClick={handleEmailSignIn}
            >
              Sign In
            </button>
            
            <p className="text-center">
              Don't have an account?{" "}
              <button 
                className="text-blue-500"
                onClick={() => setAuthStep('email-signup')}
              >
                Sign Up
              </button>
            </p>
            
            <button 
              className="text-blue-500"
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              className={`w-full ${email && password && displayName ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg h-14 font-medium`}
              disabled={!email || !password || !displayName}
              onClick={handleEmailSignUp}
            >
              Sign Up
            </button>
            
            <p className="text-center">
              Already have an account?{" "}
              <button 
                className="text-blue-500"
                onClick={() => setAuthStep('email-signin')}
              >
                Sign In
              </button>
            </p>
            
            <button 
              className="text-blue-500"
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
        <Link to='/' className={`hover:text-black ${selectedSection === "home" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
          onClick={() => setSelectedSection("home")}>Home</Link>
        <Link to='/TripPlanner' className={`hover:text-black ${selectedSection === "Trip Planner" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
          onClick={() => setSelectedSection("Trip Planner")}>Trip Planner</Link>
        <Link to='/Events' className={`hover:text-black ${selectedSection === "Events" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
          onClick={() => setSelectedSection("Events")}>Events</Link>
        <Link to='/About' className={`hover:text-black ${selectedSection === "About Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
          onClick={() => setSelectedSection("About Us")}>About Us</Link>
        <Link to='/contact' className={`hover:text-black ${selectedSection === "Contact Us" ? "text-orange-500 hover:text-orange-500" : "text-gray-600"}`} 
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

      {/* Sign In/Sign Up Modal */}
      {showAuthModal && (
        <>
          {/* Modal Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={toggleAuthModal}
          >
            {/* Modal Content */}
            <div 
              className="flex w-full max-w-2xl h-auto bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Image Section */}
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

              {/* Right Form Section */}
              <div className="w-full md:w-3/5 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">
                    {authStep === 'email-signup' ? 'Create Account' : 'Log in to OnQuest'}
                  </h2>
                  <button onClick={toggleAuthModal}>
                    <IoClose size={24} />
                  </button>
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {renderAuthContent()}
                
                {/* Terms - show only on initial screen */}
                {authStep === 'initial' && (
                  <p className="text-center text-sm text-gray-500">
                    By proceeding, you agree to our <span className="text-blue-500">T&C</span> and
                    <span className="text-blue-500"> Privacy policy</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;