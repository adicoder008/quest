'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AvatarSelector } from '@/components/AvatarSelector';
import { signUpWithEmail, signInWithGoogle } from '@/lib/authService';
import { IoClose } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';

// Auth Modal Component
const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Default avatar options
  const GOOGLE_AVATAR_OPTIONS = [
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f2c04753faeb06e92f8c18ca0b4f344bb630c7e7?placeholderIfAbsent=true",
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/7ba09782b451dbfbc5be2cd9243cebe4ac815288?placeholderIfAbsent=true",
    "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/99410d3970fe67ea532993d1c196093377128b25?placeholderIfAbsent=true"
  ];

  const handleEmailSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      if (!email || !password || !displayName) {
        throw new Error('Please fill all fields');
      }
  
      const finalAvatar = selectedAvatar || 
        GOOGLE_AVATAR_OPTIONS[Math.floor(Math.random() * GOOGLE_AVATAR_OPTIONS.length)];
      
      const user = await signUpWithEmail(email, password, displayName, finalAvatar);
      
      if (user) {
        await sendEmailVerification(user);
        setSignupSuccess(true);
      } else {
        throw new Error('Could not create user.');
      }
      
    } catch (error: any) {
      setError(error.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
        setError('');
        setIsGoogleLoading(true);
        await signInWithGoogle();
        onClose();
        router.push('/feed');
    } catch (error: any) {
        setError(error.message || 'Google sign-in failed.');
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-15 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
        {signupSuccess ? (
            <div className='text-center space-y-4'>
                <h2 className='text-2xl font-bold text-green-600'>Success!</h2>
                <p className='text-gray-700'>Your account has been created. We've sent a verification link to your email address. Please check your inbox to complete the process.</p>
                <button 
                    onClick={() => {
                        onClose();
                        router.push('/feed');
                    }}
                    className='w-full bg-blue-500 text-white rounded-lg h-12 font-medium transition-colors hover:bg-blue-600'
                >
                    Continue to App
                </button>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">Create Account</h2>
                  <button onClick={onClose}>
                    <IoClose size={24} />
                  </button>
                </div>

                <button 
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className='w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg h-12 font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                >
                    {isGoogleLoading ? 'Signing in...' : <><FcGoogle size={24} /> Continue with Google</>}
                </button>
                
                <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <div className="flex items-center border border-gray-400 rounded-lg h-10 px-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="text"
                    className="w-full outline-none text-gray-700 bg-transparent"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <AvatarSelector onSelect={(avatar: string) => setSelectedAvatar(avatar)} />

                <div className="flex items-center border border-gray-400 rounded-lg h-10 px-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="email"
                    className="w-full outline-none text-gray-700 bg-transparent"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center border border-gray-400 rounded-lg h-10 px-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="password"
                    className="w-full outline-none text-gray-700 bg-transparent"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button 
                  className={`w-full ${email && password && displayName ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 cursor-not-allowed'} rounded-lg h-12 font-medium transition-colors`}
                  disabled={!email || !password || !displayName || isLoading}
                  onClick={handleEmailSignUp}
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
                
                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <button 
                    className="text-blue-500 hover:underline"
                    onClick={() => router.push('/signIn')}
                  >
                    Sign In
                  </button>
                </p>
            </>
        )}
      </div>
    </div>
  );
};


// Hero Component
const Hero = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleActionClick = () => {
    if (currentUser) {
      router.push('/feed');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="bg-[url('/walloq1.svg')] bg-bottom flex justify-center items-center bg-cover w-screen h-[100vh] ">
      {/* <div className='NAVBAR absolute x-to '>hi</div> */}
      {/* <div className='flex flex-col ga'> */}
      
        <div className='flex flex-col gap-4 text-white text-center p-4 '>
          <h1 className='text-4xl md:text-6xl font-arsenal font-[400]'>
            Where every trip becomes a <span className='font-[500] italic  '>Story </span> worth <span className='font-[500] italic  '>sharing </span>
          </h1>
          <p className='text-lg md:text-2xl max-w-3xl mx-auto'>
            Transform chaotic travel stories into structured, shareable itineraries powered by real explorers like you
          </p>
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-4'>
            <button 
              onClick={handleActionClick}
              className='items-center text-white w-fit bg-[#EA6100] hover:bg-[#F86F0A] font-[450] rounded-3xl px-6 py-3 transition-colors'
            >
              Explore
            </button>
            <button 
              onClick={handleActionClick}
              className='items-center text-white w-fit bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 font-[450] rounded-3xl px-6 py-3 transition-colors'
            >
              Create Quest
            </button>
          </div>
        </div>
        {/* </div> */}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Hero;

