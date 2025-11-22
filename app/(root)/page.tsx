'use client'
import React from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Mid from '@/components/Mid'
import PhoneSection from '@/components/PhoneSection'
import FAQ from '@/components/FAQ'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'
import Features from '@/components/Features'


const page = () => {
  return (
    <>
  
    <Hero />
    {/* <HowItWorks /> */}
    <Features/>
    <Mid/>
    <PhoneSection/>
    <FAQ/>
    <Signup/>
    <Footer/> 

    </>
  )
}

export default page