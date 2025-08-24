import React from 'react'

const HowItWorks = () => {
  return (
    <>
      <div className='bg-[#FFFFFF]/10 py-20 pb-24 px-4'>
        <div className='text-5xl pb-10 text-center font-arsenal italic'>
          How it <span className='text-[#EA6100] font-[700 ]'>works ?</span>
        </div>
        <div className='flex flex-col md:flex-row justify-center items-center gap-6'>
          <div className='flex flex-col shadow-xl bg-[#F86F0A]/10 rounded-xl gap-3 md:w-[27vw]'>
            <img className='p-4 w-20' src="/circus.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>1. Enter Destination & Preferences</div>
            <div className='pl-4 pb-4'>Tell Mr. Pebbles where you want to go & what you love. </div>
          </div>
          <div className='flex flex-col shadow-xl bg-[#F86F0A]/10 rounded-xl gap-3 md:w-[27vw]'>
            <img className='p-4 w-20' src="/pebble.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>2. Get Itinerary from Mr. Pebbles</div>
            <div className='pl-4 pb-4'>Pebbles creates a smart itinerary specially for you.</div>
          </div>
          <div className='flex flex-col shadow-xl bg-[#F86F0A]/10 rounded-xl gap-3 md:w-[27vw]'>
            <img className='p-4 w-20' src="/suitcase.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>3. Enjoy with Real-time Assistance</div>
            <div className='pl-4 pb-4'>Navigate, split expenses & find hidden gems on the go!</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HowItWorks
