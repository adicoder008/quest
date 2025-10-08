"use client";
import Header from '@/components/phoneComponents/header'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { useRouter } from 'next/navigation'
import { IoChevronForward } from "react-icons/io5";
import { BellRing, Bookmark, Check, ChevronLeft, Code, CreditCard, DollarSign, FileText, Globe, LifeBuoy, Lock, LucideCalendarClock, Shield, SlidersHorizontal, User } from 'lucide-react';
import { CiCircleQuestion } from 'react-icons/ci';

const Page = () => {
  const router = useRouter();

  const signInLogic = () => {
    console.log("signIn")
    // TODO
  }

  const navigateTo = (path: string) => {
    router.push(path);
  }

  return (
    <>
      <p className='text-3xl h-[107/2px] w-full bg-black font-semibold p-5 text-[#F7CEB0] flex gap-2 items-center'> <ChevronLeft onClick={() => navigateTo('/account')}  size={40}/> Support</p>
        <div className='bg-[#121212] text-white min-h-[800px] sm:min-h-[650px] p-5'>
          <div 
            onClick={() => navigateTo('account/profile')}
            className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><LifeBuoy className='text-[#F7CEB0]' size={28} /></div>
              <div className='text-2xl font-extralight'>Help Centre</div>
            </div>
            <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/saved-quests')}
            className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><Shield className='text-[#F7CEB0]' size={28} /></div>
              <div className='text-2xl font-extralight'>Privacy Policy</div>
            </div>
            <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/completed-quests')}
            className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><FileText className='text-[#F7CEB0]' size={28} /></div>
              <div className='text-2xl font-extralight'>Terms of Use</div>
            </div>
            <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/upcoming-quests')}
            className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><Code className='text-[#F7CEB0]' size={28} /></div>
              <div className='text-2xl font-extralight'>Open Source Licenses</div>
            </div>
            <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/preferences')}
            className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><CiCircleQuestion className='text-[#F7CEB0]' size={28} /></div>
              <div className='text-2xl font-extralight'>FAQs</div>
            </div>
            <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
          </div>
          <Footer />
        </div>
    </>
  )
}

export default Page