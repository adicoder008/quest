import React from "react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase.js';

interface PostCardProps {
  postId: string;
  avatar: string;
  username: string;
  timeAgo: string;
  location: string;
  content: string;
  likes: number;
  comments: number;
  level?: string;
  isVerified?: boolean;
  images?: string[];
}

const PostCard: React.FC<PostCardProps> = ({
  postId,
  avatar,
  username,
  timeAgo,
  location,
  content,
  likes,
  comments,
  level = "Scout",
  isVerified = false,
  images = []
}) => {
  const [postImages, setPostImages] = React.useState<string[]>(images);
  const [currentLikes, setCurrentLikes] = React.useState(likes);
  const [isLiked, setIsLiked] = React.useState(false);

  // Fetch additional post images from Firestore
  const fetchPostImages = async () => {
    try {
      if (!images || images.length === 0) {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setPostImages(
            Array.isArray(postData.photoUrl)
              ? postData.photoUrl
              : postData.photoUrl
              ? [postData.photoUrl]
              : []
          );
        }
      } else {
        // Keep images from props in sync with state
        setPostImages(images);
      }
    } catch (error) {
      console.error("Error fetching post images:", error);
    }
  };

  React.useEffect(() => {
    fetchPostImages();
  }, [postId]); // Removed `images` to prevent infinite loop

  const handleLike = () => {
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setIsLiked(!isLiked);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="bg-[rgba(248,249,250,1)] border flex min-w-60 flex-col items-stretch w-[463px] p-3 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
      {/* User Info */}
      <div className="rounded flex w-full items-center gap-[40px_100px] justify-between px-2.5 py-1 max-md:max-w-full">
        <div className="self-stretch flex min-w-60 items-center gap-3 my-auto">
          <img
            src={avatar || "default_avatar_url"}
            alt={`${username}'s avatar`}
            className="aspect-[1] object-contain w-12 self-stretch shrink-0 my-auto rounded-[1080px]"
          />
          <div className="self-stretch flex flex-col items-stretch justify-center my-auto">
            <div className="flex items-stretch gap-2">
              <div className="text-black text-base font-medium my-auto">
                {username}
              </div>
              <div className="flex items-stretch gap-1 text-xs text-black font-normal whitespace-nowrap h-full">
                <div className="self-stretch bg-[rgba(248,111,10,0.1)] gap-2.5 h-full px-2 py-0.5 rounded-[48px]">
                  {level}
                </div>
                {isVerified && (
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/fb5d4807f42056be0bda81da69d3f8948996cb45?placeholderIfAbsent=true"
                    alt="Verified badge"
                    className="aspect-[1] object-contain w-6 shrink-0 my-auto"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8B8A8F] font-normal justify-center">
              <div className="self-stretch my-auto">{timeAgo}</div>
              {location && (
                <div className="self-stretch my-auto">{location}</div>
              )}
            </div>
          </div>
        </div>
        <div className="self-stretch flex items-center gap-1 w-6 my-auto">
          <button
            aria-label="More options"
            className="self-stretch flex min-h-6 w-6 my-auto"
          />
        </div>
      </div>

      {/* Post Content */}
      <div className="self-stretch flex-1 shrink basis-[0%] w-full gap-2.5 text-sm text-black font-normal leading-[21px] mt-3 px-2.5 py-1 max-md:max-w-full">
        {content}
      </div>

      {/* Post Images */}
      {postImages.length > 0 && (
        <div className="flex w-full gap-2 mt-3 max-md:max-w-full">
          {postImages.slice(0, 2).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post content ${index + 1}`}
              className={`flex ${index === 0 ? 'w-[216px]' : 'w-[215px]'} shrink h-[216px] aspect-[1] flex-1 basis-[0%] rounded-lg object-cover`}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border min-h-px w-full mt-3 border-[rgba(197,196,199,1)] border-solid max-md:max-w-full" />

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-sm text-black font-normal whitespace-nowrap mt-3">
        <button 
          className="self-stretch flex items-center gap-1 my-auto"
          onClick={handleLike}
        >
          <img
            src={isLiked ? "liked_icon_url" : "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/2e58d7a52d1a9018924c7a57b7ba63117ac8285a?placeholderIfAbsent=true"}
            alt="Like icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">{formatNumber(currentLikes)}</div>
        </button>
        <button className="self-stretch flex items-center gap-1 my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/0bcccd2bd08831ebf8517d6eb81a6338422aa57c?placeholderIfAbsent=true"
            alt="Comment icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
          <div className="self-stretch my-auto">{formatNumber(comments)}</div>
        </button>
        <button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/3170fdb966acdf6b65c5e07892a84022d5d37db9?placeholderIfAbsent=true"
            alt="Share icon"
            className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
          />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
