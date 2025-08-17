import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { getUserData, getUserPosts } from "../../../lib/firebaseSerive";

interface Post {
  id: string;
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
  photoUrl?: string;
  createdAt: any;
  likeCount: number;
  commentCount: number;
  location?: string;
  following?: boolean;
  followers?: string[];
}

const ActivitySection: React.FC<{ uid: string }> = ({ uid }) => {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user posts
      const userPosts = await getUserPosts(uid);
      // Ensure each post has all required Post fields
      const formattedPosts: Post[] = userPosts.map((post: any) => ({
        id: post.id,
        uid: post.uid || "",
        userName: post.userName || "",
        userProfilePic: post.userProfilePic || "",
        text: post.text || "",
        photoUrl: post.photoUrl,
        createdAt: post.createdAt,
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
        location: post.location,
        following: post.following,
        followers: post.followers,
      }));
      setPosts(formattedPosts);
      
      // Fetch followers count (you'll need to implement this)
      const userData = await getUserData(uid);
      setFollowersCount(userData?.followers?.length || 0);
    };
    fetchData();
  }, [uid]);

  return (
    <div className="bg-[rgba(248,249,250,1)] border flex w-full flex-col overflow-hidden items-stretch mt-3 pl-6 py-6 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full max-md:pl-5">
      <div className="flex w-full items-center gap-[40px_100px] justify-between flex-wrap max-md:max-w-full">
        <div className="self-stretch my-auto">
          <h2 className="text-black text-xl font-medium">Activity</h2>
          <div className="text-[#8B8A8F] text-sm font-normal">
            {followersCount} followers
          </div>
        </div>

        <div className="self-stretch flex items-center gap-3 my-auto">
          <button className="justify-center items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[#F86F0A] self-stretch flex gap-1 text-base text-white font-medium whitespace-nowrap my-auto pl-4 pr-6 py-2.5 rounded-lg max-md:pr-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/ebeccea4ec2cba991f0f5901273cfaa42a5f6973?placeholderIfAbsent=true"
              alt="Follow icon"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
            />
            <div className="self-stretch my-auto">Follow</div>
          </button>
          <div className="self-stretch flex items-center gap-1 justify-center w-11 my-auto">
            <button
              aria-label="Edit activity"
              className="items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[rgba(248,111,10,0.10)] self-stretch flex w-11 gap-2.5 h-11 my-auto p-2.5 rounded-[64px]"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/2abd9319f7448c9fc856ba1b4b2ab68128033b39?placeholderIfAbsent=true"
                alt="Edit icon"
                className="aspect-[1] object-contain w-6 self-stretch my-auto"
              />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-sm font-medium whitespace-nowrap mt-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`self-stretch shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] ${
            activeTab === "posts"
              ? "bg-[#EA6100] text-white"
              : "bg-white text-black border border-[color:var(--Label-Tertiary,#C5C4C7)] border-solid"
          } gap-2.5 px-4 py-2 rounded-[32px]`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`self-stretch shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] ${
            activeTab === "comments"
              ? "bg-[#EA6100] text-white"
              : "bg-white text-black border border-[color:var(--Label-Tertiary,#C5C4C7)] border-solid"
          } gap-2.5 px-4 py-2 rounded-[48px]`}
        >
          Comments
        </button>
      </div>
     <div className="flex gap-4 flex-wrap mt-4 max-md:max-w-full">
        {posts.slice(0, 3).map(post => (
          <PostCard
            key={post.id}
            avatar={post.userProfilePic}
            username={post.userName}
            timeAgo={formatTimeAgo(post.createdAt?.toDate())}
            location={post.location || ""}
            content={post.text}
            likes={formatNumber(post.likeCount)}
            comments={formatNumber(post.commentCount)}
          />
        ))}
      </div>
      <div className="border min-h-px w-full mt-4 border-[rgba(139,138,143,1)] border-solid max-md:max-w-full" />
      <button className="flex w-full items-center gap-2 text-xl text-[rgba(102,102,102,1)] font-medium justify-center flex-wrap mt-4 max-md:max-w-full">
        <div className="self-stretch my-auto">Show all posts </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/172471d03d328fc2bfef9a888c5363bf7bde0ba1?placeholderIfAbsent=true"
          alt="Show more icon"
          className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
        />
      </button>
    </div>
  );
};

// Helper functions
function formatTimeAgo(date: Date): string {
  if (!date) return "";
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  return `${years} years ago`;
  
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export default ActivitySection;
