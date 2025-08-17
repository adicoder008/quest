'use client'
import React from 'react'
import { FaSquareInstagram } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Footer = () => {
const handleJoinNowClick = () => {
    window.open("https://chat.whatsapp.com/IdXwbOZ2TdG70cYOet0efA", "_blank");
};

const handleinsta = () => {
    window.open("https://www.instagram.com/onquest.in?igsh=dzBzNWZlbWsxcWk0", "_blank");
};

const handleX = () => {
    window.open("https://x.com/OnQuest494568", "_blank");
};

const handleLinkedIn = () => {
    window.open("https://www.linkedin.com/company/onquestdotin/", "_blank");
};

return (
    <>
        <div className='FOOTER flex flex-col'>
            <div className=' flex justify-around sm:justify-between'>
                <div className='LEFT-HALF flex items-center flex-col sm:flex-row '>
                    <img src="/OQLogoNew.svg" className='w-48 p-4' alt="" />
                    <div className='flex flex-col px-[4vw] py-[3vw] gap-2'>
                        <div className='font-semibold text-2xl'>Stay Updated!</div>
                        <div className='w-[25vw]'>Join our community for the latest events and offers.</div>
                        <button className='items-center w-fit bg-[#EA6100] hover:bg-[#F86F0A] text-[0.8rem] rounded-3xl px-2 py-1 text-white ' onClick={handleJoinNowClick}>Join Now</button>
                    </div>
                </div>
                <div className='RIGHT-HALF flex flex-col justify-center sm:flex-row'>
                    <div className='flex flex-col pl-[4vw] py-[3vw]'>
                        <div className='font-bold'>EXPLORE</div>
                        <ul>Home</ul>
                        <ul>Trip Planner</ul>
                        <ul>Events</ul>
                        <ul>About Us</ul>
                        <ul>Contact Us</ul>
                    </div>
                    <div className='flex flex-col px-[4vw] py-[3vw]'>
                        <div className='font-bold'>LEGAL</div>
                        <ul>Privacy Policy</ul>
                        <ul>Terms of service</ul>
                    </div>
                </div>
            </div>
            <div className='flex flex-col'>
                <div className='flex gap-4 items-center justify-center'>
                    <ul className='hover:text-gray-700 cursor-pointer'><FaSquareInstagram size={30} onClick={handleinsta} /></ul>
                    <ul className='hover:text-gray-700 cursor-pointer'><FaLinkedin size={30} onClick={handleLinkedIn}/></ul>
                    {/* <ul><FaFacebookSquare size={30}/></ul> */}
                    <ul className='hover:text-gray-700 cursor-pointer'><FaSquareXTwitter size={30} onClick={handleX} /></ul>
                </div>
                <div className='p-5 text-center'>© 2025 OnQuest. All rights reserved. The content, trademarks, and intellectual property on this platform are owned by OnQuest and are protected under applicable copyright laws.</div>
            </div>
        </div>
    </>
);
}

export default Footer
