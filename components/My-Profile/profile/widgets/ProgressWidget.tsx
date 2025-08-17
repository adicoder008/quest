import React, { useEffect, useState } from "react";
import { getLevelInfo } from "../../../../lib/firebaseSerive";

const ProgressWidget: React.FC<{ xp: number }> = ({ xp }) => {
  const [levelInfo, setLevelInfo] = useState<any>(null);

  useEffect(() => {
    setLevelInfo(getLevelInfo(xp));
  }, [xp]);

  if (!levelInfo) return <div>Loading...</div>;

  return (
    <div className="bg-[rgba(248,249,250,1)] border flex min-w-60 flex-col items-stretch justify-center flex-1 shrink basis-[0%] px-6 py-3 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full max-md:px-5">
      <div className="flex w-full items-center gap-[40px_100px] justify-between flex-wrap max-md:max-w-full">
        <div className="self-stretch flex min-h-14 flex-col items-center justify-center w-14 my-auto">
          <img
            src={levelInfo.currentLevel.badgeIcon}
            alt="Current level"
            className="aspect-[1] object-contain w-14"
          />
        </div>
        {levelInfo.nextLevel && (
          <div className="self-stretch flex flex-col items-center justify-center w-[47px] my-auto">
            <img
              src={levelInfo.nextLevel.badgeIcon}
              alt="Next level"
              className="aspect-[0.98] object-contain w-[47px]"
            />
          </div>
        )}
      </div>
      <div className="w-full mt-3 max-md:max-w-full">
        <div className="w-full rounded-[64px] max-md:max-w-full">
          <div className="bg-[rgba(217,217,217,1)] flex flex-col rounded-[64px] max-md:max-w-full max-md:pr-5">
            <div 
              className="bg-[rgba(248,111,10,1)] flex h-2 rounded-[64px]" 
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>
        {levelInfo.nextLevel && (
          <div className="w-full text-sm text-[#8B8A8F] font-normal mt-1 max-md:max-w-full">
            {xp - levelInfo.currentLevel.minXp}/{levelInfo.nextLevel.minXp - levelInfo.currentLevel.minXp} XP to "{levelInfo.nextLevel.name}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressWidget;