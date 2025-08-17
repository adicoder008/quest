import React from 'react'

const Signup = () => {
  return (
    <>
    <div className="bg-cover w-screen h-[87vh] bg-[url('/boat.jpg')] flex justify-center items-center">
        <div className='flex flex-col justify-center items-center'>
        <div className='text-center text-white text-5xl font-arsenal italic sm:text-6xl'>Ready to Make Your <span className='font-[500]'>Next</span> Trip <span className='font-[500]'>Unforgettable</span>?</div>
        <div className='flex justify-center'><button className='items-center w-fit bg-[#EA6100] hover:bg-[#F86F0A] text-[1rem] font-[450] rounded-3xl px-4 py-3 text-white mt-4'>Sign Up & start planning</button></div>
        </div>
        
    </div>
    <div className='p-3 w-full bg-[#210D0D] text-white flex items-center justify-between'>
      <div className='flex'>
      <div className='font-semibold px-4'>List your business </div>   
      <div className='font-[300] hidden sm:block '>Got a business? Partner and get your business listed on OnQuest</div>
      </div>
    <div className='flex justify-center px-4'><button className='items-center w-fit bg-[#EA6100] hover:bg-[#F86F0A] text-[0.8rem] rounded-3xl px-2 py-1 text-white '>Contact us</button></div>
    </div>
    
    </>
  )
}

export default Signup
