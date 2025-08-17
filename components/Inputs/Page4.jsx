'use client'
import React, { useState, useEffect } from 'react';
import { IoMdPerson } from "react-icons/io";
import { SiTicktick } from "react-icons/si";
import { FaHeart, FaUserFriends } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";

const Page4 = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const savedTypes = localStorage.getItem('travelTypes');
    if (savedTypes) {
      setSelectedTypes(JSON.parse(savedTypes));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('travelTypes', JSON.stringify(selectedTypes));
  }, [selectedTypes]);

  const toggleSelection = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const travelOptions = [
    { 
      id: 'solo',
      icon: <IoMdPerson size={28} />,
      label: 'Solo trip'
    },
    { 
      id: 'partner',
      icon: <FaHeart size={20} />,
      label: 'Partner trip'
    },
    { 
      id: 'friends',
      icon: <FaUserFriends size={26} />,
      label: 'Friends trip'
    },
    { 
      id: 'family',
      icon: <MdFamilyRestroom size={30} />,
      label: 'Family trip'
    }
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='font-arsenal font-[600] text-3xl text-center'>
        Who are you traveling with?
      </div>
      <div className='text-center'>select one</div>
      <div className='flex gap-2'>
        {travelOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleSelection(option.id)}
            className={`w-[14vw] bg-[#F8F9FA] shadow-xl h-28 border-2 rounded-lg flex flex-col justify-center gap-2 px-3 transition-all ${
              selectedTypes.includes(option.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-transparent'
            }`}
            role="checkbox"
            aria-checked={selectedTypes.includes(option.id)}
          >
            <div className="relative">
              {option.icon}
              <SiTicktick 
                size={16} 
                className={`absolute top-0 right-0 text-blue-500 ${
                  selectedTypes.includes(option.id) ? 'block' : 'hidden'
                }`}
              />
            </div>
            <div>{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Page4;