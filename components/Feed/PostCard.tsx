import React, { ReactNode } from "react";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";

interface PostCardProps {
  username: string;
  userType?: string;
  timeAgo: string;
  location: string;
  avatarSrc: string;
  children: ReactNode;
  headerColor?: string;
  headerTextColor?: string;
  userTypeColor?: string;
  userTypeBgColor?: string;
  followIconSrc?: string;
  rightContent?: ReactNode;
}

const PostCard: React.FC<PostCardProps> = ({
  username,
  userType,
  timeAgo,
  location,
  avatarSrc,
  children,
  headerColor = "bg-[rgba(84,63,29,1)]",
  headerTextColor = "text-white",
  userTypeColor = "text-[#402B09]",
  userTypeBgColor = "bg-[rgba(250,132,31,1)]",
  followIconSrc = "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/43088dafe1133bb262ab65a23550d91b626404c4?placeholderIfAbsent=true",
  rightContent,
}) => {
  return (
    <div className="border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[#F8F9FA] self-center flex max-w-full w-[1027px] gap-1.5 flex-wrap mt-6 p-3 rounded-lg border-solid">
      <div className="flex flex-col items-stretch flex-1 shrink basis-[0%] max-md:max-w-full">
        <div
          className={`${headerColor} flex w-full items-center gap-[40px_100px] justify-between flex-wrap px-3 py-2 rounded-[8px_8px_0px_0px] max-md:max-w-full`}
        >
          <div className="self-stretch flex min-w-60 items-center gap-3 my-auto">
            <UserAvatar src={avatarSrc} alt={username} />
            <div className="self-stretch flex flex-col items-stretch justify-center  my-auto">
            <div className="flex w-full items-center justify-between gap-2">
            <div className={`${headerTextColor} text-base font-medium`}>
              {username}
            </div>

              {userType && (
                <div className="flex items-center gap-1 text-xs font-normal whitespace-nowrap">
                  <div
                    className={`px-2 py-0.5 rounded-full ${userTypeBgColor} ${userTypeColor}`}
                  >
                    {userType}
                  </div>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/0ca32467b995d395e7e386446ed15b35165a05d6?placeholderIfAbsent=true"
                    alt="Verified"
                    className="w-4 h-4 object-contain"
                  />
                </div>
              )}
              </div>

              <div
                className={`flex items-center gap-2 text-xs ${headerTextColor === "text-white" ? "text-[#F8F9FA]" : "text-[#543F1D]"} font-normal`}
              >
                <div className="self-stretch my-auto">{timeAgo}</div>
                <div className="self-stretch my-auto">{location}</div>
              </div>
            </div>
          </div>
          <div className="self-stretch flex items-center gap-1 text-base font-medium whitespace-nowrap my-auto">
            <FollowButton iconSrc={followIconSrc} className={headerTextColor} />
            <div className="self-stretch flex w-6 shrink-0 h-6 my-auto" />
          </div>
        </div>

        {children}

        <div className="border min-h-0 w-full mt-3 border-[rgba(197,196,199,1)] border-solid max-md:max-w-full" />
        <div className="flex items-center gap-4 text-sm text-black font-normal whitespace-nowrap mt-3 px-2">
          <div className="self-stretch flex items-center gap-1 my-auto">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/b6221d225e7d793aedf4d30d75efbd43c4cdcc16?placeholderIfAbsent=true"
              alt="Like"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
            />
            <div className="self-stretch my-auto">2.5k</div>
          </div>
          <div className="self-stretch flex items-center gap-1 my-auto">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/da713a1ae72631a78d362180540ae9ff3e5dd653?placeholderIfAbsent=true"
              alt="Comment"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
            />
            <div className="self-stretch my-auto">184</div>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/cf300cdc79894611faa2ee5661248487a60f8ebb?placeholderIfAbsent=true"
            alt="Share"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
        </div>
      </div>

      <div className="min-h-[324px] w-0">
        {Array(32)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`border min-h-1 w-0 ${i > 0 ? "mt-1.5" : ""} border-[rgba(139,138,143,1)] border-solid ${i === 6 || i === 16 || i === 22 || i === 27 ? "max-w-full" : ""}`}
            />
          ))}
      </div>

      {rightContent}
    </div>
  );
};

export default PostCard;
