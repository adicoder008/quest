import React, { useEffect, useState } from "react";
import { getUserBadges } from "../../../lib/firebaseSerive";

interface Badge {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  earnedAt: Date;
}

const BadgesSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const userBadges = await getUserBadges(userId);
      setBadges(userBadges);
    };
    fetchBadges();
  }, [userId]);

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full mt-3 pt-4 pb-6 px-6 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full max-md:px-5">
      <div className="flex w-full items-center gap-[40px_100px] justify-between flex-wrap max-md:max-w-full">
        <h2 className="text-black text-base font-medium self-stretch my-auto">
          Earned Badges
        </h2>
        <button className="text-[#8B8A8F] text-sm font-normal self-stretch my-auto">
          View All
        </button>
      </div>
      <div className="flex w-full gap-[20px_25px] text-sm text-[rgba(64,43,9,1)] font-semibold text-center leading-[17px] flex-wrap mt-4 max-md:max-w-full">
        {badges.map(badge => (
          <div key={badge.id} className="justify-center items-stretch shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[#F8EBE2] flex min-h-[120px] flex-col w-[100px] px-3 py-2.5 rounded-lg">
            <img
              src={badge.iconUrl}
              alt={badge.name}
              className="aspect-[0.83] object-contain w-[100px] shrink-0"
            />
            <div>{badge.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesSection;