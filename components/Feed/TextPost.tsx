import React from "react";
import PostCard from "./PostCard";

interface TextPostProps {
  headerColor?: string;
  headerTextColor?: string;
  userTypeColor?: string;
  userTypeBgColor?: string;
  followIconSrc?: string;
  rightContent?: React.ReactNode;
}

const TextPost: React.FC<TextPostProps> = ({
  headerColor = "bg-[rgba(84,63,29,1)]",
  headerTextColor = "text-white",
  userTypeColor = "text-[#402B09]",
  userTypeBgColor = "bg-[rgba(250,132,31,1)]",
  followIconSrc = "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/43088dafe1133bb262ab65a23550d91b626404c4?placeholderIfAbsent=true",
  rightContent,
}) => {
  const postContent = (
    <div className="  w-full gap-2.5 text-sm text-black font-normal leading-[21px] mt-3 px-2.5 py-1 ">
      Just experienced the most unforgettable sunrise at the summit of Mount
      Batur in Bali! 🌄 We started the trek in the early hours of the morning,
      guided only by flashlights and the sound of crunching gravel beneath our
      feet. The climb was steep and challenging at times, especially in the
      darkness, but the anticipation of what was waiting at the top kept us
      going.
      <br />
      As we reached the peak, a gentle breeze greeted us, and the sky slowly
      began to shift from deep indigo to soft hues of lavender, pink, and fiery
      orange. Then came the moment—when the sun finally peeked over the horizon,
      casting a golden glow across the landscape and revealing layers of
      mist-covered valleys and distant volcanic peaks. It was peaceful,
      powerful, and completely awe-inspiring.
      <br />
      Sitting above the clouds with a cup of hot coffee in hand, watching the
      first light of day stretch across Bali,...
    </div>
  );

  const defaultRightContent = (
    <div className=" text-2xl text-white font-bold whitespace-nowrap w-[248px]">
      <div className="self-stretch bg-[rgba(84,63,29,1)] min-h-16 max-w-full w-[248px] px-3 py-3.5 rounded-[8px_8px_0px_0px]">
        Memories
      </div>
      <div className="bg-[rgba(217,217,217,1)] flex min-h-[248px] w-[248px] aspect-[1] mt-3 rounded-lg" />
    </div>
  );

  return (
    <PostCard
      username="Osama Bin Laden"
      userType="Scout"
      timeAgo="2 hours ago"
      location="Abottabad, Pakistan"
      avatarSrc="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/f2c04753faeb06e92f8c18ca0b4f344bb630c7e7?placeholderIfAbsent=true"
      headerColor={headerColor}
      headerTextColor={headerTextColor}
      userTypeColor={userTypeColor}
      userTypeBgColor={userTypeBgColor}
      followIconSrc={followIconSrc}
      rightContent={rightContent || defaultRightContent}
    >
      {postContent}
    </PostCard>
  );
};

export default TextPost;
