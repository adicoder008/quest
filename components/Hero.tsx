'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AvatarSelector } from '@/components/AvatarSelector';
import { signUpWithEmail, signInWithGoogle } from '@/lib/authService';
import { IoClose } from 'react-icons/io5';
import { FaHeart } from 'react-icons/fa';
import { MessageCircle, Share2 } from 'lucide-react';
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
      <div className="relative w-full min-h-screen overflow-hidden bg-black">
        {/* Background Image with Gradient Fade */}
        <div
          className="absolute inset-0 bg-[url('/walloq1.svg')] bg-cover bg-center bg-no-repeat opacity-60"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className='relative z-10 max-w-7xl mx-auto px-4 h-screen flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 pt-20'>

          {/* Left: Text Content */}
          <div className='flex-1 text-center md:text-left space-y-8 animate-slide-up'>
            {/* <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F7CEB0] text-sm font-medium mb-4">
              ✨ The Social Network for Travelers
            </div> */}

            <h1 className='text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight font-mont'>
              Turn your trips into <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#F7CEB0] to-[#EA6100]'>Quests</span>
            </h1>

            <p className='text-lg text-gray-300 max-w-xl mx-auto md:mx-0 leading-relaxed font-light'>
              Stop forgetting your travel stories. Build structured itineraries, share them with a community of explorers, and get inspired for your next adventure.
            </p>

            <div className='flex flex-col sm:flex-row items-center gap-4 pt-4'>
              <button
                onClick={handleActionClick}
                className='px-8 py-4 bg-[#EA6100] hover:bg-[#F86F0A] text-white rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 w-full sm:w-auto'
              >
                Start Exploring
              </button>

              <button
                onClick={handleActionClick}
                className='px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full font-medium text-lg transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2'
              >
                <span>Create Quest</span>
              </button>
            </div>
          </div>

          {/* Right: Floating "Social Card" Visual */}
          
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Hero;

