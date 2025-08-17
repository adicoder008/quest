import React from "react";
import {TravelerCard} from "./TravelerCard";

const TrendingTravelers: React.FC = () => {
  const travelers = [
    {
      name: "Osama Bin Laden",
      description: "Adventurer, Photographer",
      avatarSrc: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
    },
    {
      name: "Osama Bin Laden",
      description: "Adventurer, Photographer",
      avatarSrc: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
    },
    {
      name: "Osama Bin Laden",
      description: "Food & Travel blogger",
      avatarSrc: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
    },
    { name: "Osama Bin Laden", description: "Bagpacker", avatarSrc: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true" },
  ];

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full mt-4 pt-4 pb-5 px-3 rounded-lg border-[rgba(197,196,199,1)] border-solid">
      <div className="self-stretch rounded w-full gap-3 text-base text-[#333] font-medium pr-2 py-2">
        Trending Travelers
      </div>
      <div className="w-full mt-4">
        {travelers.map((traveler, index) => (
          <div key={index} className={index > 0 ? "mt-3" : ""}>
            <TravelerCard
              name={traveler.name}
              title={traveler.description}
              avatar={traveler.avatarSrc}
            />
          </div>
        ))}
      </div>
      <button className="self-stretch border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] w-full gap-2.5 text-sm text-black font-normal mt-4 px-6 py-2 rounded-lg border-solid max-md:px-5">
        Explore more
      </button>
    </div>
  );
};

export default TrendingTravelers;
