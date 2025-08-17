import React from 'react';

interface DestinationProps {
  imgURL: string;
  place: string;
}

const Destination: React.FC<DestinationProps> = ({ place, imgURL }) => {
  return (
    <div 
      className="flex flex-col justify-end items-start w-[24vw] h-[30vh] bg-cover bg-center rounded-lg text-white p-4"
      style={{ backgroundImage: `url(${imgURL})` }}
    >
      <div className="text-xl font-arsenal font-[400]">{place}</div>
    </div>
  );
};

export default Destination;


