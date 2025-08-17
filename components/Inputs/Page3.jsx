'use client'
import React, { useState, useEffect } from 'react';

const Page3 = () => {
  const [selectedTransports, setSelectedTransports] = useState([]);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedTransport = localStorage.getItem('transport');
    if (savedTransport) {
      setSelectedTransports(JSON.parse(savedTransport));
    }
  }, []);

  // Save to localStorage whenever selections change
  useEffect(() => {
    localStorage.setItem('transport', JSON.stringify(selectedTransports));
  }, [selectedTransports]);

  const toggleTransport = (transport) => {
    setSelectedTransports(prev => {
      if (prev.includes(transport)) {
        return prev.filter(item => item !== transport);
      } else {
        return [...prev, transport];
      }
    });
  };

  const transportOptions = [
    { id: 'flight', src: "/Flight1.svg" },
    { id: 'train', src: "/train.svg" },
    { id: 'bus', src: "/bus1.svg" },
    { id: 'ship', src: "/ship1.svg" },
    { id: 'pv', src: "/pv1.svg" }
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='font-arsenal font-[600] italic text-3xl text-center'>
        How would you like to travel
      </div>
      <div className='text-center'>select any</div>
      <div className='flex gap-2'>
        {transportOptions.map((transport) => (
          <button
            key={transport.id}
            onClick={() => toggleTransport(transport.id)}
            className={`relative ${selectedTransports.includes(transport.id) ? 'ring-4 ring-orange-500 rounded-lg' : ''}`}
          >
            <img 
              src={transport.src} 
              className='w-[14vw] rounded-lg' 
              alt={transport.id} 
              role="checkbox"
              aria-checked={selectedTransports.includes(transport.id)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Page3;