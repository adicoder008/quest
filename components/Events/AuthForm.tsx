import React from 'react'
import { IoClose } from "react-icons/io5";

type AuthFormProps = {
  type: "signIn" | "signUp";
};

const AuthForm = ({ type }: AuthFormProps) => {


    const [error, setError] = React.useState('');
    const [showAuthModal, setShowAuthModal] = React.useState(false);

    const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
    resetForm();
  };


  return (
    <>
    {type === "signUp" && (
        <div className="w-full md:w-3/5 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">
                    {type === 'signUp' ? 'Create Account' : 'Log in to OnQuest'}
                  </h2>
                  {/* close button below*/}
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
                
                
                {/* Terms - show only on initial screen */}
                
                  <p className="text-center text-sm text-gray-500">
                    By proceeding, you agree to our <span className="text-blue-500">T&C</span> and
                    <span className="text-blue-500"> Privacy policy</span>
                  </p>
                
              </div>
    )}
      
    </>
  )
}

export default AuthForm
