import { Inter, Montserrat } from 'next/font/google'
import Script from 'next/script'
import '@/app/globals.css'
import { GamificationProvider } from '@/components/gamification/GamificationProvider'

const inter = Inter({ subsets: ['latin'] })
const mont = Montserrat({
  subsets: ['latin'],
  variable: '--font-mont',
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'OnQuest',
  description: 'Plan your perfect trip with AI assistance',
  icons: {
    icon: '/oq_logo.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={mont.variable}>
      <body className={inter.className}>
        <GamificationProvider>
          {children}
        </GamificationProvider>

        {/* ContentSquare Tracking Code */}
        {/* Replaced Hotjar with ContentSquare using Next.js Script component for better performance */}
        <Script 
          src="https://t.contentsquare.net/uxa/3cc102cf1e37a.js" 
          strategy="afterInteractive"
        />

        {/* Google Maps Script */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}