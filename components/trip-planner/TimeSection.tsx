
import React, { useState } from "react";
// import { LocationIcon } from "@/components/icons/LocationIcon";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimeSectionProps {
  title: string;
  icon: string;
  toggleIcon: string;
  children: React.ReactNode;
  isOpen?: boolean; //optional
  onToggle?: () => void; //optional     ? means optional
}

export const TimeSection: React.FC<TimeSectionProps> = ({
  title,
  icon,
  toggleIcon,
  children,
  isOpen = false,
  onToggle,
}) => {
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={onToggle}
      className="mb-4"
    >
      <div className="bg-[rgba(248,111,10,0.1)] w-full px-4 py-4 rounded-lg">
        <CollapsibleTrigger className="flex w-full justify-between items-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="self-stretch flex min-h-6 flex-col items-stretch justify-center w-6 my-auto px-0.5 py-1">
              <img
                src={icon}
                className="aspect-[1.25] object-contain w-5"
                alt={title}
              />
            </div>
            <div className="text-black text-xl font-bold self-stretch my-auto">
              {title}
            </div>
            {/* import { LocationIcon } from "@/components/icons/LocationIcon";  */}
          </div>
          {isOpen ? (
            <ChevronUp className="h-6 w-6 text-[#F86F0A]" />
          ) : (
            <ChevronDown className="h-6 w-6 text-[#F86F0A]" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="flex w-full flex-col mt-[18px]">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};