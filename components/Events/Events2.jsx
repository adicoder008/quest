import React, { useState } from 'react';
import Navbar from '../Navbar';
import { FaCalendarDay } from "react-icons/fa6";
import { IoIosCheckboxOutline } from "react-icons/io";
import { RiCheckboxBlankLine } from "react-icons/ri";
import Poster from './Poster';

const Events2 = () => {
  const [selectedTypes, setSelectedTypes] = useState([]); // Tracks selected event types

  const toggleSelection = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]
    );
  };

  const eventTypes = [
    "Music Concerts",
    "Food Festivals",
    "Tech & Startup Meetups",
    "Cultural & Heritage Events",
    "Comedy & Stand-up Shows",
    "Sports & Fitness Events",
    "Networking & Business Conferences"
  ];

  return (
    <>
      <Navbar />
      <div className='px-8'>
        <div className='py-2'>Home {'>'} Goa</div>

        <div className='bg-[#F8F9FA] shadow-md rounded-md p-5 flex justify-between'>
          <div className='RIGHT flex flex-col gap-2'>
            <div className='text-xl font-arsenal italic'><span>Goa: </span>Events & Happenings</div>
            <div className='text-[#666666]'>Discover what's happening in and around Goa.</div>
          </div>

          <div className='LEFT flex justify-center items-center'>
            <button className='items-center text-white w-fit bg-[#EA6100] hover:bg-[#F86F0A] font-[400] rounded-lg text-[0.9rem] px-4 py-2'>Follow</button>
            <div className='p-2 ml-2 rounded-lg bg-orange-500'><FaCalendarDay size={20} /></div>
          </div>
        </div>

        <div className='flex gap-4 py-4'>
          {/* LEFT SIDEBAR - EVENT FILTERS */}
          <div className='w-[25vw] LEFT flex flex-col gap-4'>
            <div>Event Type</div>
            <div>
              {eventTypes.map(type => (
                <div key={type} className='flex items-center gap-2 cursor-pointer' onClick={() => toggleSelection(type)}>
                  {selectedTypes.includes(type) ? <IoIosCheckboxOutline size={22} /> : <RiCheckboxBlankLine size={22} />}
                  {type}
                </div>
              ))}
            </div>

            <hr />

            <div className='DAY_AND_TIME'>Day and TIME
              <div className='flex flex-wrap gap-3 py-1'>
                <button className='px-3 border-[1px] border-[#C5C4C7] py-1 bg-[#F8F9FA] rounded-3xl'>Today</button>
                <button className='px-3 border-[1px] border-[#C5C4C7] py-1 bg-[#F8F9FA] rounded-3xl'>This weekend</button>
                <button className='px-3 border-[1px] border-[#C5C4C7] py-1 bg-[#F8F9FA] rounded-3xl'>Next 7 Days</button>
              </div>
            </div>

            <hr />

            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2 cursor-pointer' onClick={() => toggleSelection("Free events")}>
                {selectedTypes.includes("Free events") ? <IoIosCheckboxOutline size={22} /> : <RiCheckboxBlankLine size={22} />}
                Free events
              </div>
              <div className='flex items-center gap-2 cursor-pointer' onClick={() => toggleSelection("Paid events")}>
                {selectedTypes.includes("Paid events") ? <IoIosCheckboxOutline size={22} /> : <RiCheckboxBlankLine size={22} />}
                Paid events
              </div>
            </div>

          </div>

          {/* RIGHT SIDE - EVENT POSTERS */}
          <div className='RIGHT w-[75vw] flex flex-wrap justify-between gap-2'>
            {Array(6).fill().map((_, index) => (
              <Poster key={index} place="udaipur" imgURL="https://images.unsplash.com/photo-1584448141569-69f342da535c?q=80&w=1941&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Events2;


