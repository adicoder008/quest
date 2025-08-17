import React from "react";
import UserAvatar from "./UserAvatar";

const PostCreator: React.FC = () => {
  return (
    <div className="bg-[rgba(248,249,250,1)]  border w-full max-w-[1027px] ml-1 p-3 rounded-lg border-[rgba(197,196,199,1)] border-solid ">
      <div className="rounded flex w-full items-stretch gap-3 text-base text-[#8B8A8F] font-medium flex-wrap px-2.5 py-1 max-md:max-w-full">
        <UserAvatar src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/5aef8153f7494f2ee8415d8825dbf148ce653da6?placeholderIfAbsent=true" alt="User profile" />
        <input
          type="text"
          placeholder="Share your travel experience..."
          className="self-stretch flex-1 shrink basis-[0%] bg-[rgba(248,249,250,1)] border min-w-60 gap-2.5 h-full px-2.5 py-2 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full"
        />
      </div>
      <div className="border min-h-0 w-full mt-3 border-[rgba(197,196,199,1)] border-solid max-md:max-w-full" />
      <div className="flex w-full items-center gap-[40px_100px] text-sm text-black font-normal whitespace-nowrap justify-between flex-wrap mt-3 px-2.5 max-md:max-w-full">
        <button className="self-stretch flex items-center gap-2 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/857befa969188008f0525a526084d22a719e8e0d?placeholderIfAbsent=true"
            alt="Photo icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">Photo</div>
        </button>
        <button className="self-stretch flex items-center gap-2 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/6afe99da7c5366c7ef8343658f850ec74a24a259?placeholderIfAbsent=true"
            alt="Videos icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">Videos</div>
        </button>
        <button className="self-stretch flex items-center gap-2 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/75bc2f86d9a05dc8bab3a7f02adccba627c1b59b?placeholderIfAbsent=true"
            alt="Location icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">Location</div>
        </button>
      </div>
    </div>
  );
};

export default PostCreator