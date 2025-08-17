import React from "react";

interface TravelerItem {
  avatar: string;
  name: string;
  description: string;
}

const TrendingTravelersWidget: React.FC = () => {
  const travelers: TravelerItem[] = [
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Adventurer, Photographer",
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Adventurer, Photographer",
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Food & Travel blogger",
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Bagpacker",
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Bagpacker",
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fbc02a19e738a1b1ce7824d6652fc236e1ccc73f?placeholderIfAbsent=true",
      name: "Osama Bin Laden",
      description: "Bagpacker",
    },
  ];

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full mt-4 pt-4 pb-5 px-3 rounded-lg border-[rgba(197,196,199,1)] border-solid">
      <h2 className="sticky top-0 bg-[rgba(248,249,250,1)] z-10 self-stretch rounded w-full gap-3 text-base text-[#333] font-medium pr-2 py-2">
        Trending Travelers
      </h2>
      <div className="w-full mt-4">
        {travelers.map((traveler, index) => (
          <div
            key={index}
            className={`flex w-full items-center gap-[40px_57px] justify-between ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            <div className="self-stretch flex items-center gap-2 my-auto">
              <img
                src={traveler.avatar}
                alt={`${traveler.name}'s avatar`}
                className="aspect-[1] object-contain w-8 self-stretch shrink-0 my-auto rounded-[1080px]"
              />
              <div className="self-stretch flex flex-col items-stretch justify-center my-auto">
                <div className="text-[#333] text-sm font-medium">
                  {traveler.name}
                </div>
                <div className="text-[#8B8A8F] text-xs font-normal">
                  {traveler.description}
                </div>
              </div>
            </div>
            <button className="self-stretch bg-[rgba(234,97,0,1)] gap-2.5 text-sm text-white font-medium whitespace-nowrap my-auto px-4 py-1 rounded-lg">
              Follow
            </button>
          </div>
        ))}
      </div>
      <button className="self-stretch border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] w-full gap-2.5 text-sm text-black font-normal mt-4 px-6 py-2 rounded-lg border-solid max-md:px-5">
        Explore more
      </button>
    </div>
  );
};

export default TrendingTravelersWidget;
