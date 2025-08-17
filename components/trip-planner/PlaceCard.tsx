// import React,{useState} from "react";
// import { RiDeleteBin6Fill } from "react-icons/ri";
// import { FaChevronUp } from "react-icons/fa6";
// import { FaChevronDown } from "react-icons/fa6";
// import { IoIosAddCircleOutline } from "react-icons/io";

// interface PlaceCardProps {
//   image: string;
//   title: string;
//   description: string;
//   id: string;
//     onMoveUp: () => void; //return type is void
//     onMoveDown: () => void; //return type is void
//     onDelete: () => void; //return type is void
// }

// export const PlaceCard: React.FC<PlaceCardProps> = ({
//   image,
//   title,
//   description,
//   id,
//   onMoveUp,
//   onMoveDown,
//   onDelete,
// }) => {

//   const [isActive, setIsActive] = useState(false);

//   return (
//     <>
//     <div className="flex w-[605px] max-w-full items-center gap-3 text-base">
//       <div className="self-stretch flex min-w-60 w-[605px] gap-3 my-auto max-md:max-w-full">
//         <div className="bg-[rgba(248,249,250,1)] shadow-[2px_4px_4px_rgba(0,0,0,0.25)] flex min-w-60 w-full gap-2 justify-center flex-wrap flex-1 shrink basis-[0%] px-6 py-4 rounded-lg border-l-8 border-[rgba(248,249,250,1)] max-md:max-w-full max-md:px-5">
//           <div className="overflow-hidden text-white font-semibold w-[200px] rounded-lg">
//             <div className="flex flex-col relative aspect-[1.504] w-[200px]">
//               <img
//                 src={image}
//                 className="absolute h-full w-full object-cover inset-0"
//                 alt={title}
//               />
//               <div className="relative pt-[105px] pb-[9px] px-3.5 rounded-lg max-md:pr-5 max-md:pt-[100px]">
//                 {title}
//               </div>
//             </div>
//           </div>
//           <div className="flex min-w-60 flex-col items-stretch text-black font-medium leading-6 justify-center flex-1 shrink basis-[0%]">
//             <div className="w-full">
//               <div className="flex w-full items-center gap-4">
//                 <div className="self-stretch flex-1 shrink basis-[0%] min-w-60 w-full gap-2.5 my-auto py-2">
//                   {description}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//     </div>
//     {isActive && (<div className="SCROLL_BAR h-[330px] w-[35px] bg-[#FFFFFF] shadow-2xl rounded-lg flex flex-col p-3 justify-between items-center translate-x-3 translate-y-4">
//                             <div className="flex flex-col gap-3">
//                             <button onClick={(e) => {e.stopPropagation();onMoveUp()}}><FaChevronUp/></button>
//                             <button onClick={(e) => {e.stopPropagation();onMoveDown()}}><FaChevronDown /></button>
//                             </div>
//                             <button onClick={(e) => {e.stopPropagation();onDelete()}}><RiDeleteBin6Fill /></button>
//                           </div>)}
                      
//                       {isActive && (<button className='flex justify-center ' ><IoIosAddCircleOutline size={30}/></button>)}
//     </>
    
//   );
// };

import React, { useState } from "react";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";

interface PlaceCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  isActive: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: (id: string) => void;
  whenClicked: (id: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  id,
  image,
  title,
  isActive,
  description,
  onMoveUp,
  onMoveDown,
  onDelete,
  whenClicked,
}) => {
  // const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="flex flex-col w-[605px] max-w-full items-center gap-3 text-base relative"
      onClick={() => whenClicked(id)}
    >
      <div className="self-stretch flex w-[96%] gap-3 my-auto ">
        <div className="bg-[rgba(248,249,250,1)] shadow-[2px_4px_4px_rgba(0,0,0,0.25)] flex min-w-60 w-full gap-2 justify-center flex-wrap flex-1 shrink basis-[0%] px-6 py-4 rounded-lg border-l-8 border-[rgba(248,249,250,1)] max-md:max-w-full max-md:px-5">
          <div className="overflow-hidden text-white font-semibold w-[200px] rounded-lg">
            <div className="flex flex-col relative aspect-[1.504] w-[200px]">
              <img
                src={image}
                className="absolute h-full w-full object-cover inset-0"
                alt={title}
              />
              <div className="relative pt-[105px] pb-[9px] px-3.5 rounded-lg max-md:pr-5 max-md:pt-[100px]">
                {title}
              </div>
            </div>
          </div>
          <div className="flex min-w-60 flex-col items-stretch text-black font-medium leading-6 justify-center flex-1 shrink basis-[0%]">
            <div className="w-full">
              <div className="flex w-full items-center gap-4">
                <div className="self-stretch flex-1 shrink basis-[0%] min-w-60 w-full gap-2.5 my-auto py-2">
                  {description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isActive && (
        <div className="SCROLL_BAR h-[170px] w-[35px] bg-[#FFFFFF] shadow-2xl rounded-lg flex flex-col p-3 justify-between items-center absolute right-[-40px] top-0">
          <div className="flex flex-col gap-3">
            <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
              <FaChevronUp />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
              <FaChevronDown />
            </button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(id); }}>
            <RiDeleteBin6Fill />
          </button>
        </div>
      )}

      {isActive && (
        <button className="flex justify-center">
          <IoIosAddCircleOutline size={30} />
        </button>
      )}
    </div>
  );
};

