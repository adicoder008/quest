import React from 'react';
import { MapPin, MoreVertical, Star, Calendar, CalendarClock } from 'lucide-react';

interface QuestCardProps {
  location: string;
  month: string;
  year: string;
  rating: number;
  duration: string;
  backgroundImage: string;
  travelers: string[]; // Array of image URLs
  orientation?: 'landscape' | 'portrait';
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({
  location,
  month,
  year,
  rating,
  duration,
  backgroundImage,
  travelers,
  orientation = 'landscape',
  onClick
}) => {
  const isLandscape = orientation === 'landscape';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl shadow-lg group cursor-pointer ${isLandscape ? 'w-full max-w-md h-64' : 'w-40 h-56'
        }`}
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1">
            <MapPin className="text-white" size={24} fill="white" />
            <h3 className="text-white text-xl font-semibold">{location}</h3>
          </div>
          <button className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Footer */}
        <div className="space-y-2">
          {/* Date and Rating */}
          <div className="">
            <h4 className="text-white text-2xl flex">
              {month} {year}
            </h4>
            <div className='flex  items-center'>
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400" size={18} fill="#fbbf24" />
                <span className="text-white font-semibold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-white/90 text-sm">· {duration}</span>
            </div>
          </div>

          {/* Travelers and Calendar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-3">
              {travelers.map((traveler, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-400"
                >
                  <img
                    src={traveler}
                    alt={`Traveler ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <button className="bg-white right-2 bottom-2 absolute rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg">
              {orientation === 'landscape' ? (
                <CalendarClock className="text-[#A05638]" size={20} />
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;






// // Demo Component
// const QuestCardDemo = () => {
//   const londonTrip = {
//     location: 'London',
//     month: 'April',
//     year: '2026',
//     rating: 4.0,
//     duration: '7 days trip',
//     backgroundImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
//     travelers: [
//       'https://i.pravatar.cc/150?img=1',
//       'https://i.pravatar.cc/150?img=2',
//       'https://i.pravatar.cc/150?img=3',
//       'https://i.pravatar.cc/150?img=4'
//     ]
//   };

//   const maldivesTrip = {
//     location: 'Maldives',
//     month: 'Oct',
//     year: '2024',
//     rating: 4.8,
//     duration: '7 days trip',
//     backgroundImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
//     travelers: [
//       'https://i.pravatar.cc/150?img=5',
//       'https://i.pravatar.cc/150?img=6',
//       'https://i.pravatar.cc/150?img=7',
//       'https://i.pravatar.cc/150?img=8'
//     ]
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-6xl mx-auto space-y-12">
//         {/* Landscape Examples */}
//         <div>
//           <h2 className="text-white text-2xl font-bold mb-6">Landscape Cards</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <QuestCard {...londonTrip} orientation="landscape" />
//             <QuestCard {...maldivesTrip} orientation="landscape" />
//           </div>
//         </div>

//         {/* Portrait Examples */}
//         <div>
//           <h2 className="text-white text-2xl font-bold mb-6">Portrait Cards</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             <QuestCard {...londonTrip} orientation="portrait" />
//             <QuestCard {...maldivesTrip} orientation="portrait" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };