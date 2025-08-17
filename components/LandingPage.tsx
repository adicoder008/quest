'use client'
import React from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Mid from '@/components/Mid'
import PhoneSection from '@/components/PhoneSection'
import FAQ from '@/components/FAQ'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'


const LandingPage = () => {
  return (
    <>
    <Navbar />
    <Hero />
    <HowItWorks />
    <Mid/>
    <PhoneSection/>
    <FAQ/>
    <Signup/>
    <Footer/>

    </>
  )
}

export default LandingPage
