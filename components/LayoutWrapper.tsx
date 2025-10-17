// Layout wrapper component to handle responsive sidebar spacing
// This should wrap your main content in pages that use the Navbar

import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  hasNavbar?: boolean;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children, hasNavbar = true }) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Add padding-left on desktop to account for sidebar, padding-top on mobile for header */}
      <div className={hasNavbar ? "md:ml-64 lg:ml-72 xl:ml-80 pt-16 md:pt-0" : ""}>
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;