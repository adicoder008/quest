// app/layout.tsx
import React from 'react';
import "/home/swati/Documents/quest/app/(root)/globals.css"; // Import global styles

// This component defines the root HTML structure for your application.
// It wraps all other pages and is a Server Component by default.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Quest App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>
        {/* All your other pages will be rendered here via the 'children' prop */}
        {children}
      </body>
    </html>
  );
}