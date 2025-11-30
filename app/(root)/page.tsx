'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import LandingNavbar from '@/components/LandingNavbar'

// Lazy load below-the-fold components
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <div className="min-h-[400px]" />
})
const Mid = dynamic(() => import('@/components/Mid'), {
  loading: () => <div className="min-h-[400px]" />
})
const PhoneSection = dynamic(() => import('@/components/PhoneSection'), {
  loading: () => <div className="min-h-[400px]" />
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <div className="min-h-[400px]" />
})
const Signup = dynamic(() => import('@/components/Signup'), {
  loading: () => <div className="min-h-[400px]" />
})
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="min-h-[200px]" />
})

const page = () => {
  return (
    <>
      <LandingNavbar />
      <Hero />
      {/* <HowItWorks /> */}
      <Features />
      <Mid />
      <PhoneSection />
      <FAQ />
      <Signup />
      <Footer />

    </>
  )
}

export default page