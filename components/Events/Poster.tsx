import React from 'react';

interface PosterProps {
  imgURL: string;
  place: string;
}

const Poster: React.FC<PosterProps> = ({ place, imgURL }) => {
  return (
    <div 
      className="flex flex-col justify-end items-start w-[22vw] h-[45vh] bg-cover bg-center text-white p-4"
      style={{ backgroundImage: `url(${imgURL})` }}
    >
      <div className="text-xl font-arsenal font-[400]">{place}</div>
    </div>
  );
};

export default Poster;

