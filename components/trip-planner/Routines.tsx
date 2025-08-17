import React,{useState} from 'react'
import { HotelCard } from "./HotelCard";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaChevronUp } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";

interface RoutinesProps {
    CheckIn: string;
    id: string;
    image:string;
    isActive: boolean;
    onMoveUp: () => void; //return type is void
    onMoveDown: () => void; //return type is void
    onDelete: () => void; //return type is void
    whenClicked: (id: string) => void;
    onAdd: (text: string) => void; // Function to add new routine
  }


  export const Routines: React.FC<RoutinesProps> = ({
    CheckIn,
    image,
    id,
    isActive,
    onMoveUp,
    onMoveDown,
    onDelete,
    whenClicked,
    onAdd,
  }) => {

    const [newCheckIn, setNewCheckIn] = useState(""); // Input field state
    const [showInput, setShowInput] = useState(false); // Control input visibility
    
    const handleAdd = () => {
      if (newCheckIn.trim() !== "") {
        onAdd(newCheckIn);
        setNewCheckIn(""); // Clear input after adding
        setShowInput(false); // Hide input field
      }
    };

    return (
      <>
        {/* <div className=" w-full flex  " >
          <div className={`shadow-[2px_4px_4px_rgba(0,0,0,0.1)] bg-white  justify-between flex w-[88%] px-6 py-4 rounded-lg border-l-8 ${isActive ? "border-[rgba(250,132,31,1)]":"border-transparent"} `}  onClick={() => whenClicked(id)}>
            <div className="RIGHT flex flex-col">
              <div className="text-base text-black font-medium py-2">
                {CheckIn}
              </div >
              <img src={image}
                className="w-[23vw] rounded-xl py-4 pr-4" alt="" />
            </div>
          </div>
  
          {/* Show Controls only when this card is active */}
          {/* {isActive && (
            <div className="SCROLL_BAR h-[270px] w-[35px] bg-[#FFFFFF] shadow-2xl rounded-lg flex flex-col p-3 justify-between items-center translate-x-3 ">
              <div className="flex flex-col gap-3">
                <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }}><FaChevronUp /></button>
                <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }}><FaChevronDown /></button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }}><RiDeleteBin6Fill /></button>
            </div>
          )}
        </div> */} 
        
        <div className="w-full flex items-stretch">
  {/* Main Card */}
  <div
    className={`shadow-[2px_4px_4px_rgba(0,0,0,0.1)] bg-white justify-between flex w-[88%] px-6 py-4 rounded-lg border-l-8 ${
      isActive ? "border-[rgba(250,132,31,1)]" : "border-transparent"
    }`}
    onClick={() => whenClicked(id)}
  >
    <div className="RIGHT flex flex-col h-auto min-h-[100%]">
      <div className="text-base text-black font-medium py-2">{CheckIn}</div>
      <img src={image} className="w-[23vw] rounded-xl py-4 pr-4" alt="" />
    </div>
  </div>

  {/* SCROLL BAR should have the same height as the RIGHT div */}
  {isActive && (
    <div className="SCROLL_BAR flex flex-col justify-between items-center w-[35px] bg-[#FFFFFF] shadow-2xl rounded-lg p-3 translate-x-3 min-h-[100%]">
      <div className="flex flex-col gap-3">
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
          <FaChevronUp />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
          <FaChevronDown />
        </button>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <RiDeleteBin6Fill />
      </button>
    </div>
  )}
</div>

  
        {/* Input Field for Adding New Routine */}
      {isActive && (
        <div className="flex  mt-2">
          {showInput ? (
            <div className="flex w-[88%] py-4 px-3 rounded-lg gap-2 bg-white shadow-2xl ">
              <input
                type="text"
                className=" px-3 py-2 rounded-lg w-[88%] "
                placeholder="Enter new routine..."
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
              />
              <div className='flex justify-center '><button
                className="bg-orange-500 text-white px-4 py-2 rounded-lg "
                onClick={handleAdd}
              >
                Add
              </button>
              </div>
            </div>
          ) : (
            <div className='flex justify-center w-[88%]'><button className="flex justify-center" onClick={() => setShowInput(true)}>
              <IoIosAddCircleOutline size={30} />
            </button></div>
          )}
        </div>
        )}
      </>
    );
  };
  