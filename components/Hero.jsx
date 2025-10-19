'use client'
import React from 'react'

const Hero = () => {
  return (
    <>
      <div className="bg-[url('/walloq1.svg')] bg-bottom flex justify-center items-center bg-cover w-screen h-[90vh] ">
        <div className='flex flex-col gap-4 text-white'>
          <div className='text-6xl text-center md:text-6xl font-arsenal font-[400]'>
            Where every <span className='font-[500] italic '>Journey</span> becomes a <span className='font-[500] italic '>Quest</span>
          </div>
          <div className='text-2xl text-center md:text-2xl'>
            Transform Chaotic travel stories into structured, shareable itineraries powered by real explorers like you
          </div>
          <div className='flex justify-center gap-4'>
            <button className='items-center text-white w-fit bg-[#EA6100] hover:bg-[#F86F0A] font-[450] rounded-3xl px-4 py-3'>
              Explore Quests
            </button>
            <button className='items-center text-white w-fit bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 font-[450] rounded-3xl px-4 py-3'>
              Start Your Own Quest
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
