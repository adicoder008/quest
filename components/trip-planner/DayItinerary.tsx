import React, { useState } from "react";
// import { TimeSection } from "./TimeSection";
import { HotelCard } from "./HotelCard";
import { PlaceCard } from "./PlaceCard";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ClockIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline';
// import { Routines } from "./Routines";


export interface ActivityItem {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  location?: string;
  cost?: string;
  imageUrl?: string;
  hotels?: {
    name: string;
    location: string;
    price: string;
    rating: string;
    ratingCount: string;
    image: string;
    overlay: string;
  }[];
}

// Add this interface
interface RoutineItem {
  id: string;
  CheckIn: string;
  image: string;
}

interface DayItineraryProps {
    days: {
    dayNumber: number;
    date: string;
    title: string;
    activities: ActivityItem[];
  }[];
  dayNumber: number;
  date: string;
  title: string;
  activities: ActivityItem[];
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
}


const TimeSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  toggleIcon?: string | React.ReactNode; 

  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="mb-4 bg-orange-50 p-4 rounded-lg">
    <div 
      className="flex justify-between items-center cursor-pointer py-2"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-xl font-bold italic">{title}</h3>
      </div>
      {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
    </div>
    {isOpen && <div className="mt-4">{children}</div>}
  </div>
);

const CardControls: React.FC<{
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}> = ({ onMoveUp, onMoveDown, onDelete }) => (
  <div className="flex flex-col gap-2 bg-white p-2 rounded-lg shadow">
    <button 
      onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
      className="p-1 hover:bg-gray-100 rounded flex justify-center"
      aria-label="Move up"
    >
      <ChevronUpIcon className="w-4 h-4" />
    </button>
    <button 
      onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
      className="p-1 hover:bg-gray-100 rounded flex justify-center"
      aria-label="Move down"
    >
      <ChevronDownIcon className="w-4 h-4" />
    </button>
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(); }} 
      className="p-1 hover:bg-gray-100 rounded flex justify-center text-red-500"
      aria-label="Delete"
    >
      <PlusIcon className="w-4 h-4" />
    </button>
  </div>
);

