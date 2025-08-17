import React from "react";

interface HotelCardProps {
  name: string;
  location: string;
  price: string;
  rating: string;
  ratingCount: string;
  image: string;
  overlay?: string;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  name,
  location,
  price,
  rating,
  ratingCount,
  image,
  overlay,
}) => {
  return (
    <div className="items-stretch border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-white flex min-w-60 flex-col justify-center w-[264px] p-3 rounded-lg border-solid">
      <div className="w-full max-w-60">
        <div className="w-full">
          <div className="w-full overflow-hidden rounded-lg">
            <div className="flex flex-col relative z-10 aspect-[1.5] mb-[-15px] items-stretch justify-center -mt-3.5 px-[3px] py-[15px] max-md:mb-2.5">
              <img
                src={image}
                className="absolute h-full w-full object-cover inset-0"
                alt={name}
              />
              {overlay && (
                <img
                  src={overlay}
                  className="aspect-[1.81] object-contain w-full"
                  alt=""
                />
              )}
            </div>
          </div>
          <div className="flex w-full gap-[40px_42px] justify-between mt-2">
            <div className="flex items-center gap-2 font-normal w-[105px]">
              <div className="self-stretch w-[105px] my-auto">
                <div className="text-black text-sm">{name}</div>
                <div className="text-[#8B8A8F] text-xs">{location}</div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-black text-base font-medium">{price}</div>
              <div className="text-[#8B8A8F] text-xs font-normal">
                <span className="font-medium">1 room</span> per night
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 text-xs font-normal">
          <div className="self-stretch rounded bg-[rgba(40,167,69,1)] gap-2.5 text-white whitespace-nowrap my-auto px-1.5 py-0.5">
            {rating}
          </div>
          <div className="text-[#8B8A8F] self-stretch my-auto">
            {ratingCount} Ratings
          </div>
        </div>
      </div>
    </div>
  );
};