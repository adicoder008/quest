import  Header from '@/components/phoneComponents/header'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { MdOutlineRoomPreferences } from "react-icons/md";
import { IoChevronForward } from "react-icons/io5";
import { MdOutlineSupportAgent } from "react-icons/md";

const page = () => {
  return (
    <>
    {/* if logged in  */}
    
        {/* <div className='bg-black text-white min-h-screen p-5'>
            
              <p className='text-3xl font-semibold text-[#F7CEB0]'>ACCOUNT</p>
              
              <div className='bg-gray-600 justify-center rounded-2xl h-[250px] p-4 my-8 mx-2 flex flex-col gap-3'>
                <div className=''>
                  <p className='text-2xl font-semibold text-white text-center'>Hello Harshini</p>
                  <p className='text-2xl font-semibold text-white text-center'>Your Quest starts here</p>
                </div>

                <div><button className='bg-[#F7CEB0] text-black w-full text-2xl rounded-3xl'>Sign In</button></div>
              </div>

  
              <p className='text-3xl font-semibold text-[#F7CEB0]'>Settings</p>

              <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
                <div className='flex gap-4 items-center mt-4'>
                  <div><MdOutlineRoomPreferences size={28}/></div>
                  <div className='text-2xl'>Preferences</div>
                </div>
                <div className='text-[#F7CEB0]'><IoChevronForward  size={32}/></div>
              </div>

              <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
                <div className='flex gap-4 items-center mt-4'>
                  <div><MdOutlineSupportAgent size={28}/></div>
                  <div className='text-2xl'>Support</div>
                </div>
                <div className='text-[#F7CEB0]'><IoChevronForward  size={32}/></div>
              </div>


            

            <Footer />
        </div> */}

        <div className='bg-black text-white min-h-screen p-5'>
            
            
              <p className='text-3xl font-semibold text-[#F7CEB0]'>Settings</p>

              <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
                <div className='flex gap-4 items-center mt-4'>
                  <div><MdOutlineRoomPreferences size={28}/></div>
                  <div className='text-2xl'>Preferences</div>
                </div>
                <div className='text-[#F7CEB0]'><IoChevronForward  size={32}/></div>
              </div>

              <div className='w-full flex justify-between items-center h-23 border-b-2 border-[#F7CEB0] '>
                <div className='flex gap-4 items-center mt-4'>
                  <div><MdOutlineSupportAgent size={28}/></div>
                  <div className='text-2xl'>Support</div>
                </div>
                <div className='text-[#F7CEB0]'><IoChevronForward  size={32}/></div>
              </div>
            </div>

    
      
    </>
  )
}

export default page
