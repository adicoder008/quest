'use client'
import React from 'react'
import {AvatarSelector} from '@/components/AvatarSelector';
import {signUpWithEmail,} from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';

const page = () => {

  const router = useRouter();

  const [error, setError] = React.useState('');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [selectedAvatar, setSelectedAvatar] = React.useState(null);
  const [authStep, setAuthStep] = React.useState<'initial' | 'phone-verify' | 'email-signup'>('initial');
  const [isLoading, setIsLoading] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const resetForm = () => {
    // setAuthStep('initial');
    setPhoneNumber('');
    // setVerificationCode('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
    resetForm();
  };

  // List of default Google avatar options
  const GOOGLE_AVATAR_OPTIONS = [
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f2c04753faeb06e92f8c18ca0b4f344bb630c7e7?placeholderIfAbsent=true",
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/7ba09782b451dbfbc5be2cd9243cebe4ac815288?placeholderIfAbsent=true",
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/99410d3970fe67ea532993d1c196093377128b25?placeholderIfAbsent=true"
  ];

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
        // setError(error.message || 'Sign up failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <>
      <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">
                  Create Account
                </h2>
                <button onClick={toggleAuthModal}>
                  <IoClose size={24} />
                </button>
              </div>
            <div className="flex items-center border border-gray-400 rounded-lg h-10 px-2">
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

            <div className="flex items-center border border-gray-400 rounded-lg h-10 px-2">
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
                onClick={() => router.push('/signIn')}
              >
                Sign In
              </button>
            </p>
            
            <button 
              className="text-blue-500"
              // onClick={() => setAuthStep('initial')}
            >
              Back
            </button>
          </>
  )
}

export default page