const TextCard: React.FC<{
  activity: ActivityItem;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isActive: boolean;
  onClick: () => void;
}> = ({ activity, onMoveUp, onMoveDown, onDelete, isActive, onClick }) => (
  <div 
    className={`flex gap-4 ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    onClick={onClick}
  >
    <div className="flex-1 bg-white rounded-lg shadow p-6 border-l-8 border-orange-200">
      <h4 className="font-medium text-lg mb-2">{activity.title}</h4>
      <p className="text-gray-600 mb-4">{activity.description}</p>
      <div className="flex flex-wrap gap-4">
        {activity.time && (
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            {activity.time}
          </div>
        )}
        {activity.location && (
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {activity.location}
          </div>
        )}
        {activity.cost && (
          <div className="flex items-center text-sm text-gray-500">
            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
            {activity.cost}
          </div>
        )}
      </div>
    </div>
    <CardControls onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
  </div>
);

const ImageCard: React.FC<{
  activity: ActivityItem;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isActive: boolean;
  onClick: () => void;
}> = ({ activity, onMoveUp, onMoveDown, onDelete, isActive, onClick }) => (
  <div 
    className={`flex gap-4 ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    onClick={onClick}
  >
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
      <img 
        src={activity.imageUrl} 
        alt={activity.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6 border-l-8 border-orange-200">
        <h4 className="font-medium text-lg mb-2">{activity.title}</h4>
        <p className="text-gray-600 mb-4">{activity.description}</p>
        <div className="flex flex-wrap gap-4">
          {activity.time && (
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-1" />
              {activity.time}
            </div>
          )}
          {activity.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {activity.location}
            </div>
          )}
        </div>
      </div>
    </div>
    <CardControls onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
  </div>
);

const HotelsCard: React.FC<{
  activity: ActivityItem;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isActive: boolean;
  onClick: () => void;
}> = ({ activity, onMoveUp, onMoveDown, onDelete, isActive, onClick }) => (
  <div 
    className={`flex gap-4 ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    onClick={onClick}
  >
    <div className="flex-1 bg-white rounded-lg shadow p-6 border-l-8 border-orange-200">
      <h4 className="font-medium text-lg mb-2">{activity.title}</h4>
      <p className="text-gray-600 mb-4">{activity.description}</p>
      <div className="mt-3 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {activity.hotels?.map((hotel, index) => (
            <HotelCard
              key={index}
              name={hotel.name}
              location={hotel.location}
              price={hotel.price}
              rating={hotel.rating}
              ratingCount={hotel.ratingCount}
              image={hotel.image}
              overlay={hotel.overlay}
            />
          ))}
        </div>
      </div>
    </div>
    <CardControls onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
  </div>
);
//this is the main component for the Day Itinerary
export const DayItinerary: React.FC<DayItineraryProps> = ({
  dayNumber,
  date,
  title,
  activities,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAdd,
}) => {
  // Add these state declarations at the top of your component


const [activeItemId, setActiveItemId] = useState<string | null>(null);

// Add these state declarations
const [routines, setRoutines] = useState<Array<{id: string, CheckIn: string, image: string}>>([]);
const [places, setPlaces] = useState<Array<{id: string, title: string, description: string, imageUrl: string}>>([]);



  const SECTION_KEYS = ["morning", "afternoon", "evening", "night", "other"] as const;

type SectionKey = typeof SECTION_KEYS[number];

const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
  () => Object.fromEntries(SECTION_KEYS.map((key) => [key, true])) as Record<SectionKey, boolean>
);
  const [openSection, setOpenSection] = useState<string>("morning");

  // Replace your current handleToggle with this
const handleToggle = (section: string) => {
  setOpenSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};

  // Update to match your state
const handleItemClick = (id: string) => {
  setActiveItemId(activeItemId === id ? null : id);
};

  // Group activities by time (if time exists) or use a default group
  const groupedActivities = activities.reduce((acc, activity) => {
    const time = activity.time?.toLowerCase() || 'other';
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  // Default sections to ensure all time blocks are shown
  const allSections = {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    other: "Other"
  };

  // Move routine up
  const handleMoveUpRoutine = (index: number) => {
    if (index > 0) {
      const newRoutines = [...routines];
      [newRoutines[index], newRoutines[index - 1]] = [newRoutines[index - 1], newRoutines[index]];
      setRoutines(newRoutines);
    }
  };

  // Move routine down
  const handleMoveDownRoutine = (index: number) => {
    if (index < routines.length - 1) {
      const newRoutines = [...routines];
      [newRoutines[index], newRoutines[index + 1]] = [newRoutines[index + 1], newRoutines[index]];
      setRoutines(newRoutines);
    }
  };

  // Delete routine
  const handleDeleteRoutine = (id: string) => {
    setRoutines(routines.filter((routine) => routine.id !== id));
  };

  // Move place up
  const handleMoveUpPlace = (index: number) => {
    if (index > 0) {
      const newPlaces = [...places];
      [newPlaces[index], newPlaces[index - 1]] = [newPlaces[index - 1], newPlaces[index]];
      setPlaces(newPlaces);
    }
  };

  // Move place down
  const handleMoveDownPlace = (index: number) => {
    if (index < places.length - 1) {
      const newPlaces = [...places];
      [newPlaces[index], newPlaces[index + 1]] = [newPlaces[index + 1], newPlaces[index]];
      setPlaces(newPlaces);
    }
  };

  // Delete place
  const handleDeletePlace = (id: string) => {
    setPlaces(places.filter((place) => place.id !== id));
  };

  const handleAddRoutine = (text: string) => {
    const newRoutine = { id: Date.now().toString(), CheckIn: text ,image: "default_image_url_here"};
    setRoutines([...routines, newRoutine]);
  };

  return (
    <section className="w-full overflow-hidden mt-8 px-6 py-1 max-md:max-w-full max-md:px-5">
      <h2 className="text-black text-2xl font-bold max-md:max-w-full">
        Day {dayNumber}:{" "}
        <span className="font-normal">
          {date} ({title})
        </span>
      </h2>

      <div className="w-full mt-4 max-md:max-w-full">
        <TimeSection
          title="Morning"
          icon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/1fbdce7451ea9115cd8ed19b8552faff802601b0b3f49ec9bbc0e30a686e9a0b?placeholderIfAbsent=true"
          toggleIcon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/7f07e118a72e5aa15917ae54ea7af35938eee6b092de817196d6a69f3f0c4ab2?placeholderIfAbsent=true"
          isOpen={openSection === "morning"}
          onToggle={() => handleToggle("morning")}
        >
          <div className="flex flex-col gap-3">
            <div className="bg-white shadow-[2px_4px_4px_rgba(0,0,0,0.25)] flex w-full flex-col items-stretch justify-center px-6 py-4 rounded-lg border-l-8 border-white">
              <div className="text-base text-black font-medium py-2">
                Rent a scooter (~₹400/day)
              </div>
            </div>

            <div className="shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] w-full">
              <div className="bg-white shadow-[2px_4px_4px_rgba(0,0,0,0.1)] flex w-full flex-col px-6 py-4 rounded-lg border-l-8 border-[rgba(250,132,31,1)]">
                <div className="text-base text-black font-medium py-2">
                  Check-in to hostel/guesthouse (Anjuna, Baga, or Calangute)
                </div>
                <div className="mt-1">
                  <div className="text-sm text-[rgba(139,138,143,1)]">
                    Suggested
                  </div>
                  <div className="overflow-x-auto flex gap-3 mt-2.5">
                    <HotelCard
                      name="Hotel Baga Bay"
                      location="Goa"
                      price="₹ 2,039"
                      rating="3.8/5"
                      ratingCount="40"
                      image="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/ded8dfbec0c83b36736eb7816d24317ba3499971c3b955ae179ae55d445677f2?placeholderIfAbsent=true"
                      overlay="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/ce1b110a62e3dc64506571379741db5f8aba30bb9ba86cc91e6be23b76e03b1b?placeholderIfAbsent=true"
                    />
                    {/* Add more hotel cards as needed */}
                  </div>
                  <div className="text-sm text-[rgba(53,138,233,1)] text-center mt-2.5">
                    See More
                  </div>
                </div>
              </div>
            </div>

            <PlaceCard
              id="arambol-beach"
              isActive={false}
              onMoveUp={() => console.log("Move up Arambol Beach")}
              onMoveDown={() => console.log("Move down Arambol Beach")}
              onDelete={() => console.log("Delete Arambol Beach")}
              whenClicked={(id) => console.log(`PlaceCard clicked: ${id}`)}
              image="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/3040fb0f958bb432aa81dc2446917c4a03146d3a7f41bdb05993403f1411c581?placeholderIfAbsent=true"
              title="Arambol Beach"
              description="Discover the magic of Arambol Beach – where golden sands, chill vibes, and epic sunsets await!"
            />
          </div>
        </TimeSection>

        <TimeSection
          title="Afternoon"
          icon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/8cd35b1e1cd91d36bd698c0f124d95956112a28c3dfa8b1db6919ebb9061be0c?placeholderIfAbsent=true"
          toggleIcon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/fb7b68e83f6616cf802b0d306adf8d1e72b4992c0685c951cc8905e56b8613d8?placeholderIfAbsent=true"
          isOpen={openSection === "afternoon"}
          onToggle={() => handleToggle("afternoon")}
        >
          <div className="flex flex-col gap-3">
          <PlaceCard
              id="arambol-beach"
              isActive={false}
              onMoveUp={() => console.log("Move up Arambol Beach")}
              onMoveDown={() => console.log("Move down Arambol Beach")}
              onDelete={() => console.log("Delete Arambol Beach")}
              whenClicked={(id) => console.log(`PlaceCard clicked: ${id}`)}
              image="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/3040fb0f958bb432aa81dc2446917c4a03146d3a7f41bdb05993403f1411c581?placeholderIfAbsent=true"
              title="Arambol Beach"
              description="Discover the magic of Arambol Beach – where golden sands, chill vibes, and epic sunsets await!"
            />
            <PlaceCard
              id="arambol-beach"
              isActive={false}
              onMoveUp={() => console.log("Move up Arambol Beach")}
              onMoveDown={() => console.log("Move down Arambol Beach")}
              onDelete={() => console.log("Delete Arambol Beach")}
              whenClicked={(id) => console.log(`PlaceCard clicked: ${id}`)}
              image="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/3040fb0f958bb432aa81dc2446917c4a03146d3a7f41bdb05993403f1411c581?placeholderIfAbsent=true"
              title="Arambol Beach"
              description="Discover the magic of Arambol Beach – where golden sands, chill vibes, and epic sunsets await!"
            />
          </div>
        </TimeSection>

        <TimeSection
          title="Night"
          icon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/df12da01b4042d55071f88bb4bb92985c6a6992244033a6c241a7c5c2b931875?placeholderIfAbsent=true"
          toggleIcon="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/9f8e48378c0f73444ad3d3375d2a5adce12fd34c36f5db71b322bb5d47ef6324?placeholderIfAbsent=true"
          isOpen={openSection === "night"}
          onToggle={() => handleToggle("night")}
        >
          <div className="flex flex-col gap-3">
          <PlaceCard
              id="arambol-beach"
              isActive={false}
              onMoveUp={() => console.log("Move up Arambol Beach")}
              onMoveDown={() => console.log("Move down Arambol Beach")}
              onDelete={() => console.log("Delete Arambol Beach")}
              whenClicked={(id) => console.log(`PlaceCard clicked: ${id}`)}
              image="https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/3040fb0f958bb432aa81dc2446917c4a03146d3a7f41bdb05993403f1411c581?placeholderIfAbsent=true"
              title="Arambol Beach"
              description="Discover the magic of Arambol Beach – where golden sands, chill vibes, and epic sunsets await!"
            />
            <div className="bg-white shadow-[2px_4px_4px_rgba(0,0,0,0.25)] flex w-full flex-col items-stretch justify-center px-6 py-4 rounded-lg border-l-8 border-white">
              <div className="text-base text-black font-medium py-2">
                Dinner at a beachside shack (~₹500-800)
              </div>
            </div>
          </div>
        </TimeSection>
      </div>
    </section>
  );
};
