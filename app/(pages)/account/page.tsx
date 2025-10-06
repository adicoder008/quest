import Header from '@/components/phoneComponents/header'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { IoChevronForward } from "react-icons/io5";
import { Bookmark, Check, LucideCalendarClock,  SlidersHorizontal, User } from 'lucide-react';
import { CiCircleQuestion } from 'react-icons/ci';

const page = () => {

  const name = "harshini";
  const signInLogic: any = () => {
    console.log("signIn")
  }

  return (
    <>

      <p className='text-3xl h-[107/2px] w-full bg-black font-semibold p-5 text-[#F7CEB0]'>Account</p>


      {/* if NOT logged in  */}

      {/* <div className='bg-[#121212] text-white min-h-[800px] sm:min-h-[650px] p-5'>
        <div className='bg-[#292929] justify-center rounded-xl h-[250px] p-4 my-8 mx-2 flex flex-col gap-5'>
          <div className=''>
            <p className='text-2xl  text-white text-center'>Hello, {name}</p>
            <p className='text-2xl  text-white text-center'>Start your Quest here!</p>
          </div>

          <div><button onClick={signInLogic()} className='bg-[#F7CEB0] text-black py-3 px-2 w-full  sm:max-w-[268px] text-xl rounded-3xl'>Sign In</button></div>
        </div>


        <p className='text-3xl font-semibold text-[#F7CEB0]'>Settings</p>

        <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><SlidersHorizontal className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Preferences</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>

        <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><CiCircleQuestion className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Support</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
        <Footer />
      </div> */}



      {/* If logged in  */}

      <div className='bg-[#121212] text-white  min-h-[800px] sm:min-h-[650px] p-5'>

        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><User className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Profile</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><Bookmark className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Saved Quests</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><Check className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Completed Quests</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><LucideCalendarClock className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Upcoming Quests</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><SlidersHorizontal className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Preferences</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>

        <div className='w-full flex justify-between items-center h-23 border-b-1 border-[#F7CEB0] '>
          <div className='flex gap-4 items-center mt-4'>
            <div><CiCircleQuestion className='text-[#F7CEB0]' size={28} /></div>
            <div className='text-2xl'>Support</div>
          </div>
          <div className='text-[#F7CEB0]'><IoChevronForward size={32} /></div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page
