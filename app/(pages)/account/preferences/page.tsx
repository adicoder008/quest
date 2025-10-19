"use client";
import Header from '@/components/phoneComponents/header'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { useRouter } from 'next/navigation'
import { IoChevronForward } from "react-icons/io5";
import { BellRing, Bookmark, Check, ChevronLeft, CreditCard, DollarSign, Globe, Lock, LucideCalendarClock, SlidersHorizontal, User } from 'lucide-react';
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
      <p className='text-3xl h-[107/2px] w-full bg-black font-semibold p-5 text-[#EA6100] flex gap-2 items-center'> <ChevronLeft onClick={() => navigateTo('/account')}  size={40}/> Preferences</p>
        <div className='bg-[#121212] text-white min-h-[800px] sm:min-h-[650px] p-5'>
          <div 
            onClick={() => navigateTo('account/profile')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><User className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Account Info</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/saved-quests')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><Globe className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Language</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/completed-quests')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><DollarSign className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Currency</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/upcoming-quests')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><CreditCard className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Payment Preferences</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/preferences')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><BellRing className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Notifications Settings</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <div 
            onClick={() => navigateTo('account/support')}
            className='w-full flex justify-between items-center h-23 border-b-2 border-[#EA6100] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
          >
            <div className='flex gap-4 items-center mt-4'>
              <div><Lock className='text-[#EA6100]' size={28} /></div>
              <div className='text-2xl font-extralight'>Manage Privacy</div>
            </div>
            <div className='text-[#EA6100]'><IoChevronForward size={32} /></div>
          </div>

          <Footer />
        </div>
    </>
  )
}

export default Page