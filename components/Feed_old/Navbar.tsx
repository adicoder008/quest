import React from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "../ui/navigation-menu";

const Navbar: React.FC = () => {
  return (
    <div className="bg-white shadow-sm hover:shadow-xl h-[76px] flex w-full items-center justify-between px-16 py-1.5 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/7ba09782b451dbfbc5be2cd9243cebe4ac815288?placeholderIfAbsent=true"
          alt="Logo"
          className="h-[64px] object-contain"
        />
        <div className="flex items-center border border-[#8B8A8F] bg-white rounded-full px-3 py-1.5">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/99410d3970fe67ea532993d1c196093377128b25?placeholderIfAbsent=true"
            alt="Search icon"
            className="w-5 h-5 mr-2"
          />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-[#8B8A8F] w-40"
          />
          <button className="bg-[#EA6100] text-white text-sm px-4 py-1 rounded-full ml-2">
            Search
          </button>
        </div>
      </div>
      
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-6">
          <NavigationMenuItem className="flex flex-col items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/06d56ea533aecd9a2b8ddf71ea41700f8c6b6951?placeholderIfAbsent=true"
              alt="Home icon"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600 mt-1">Home</span>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="flex flex-col items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/06d56ea533aecd9a2b8ddf71ea41700f8c6b6951?placeholderIfAbsent=true"
              alt="Groups icon"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600 mt-1">Groups</span>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="flex flex-col items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f1c2c538ee76c0ea7bf7020c040724f2ac094442?placeholderIfAbsent=true"
              alt="Notifications icon"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600 mt-1">Notifications</span>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="flex flex-col items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/06d56ea533aecd9a2b8ddf71ea41700f8c6b6951?placeholderIfAbsent=true"
              alt="Trip Planner icon"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600 mt-1">Quests</span>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="flex flex-col items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/60120c5b52eabefbdfcb273cc759ee8e7af48e75?placeholderIfAbsent=true"
              alt="Events icon"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600 mt-1">Events</span>
          </NavigationMenuItem>
          
          <div className="border-l border-gray-600 w-0.5 h-10 mx-2"></div>
          
          <NavigationMenuItem>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f2c04753faeb06e92f8c18ca0b4f344bb630c7e7?placeholderIfAbsent=true"
              alt="User avatar"
              className="w-12 h-12 rounded-full"
            />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default Navbar;

// import React from "react";
// import { Link } from "react-router-dom";
// import { Search, Home, Users, Bell, Calendar, Target } from "lucide-react";
// import { Avatar } from "./Avatar";

// const Navbar: React.FC = () => {
//   return (
//     <nav className="bg-white shadow-sm flex w-full items-center justify-between py-2 px-4 border-b border-gray-200">
//       <div className="flex items-center gap-8">
//         <Link to="/" className="flex items-center">
//           <img
//             src="/lovable-uploads/2f7a9dff-4822-4918-99db-618f77634f73.png"
//             alt="OnQuest Logo"
//             className="h-8"
//           />
//         </Link>
        
//         <div className="relative flex items-center">
//           <div className="flex items-center border rounded-full bg-gray-50 overflow-hidden">
//             <div className="flex items-center pl-3 pr-2">
//               <Search size={18} className="text-gray-400" />
//               <input 
//                 type="text" 
//                 placeholder="Search" 
//                 className="bg-transparent border-none focus:outline-none px-2 py-1.5 w-48"
//               />
//             </div>
//             <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full">
//               Search
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex items-center gap-8">
//         <div className="flex items-center gap-8 text-gray-600">
//           <Link to="/" className="flex flex-col items-center gap-0.5 text-xs">
//             <Home size={20} className="text-gray-600" />
//             <span>Home</span>
//           </Link>
//           <Link to="/groups" className="flex flex-col items-center gap-0.5 text-xs">
//             <Users size={20} className="text-gray-600" />
//             <span>Groups</span>
//           </Link>
//           <Link to="/notifications" className="flex flex-col items-center gap-0.5 text-xs">
//             <Bell size={20} className="text-gray-600" />
//             <span>Notifications</span>
//           </Link>
//           <Link to="/quests" className="flex flex-col items-center gap-0.5 text-xs">
//             <Target size={20} className="text-gray-600" />
//             <span>Quests</span>
//           </Link>
//           <Link to="/events" className="flex flex-col items-center gap-0.5 text-xs">
//             <Calendar size={20} className="text-gray-600" />
//             <span>Events</span>
//           </Link>
//         </div>
        
//         <div className="border-l border-gray-300 h-8 mx-2"></div>
        
//         {/* <Link to="/profile">
//           <Avatar className="h-9 w-9">
//             <AvatarImage src="https://github.com/shadcn.png" alt="User profile" />
//           </Avatar>
//         </Link> */}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
