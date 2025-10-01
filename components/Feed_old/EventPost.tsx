import React from "react";

const EventPost: React.FC = () => {
  return (
    <div className="bg-[rgba(248,249,250,1)] border flex w-full flex-col items-stretch mt-6 p-3 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
      <div className="rounded flex w-full items-center gap-[40px_100px] justify-between flex-wrap px-2.5 py-1 max-md:max-w-full">
        <div className="self-stretch flex min-w-60 items-center gap-3 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/c03a3266cef7816aff55b5429b8dfdf010927c1d?placeholderIfAbsent=true"
            alt="Company logo"
            className="aspect-[1] object-contain w-12 self-stretch shrink-0 my-auto rounded-[1080px]"
          />
          <div className="self-stretch flex flex-col items-stretch justify-center my-auto">
            <div className="text-black text-base font-medium">
              Cannabis Shop Inc.
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8B8A8F] font-normal justify-center">
              <div className="self-stretch my-auto">12 hours ago</div>
              <div className="self-stretch my-auto">Jahannum, Pakistan</div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex items-center gap-1 text-base text-[#F86F0A] font-medium whitespace-nowrap my-auto">
          <div className="justify-center items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] self-stretch flex gap-1 my-auto px-6 py-2.5 rounded-lg max-md:px-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/25508729880b4bd60ebfc6b9929003fff0107781?placeholderIfAbsent=true"
              alt="Follow icon"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
            />
            <div className="self-stretch my-auto">Follow</div>
          </div>
          <div className="self-stretch flex w-6 shrink-0 h-6 my-auto" />
        </div>
      </div>
      <div className="flex w-full flex-col items-stretch justify-center mt-3 px-2 py-1 max-md:max-w-full">
        <div className="flex w-full flex-col items-stretch max-md:max-w-full">
          <div className="flex flex-col items-stretch font-medium">
            <div className="text-[#242424] text-base">
              Goa Sunset Music Festival 2025
            </div>
            <div className="bg-[rgba(248,249,250,1)] border gap-2.5 text-sm text-[#8B8A8F] mt-2 px-2 py-1 rounded-[32px] border-[rgba(197,196,199,1)] border-solid">
              Music Festival
            </div>
          </div>
          <div className="w-full text-sm text-[#242424] font-normal leading-[21px] mt-3 max-md:max-w-full">
            <div className="text-ellipsis self-stretch flex-1 shrink basis-[0%] w-full gap-1.5 max-md:max-w-full">
              Get ready for the ultimate beachside music experience! The Goa
              Sunset Music Festival brings top international and Indian DJs to
              Goa's most stunning shores. Dance to the beats of EDM, house, and
              techno as the sun sets over Vagator Beach.
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2 mt-3 max-md:max-w-full">
        <div className="bg-[rgba(217,217,217,1)] flex min-h-[300px] min-w-60 w-full flex-1 shrink basis-[0%] rounded-lg max-md:max-w-full" />
      </div>
      <button className="self-stretch bg-[rgba(234,97,0,1)] w-full gap-2.5 text-base text-white font-medium mt-3 px-4 py-2.5 rounded-lg max-md:max-w-full">
        Learn More
      </button>
      <div className="border min-h-px w-full mt-3 border-[rgba(197,196,199,1)] border-solid max-md:max-w-full" />
      <div className="flex items-center gap-4 text-sm text-black font-normal whitespace-nowrap mt-3">
        <div className="self-stretch flex items-center gap-1 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/2e58d7a52d1a9018924c7a57b7ba63117ac8285a?placeholderIfAbsent=true"
            alt="Like"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">2.5k</div>
        </div>
        <div className="self-stretch flex items-center gap-1 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/0bcccd2bd08831ebf8517d6eb81a6338422aa57c?placeholderIfAbsent=true"
            alt="Comment"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">184</div>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/3170fdb966acdf6b65c5e07892a84022d5d37db9?placeholderIfAbsent=true"
          alt="Share"
          className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
        />
      </div>
    </div>
  );
};

export default EventPost;
