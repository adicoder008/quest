// import { Router } from 'next/navigation';
'use client'
import React, { use } from 'react'
import { useRouter } from 'next/navigation';
import { signInWithGoogle, sendPhoneVerificationCode } from '@/lib/authService';
import { IoClose } from 'react-icons/io5';

const page = () => {

  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [authStep, setAuthStep] = React.useState<'phone-login' | 'phone-verify' | 'email-signin'>('phone-login');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');



  const resetForm = () => {
    // setAuthStep('initial');
    setPhoneNumber('');
    setVerificationCode('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
    resetForm();
  };

  const handleGoogleSignIn = async () => {
    try {
      //   setError('');
      await signInWithGoogle();
      toggleAuthModal();
      router.push('/Feed');
    } catch (error) {
      //   setError(error.message);
    }
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
      // setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <>
        {/* Phone Number Input */}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">
            Log in to OnQuest
          </h2>
          <button onClick={toggleAuthModal}>
            <IoClose size={24} />
          </button>
        </div>
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
          <span className="font-medium text-black">Log in with Google</span>
        </button>

        {/* Email Login */}
        <button
          className="w-full flex justify-center items-center gap-2 border border-gray-200 rounded-lg h-12 shadow-md"
        //   onClick={() => setAuthStep('email-signin')}
        >
          <img src="mail.png" alt="Email" className="w-6 h-6" />
          <span className="font-medium text-black">Log in with Email ID</span>
        </button>

        <div id="recaptcha-container"></div>
      </>
      );
    </>
  )
}

export default page

