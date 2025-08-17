import React from 'react'
import Navbar from '../Navbar'
import Destination from './Destination'

const Events1 = () => {
  return (
    <>
    <Navbar/>
    <div className='flex flex-col items-center justify-center gap-5 pt-7 px-5'>
        <div className='font-arsenal italic text-3xl font-[400]'>Events & Happenings</div>
        <div className='flex justify-between border-[1px] rounded-[1.6rem] gap-4 py-1 px-3 w-[50%]'>
        <input type="search" placeholder=" Enter city name" className=' text-[1rem]' />
        <button className='items-center text-white w-fit bg-[#EA6100] hover:bg-[#F86F0A] font-[450] rounded-3xl px-3 py-2  '>Search</button>
        </div>
    </div>

    <div className='px-5 mb-5 flex flex-col gap-4'>
        <div className='flex flex-col gap-3 pt-7'>
            <div className='flex flex-col gap-[0rem]'>
            <div className='text-2xl font-arsenal'>Top destinations for your next holiday</div>
            <div>Here's where your fellow travellers are headed</div>
            </div>
            <div className=' flex gap-3 justify-center'>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
            </div>

        </div>
        {/* ....... */}
        <div className='flex flex-col gap-3 pt-7'>
            <div className='flex flex-col gap-[0rem]'>
            <div className='text-2xl font-arsenal'>Explore Events & Happenings in Your Destination City</div>
            <div>Discover events in your destination city and plan ahead!</div>
            </div>
            <div className=' flex gap-3 justify-center'>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                
            </div>
            <div className=' flex gap-3 justify-center'>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                <Destination place="udaipur" imgURL="https://plus.unsplash.com/premium_photo-1661963369594-9b25cd53be4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                
            </div>

        </div>


    </div>
      
    </>
  )
}

export default Events1
