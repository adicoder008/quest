import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles = "box-border cursor-pointer rounded-lg border-none";

  const variantStyles = {
    primary: "bg-[#EA6100] text-white",
    secondary: "bg-[#F8F9FA] text-black border border-[#C5C4C7]",
    outline: "bg-transparent border border-[#C5C4C7] text-black",
  };

  const sizeStyles = {
    sm: "px-4 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
