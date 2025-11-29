'use client'
import React from 'react'
import Nav from '@/components/LeftSideNav'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Mid from '@/components/Mid'
import PhoneSection from '@/components/PhoneSection'
import FAQ from '@/components/FAQ'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'
import Features from '@/components/Features'


import LandingNavbar from '@/components/LandingNavbar'

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