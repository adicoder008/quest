import React from "react";

interface FollowButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md";
  className?: string;
  iconSrc?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  variant = "tertiary",
  size = "md",
  className = "",
  iconSrc,
}) => {
  const variantClasses = {
    primary: "bg-[rgba(234,97,0,1)] text-white",
    secondary: "border border-[#C5C4C7] bg-transparent text-black",
    tertiary: "shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] text-[#F86F0A]",
  };

  const sizeClasses = {
    sm: "text-sm px-4 py-1",
    md: "text-base px-6 py-2.5",
  };

  return (
    <button
      className={`flex items-center justify-center gap-1 rounded-lg font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {iconSrc && (
        <img
          src={iconSrc}
          alt="Follow icon"
          className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
        />
      )}
      <span className="self-stretch my-auto">Follow</span>
    </button>
  );
};

export default FollowButton;
