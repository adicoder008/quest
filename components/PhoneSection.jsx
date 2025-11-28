import React from 'react'

const PhoneSection = () => {
  return (
    <>
      <div className='bg-[#F86F0A]/10 py-10 px-4'>
        <div className='text-5xl pb-10 text-center font-mont font-[400] '>
          Plan, Explore, Share <span className='text-[#EA6100] font-mont font-[600]'>: The OnQuest Way</span>
        </div>
        <div className='flex justify-center items-center '>
          <img className='hidden sm:block rounded-xl w-full object-cover' src="/landscape.jpg" alt="App in landscape mode" />
          <img className='sm:hidden rounded-xl w-cover max-w-xs' src="/mob.jpg" alt="App in mobile mode" />
        </div>
      </div>
    </>
  )
}

export default PhoneSection