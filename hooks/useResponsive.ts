// lib/hooks/useResponsive.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook to check if the screen width is above a certain breakpoint.
 * @param {number} breakpoint - The width in pixels to check against (e.g., 768 for tablets/desktops).
 * @returns {boolean} - True if the window width is greater than or equal to the breakpoint.
 */
const useResponsive = (breakpoint: number = 768): boolean => {
  // Initialize state to `false` to prevent hydration mismatch errors on the server.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // This effect only runs on the client, where `window` is available.
    const handleResize = () => {
      if (window.innerWidth >= breakpoint) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };

    // Set the initial value after the component mounts
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]); // Re-run the effect if the breakpoint changes

  return isDesktop;
};

export default useResponsive;