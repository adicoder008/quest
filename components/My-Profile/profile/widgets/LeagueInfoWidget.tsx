import React, { useEffect, useState } from "react";
import { getLevelInfo } from "../../../../lib/firebaseSerive";

const LeagueInfoWidget: React.FC<{ xp: number }> = ({ xp }) => {
  const [levelInfo, setLevelInfo] = useState<any>(null);

  useEffect(() => {
    setLevelInfo(getLevelInfo(xp));
  }, [xp]);

  if (!levelInfo) return <div>Loading...</div>;

  return (
    <div className="bg-[rgba(248,249,250,1)] border flex min-w-60 flex-col items-stretch justify-center w-[332px] px-6 py-4 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:px-5">
      <div className="flex w-full flex-col items-stretch justify-center">
        <div className="text-black text-sm font-normal">Travel League</div>
        <div className="flex w-full items-center gap-[35px] justify-between px-2">
          <div className="self-stretch flex flex-col items-stretch justify-center my-auto">
            <div className="text-[rgba(234,97,0,1)] text-[32px] font-arsenal font-bold italic">
              {levelInfo.currentLevel.name}
            </div>
            <div className="text-[#8B8A8F] text-xs font-normal">
              Welcome to the Journey!
            </div>
          </div>
          <img
            src={levelInfo.currentLevel.badgeIcon}
            alt={`${levelInfo.currentLevel.name} badge`}
            className="aspect-[1] object-contain w-[100px] self-stretch shrink-0 my-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default LeagueInfoWidget;