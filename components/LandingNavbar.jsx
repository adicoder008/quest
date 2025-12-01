
import React from 'react';
import Link from 'next/link';

const LandingNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-2 md:px-12 backdrop-blur-md bg-black/10 border-b border-white/10">
            {/* Left Side: Logo */}
            <div className="flex items-center">
                <img
                    src="/OQ_LOGO_MAIN.svg"
                    alt="OnQuest Logo"
                    className="h-12 md:h-16 w-auto"
                />
            </div>

            {/* Right Side: Get Started Button */}
            <div>
                <Link href="/signUp">
                    <button className="bg-[#EA6100] hover:bg-[#d95a00] text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 shadow-lg">
                        Get Started
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default LandingNavbar;
