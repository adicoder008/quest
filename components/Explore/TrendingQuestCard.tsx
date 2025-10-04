import React from "react";

interface TrendingQuestCardProps {
  cardURL: string;
  cardALT: string;
  cardTitle: string;
  // The cardContent prop is no longer needed for this design,
  // but we can leave it in the interface for type safety.
  cardContent?: string;
}

const TrendingQuestCard: React.FC<TrendingQuestCardProps> = ({
  cardURL,
  cardALT,
  cardTitle,
}) => {
  // This splits a title like "Catch the Sunrise – Nandi Hills"
  // into two separate lines for styling.
  const [title, subtitle] = cardTitle.split(" – ");

  return (
    // 1. Changed dimensions and added relative positioning
    <div className="relative flex-shrink-0 w-[216px] h-[224px]  rounded-lg overflow-hidden shadow-md mr-3">
      
      {/* 2. Image now acts as a full background */}
      <img
        src={cardURL || "https://images.unsplash.com/photo-150752542803e"}
        alt={cardALT}
        className="absolute h-full w-full object-cover"
      />

      {/* 3. Added a gradient overlay for text readability */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

      {/* 4. Text is now positioned absolutely at the bottom */}
      <div className="absolute bottom-2 left-2 text-white">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {subtitle && <p className="text-xs">{subtitle}</p>}
      </div>
    </div>
  );
};

export default TrendingQuestCard;