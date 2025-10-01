import React from "react";
import PostCard from "./PostCard";

const ImagePost: React.FC = () => {
  return (
    <div className="bg-[rgba(248,249,250,1)] border flex w-full flex-col items-stretch mt-6 p-3 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
      <div className="rounded flex w-full items-center gap-[40px_100px] justify-between flex-wrap px-2.5 py-1 max-md:max-w-full">
        <div className="self-stretch flex min-w-60 items-center gap-3 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f2c04753faeb06e92f8c18ca0b4f344bb630c7e7?placeholderIfAbsent=true"
            alt="User profile"
            className="aspect-[1] object-contain w-12 self-stretch shrink-0 my-auto rounded-[1080px]"
          />
          <div className="self-stretch flex flex-col items-stretch justify-center my-auto">
            <div className="flex items-stretch gap-2">
              <div className="text-black text-base font-medium my-auto">
                Osama Bin Laden
              </div>
              <div className="flex items-stretch gap-1 text-xs text-black font-normal whitespace-nowrap h-full">
                <div className="self-stretch bg-[rgba(248,111,10,0.1)] gap-2.5 h-full px-2 py-0.5 rounded-[48px]">
                  Scout
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fb5d4807f42056be0bda81da69d3f8948996cb45?placeholderIfAbsent=true"
                  alt="Verified"
                  className="aspect-[1] object-contain w-6 shrink-0 my-auto"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8B8A8F] font-normal justify-center">
              <div className="self-stretch my-auto">2 hours ago</div>
              <div className="self-stretch my-auto">Abottabad, Pakistan</div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex items-center gap-1 text-base text-[#F86F0A] font-medium whitespace-nowrap my-auto">
          <div className="justify-center items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] self-stretch flex gap-1 my-auto px-6 py-2.5 rounded-lg max-md:px-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/93fe1b420e0e6b56706aecad8badc446c6091b5a?placeholderIfAbsent=true"
              alt="Follow icon"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
            />
            <div className="self-stretch my-auto">Follow</div>
          </div>
          <div className="self-stretch flex w-6 shrink-0 h-6 my-auto" />
        </div>
      </div>
      <div className="self-stretch flex-1 shrink basis-[0%] w-full gap-2.5 text-sm text-black font-normal mt-3 px-2.5 py-1 max-md:max-w-full">
        Just experienced the most amazing sunrise at Mount Batur! The trek was
        challenging but totally worth it. Here are some shots from this morning.
        🌄
      </div>
      <div className="flex w-full gap-2 flex-wrap mt-3 max-md:max-w-full">
        <div className="bg-[rgba(217,217,217,1)] flex min-w-60 w-[499px] shrink h-[499px] flex-1 basis-[0%] rounded-lg" />
        <div className="bg-[rgba(217,217,217,1)] flex min-w-60 w-[498px] shrink h-[499px] flex-1 basis-[0%] rounded-lg" />
      </div>
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

export default ImagePost;
