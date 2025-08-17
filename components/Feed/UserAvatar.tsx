import React from "react";

interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User avatar",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-[1] object-contain ${sizeClasses[size]} shrink-0 rounded-[1080px] ${className}`}
    />
  );
};

export default UserAvatar;
