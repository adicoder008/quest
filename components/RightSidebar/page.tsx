"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, MapPin, TrendingUp } from "lucide-react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

import { getUserBadges, getLevelInfo } from "@/lib/firebaseSerive";
import { db } from "@/lib/firebase";
import { Post, User as UserType } from "@/app/types";

type ExploreRightSidebarProps = {
  user: UserType | null;
  userData: any;
  className?: string;
  style?: CSSProperties;
};

type TrendingLocation = {
  location: string;
  count: number;
};

const generateUsername = (displayName: string | null | undefined): string => {
  if (!displayName) return "user";
  return displayName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "");
};

const ExploreRightSidebar = ({ user, userData, className = "", style }: ExploreRightSidebarProps) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [trendingLocations, setTrendingLocations] = useState<TrendingLocation[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userBadges = await getUserBadges(user.uid);
        setBadges(userBadges.slice(0, 3));

        const xp = userData?.totalXP || 0;
        const level = getLevelInfo(xp);
        setLevelInfo(level);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, userData]);

  useEffect(() => {
    const fetchTrendingLocations = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"), limit(100));
        const snapshot = await getDocs(q);

        const locationCount: Record<string, number> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as Post;
          const location = data.location || data.questContext?.location;
          if (location) {
            locationCount[location] = (locationCount[location] || 0) + 1;
          }
        });

        const trending = Object.entries(locationCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([location, count]) => ({ location, count }));

        setTrendingLocations(trending);
      } catch (error) {
        console.error("Error fetching trending locations:", error);
      }
    };

    fetchTrendingLocations();
  }, []);

  return (
    <div
      className={`hidden xl:block fixed right-0 top-0 h-screen w-[380px] border-l border-gray-700 bg-black p-4 overflow-y-auto ${className}`}
      style={style}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-4">
        <div className="h-24 bg-linear-to-r from-[#F7CEB0] to-[#EA6100]" />

        <div className="px-4 pb-4">
          <img
            src={user?.photoURL || "/default-avatar.png"}
            alt={user?.displayName || ""}
            className="w-20 h-20 rounded-full border-4 border-gray-900 -mt-10 mb-3 object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/profile/${user?.uid}`)}
          />

          <h3
            className="text-white text-lg font-bold mb-1 cursor-pointer hover:underline"
            onClick={() => router.push(`/profile/${user?.uid}`)}
          >
            {user?.displayName || "User"}
          </h3>
          <p className="text-gray-400 text-sm mb-3">@{generateUsername(user?.displayName)}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#F7CEB0]" />
                <span className="text-gray-400 text-xs">Total XP</span>
              </div>
              <span className="text-white font-bold text-lg">{userData?.totalXP || 0}</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#F7CEB0]" />
                <span className="text-gray-400 text-xs">Quests</span>
              </div>
              <span className="text-white font-bold text-lg">{userData?.questsCompleted || 0}</span>
            </div>
          </div>

          {levelInfo && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F7CEB0] font-medium text-sm">{levelInfo.currentLevel.name}</span>
                {levelInfo.nextLevel && (
                  <span className="text-gray-400 text-xs">{levelInfo.xpToNext} XP to next</span>
                )}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-[#F7CEB0] to-[#EA6100] h-2 rounded-full transition-all"
                  style={{ width: `${(levelInfo.progress || 0) * 100}%` }}
                />
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">Recent Badges</h4>
                <button
                  onClick={() => router.push(`/profile/${user?.uid}#badges`)}
                  className="text-[#F7CEB0] text-xs hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="flex gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-[#F8EBE2] rounded-lg p-2 flex flex-col items-center min-w-[70px]"
                    title={badge.description}
                  >
                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 object-contain mb-1" />
                    <span className="text-[#402B09] text-[10px] font-semibold text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#F7CEB0]" />
          <h4 className="text-white font-medium text-base">Trending Destinations</h4>
        </div>
        <div className="space-y-3">
          {trendingLocations.length > 0 ? (
            trendingLocations.map((item, index) => (
              <div key={item.location} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F7CEB0] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h5 className="text-white text-sm font-medium">{item.location}</h5>
                    <p className="text-gray-400 text-xs">{item.count} quests</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center">No trending locations yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreRightSidebar;
