
'use client'
import React, { useState, useEffect, Children } from "react";
import { IoClose } from "react-icons/io5";

const layout = (props: { children?: React.ReactNode }) => {
    //  const navigate = useNavigate();

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

  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
    resetForm();
  };



  return (
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
                
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {/* {renderAuthContent()} */}
                {props.children}
                
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
  )
}


export default layout
function resetForm() {
    throw new Error("Function not implemented.");
}

