import React from 'react'

const Mid = () => {
  return (
    <>
      <div className='bg-[#F86F0A]/10 py-10 px-4 bg-opacity-10'>
        <div className='text-5xl pb-10 text-center font-arsenal font-[400] italic'>
          Evrything you need for a <span className='text-[#EA6100] font-[600]'>Perfect Trip !</span>
        </div>
        <div className='flex flex-col justify-center items-center gap-6 sm:flex-row'>
          <div className='flex flex-col shadow-xl w-[85vw] min-h-[45vh] bg-[#FFFFFF]/80 rounded-xl bg-opacity-80 gap-3 sm:w-[27vw]'>
            <img className='p-4 rounded-xl' src="/Mid1.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>Mr. Pebbles</div>
            <div className='pl-4 pb-4'>Meet Mr. Pebbles, your AI-powered travel companion for personalized trips!</div>
          </div>
          <div className='flex flex-col shadow-xl w-[85vw] min-h-[45vh] bg-[#FFFFFF]/80 rounded-xl bg-opacity-80 gap-3 sm:w-[27vw]'>
            <img className='p-4 rounded-xl' src="/Mid2.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>Discover Local Events</div>
            <div className='pl-4 pb-4'>Find concerts, festivals, and meetups in your destination city.</div>
          </div>
          <div className='flex flex-col shadow-xl w-[85vw] min-h-[45vh] bg-[#FFFFFF]/80 rounded-xl bg-opacity-80 gap-3 sm:w-[27vw]'>
            <img className='p-4 rounded-xl' src="/Mid3.png" alt="" />
            <div className='pl-4 text-xl font-[650]'>Group Travel Made Easy</div>
            <div className='pl-4 pb-4'>Create travel groups, chat, share locations, and split expenses effortlessly.</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Mid
