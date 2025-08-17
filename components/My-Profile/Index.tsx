'use client'
import React, { useState, useEffect } from "react";
import Navbar from "./profile/Navbar";
import ProfileHeader from "./profile/ProfileHeader";
import AboutSection from "./profile/AboutSection";
import BadgesSection from "./profile/BadgesSection";
import ActivitySection from "./profile/ActivitySection";
import LeagueInfoWidget from "./profile/widgets/LeagueInfoWidget";
import ProgressWidget from "./profile/widgets/ProgressWidget";
import EventsWidget from "./profile/widgets/EventsWidget";
import TrendingTravelersWidget from "./profile/widgets/TrendingTravelersWidget";
import { getUserData } from "../../lib/firebaseSerive";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import { getCurrentUserData } from "@/lib/authService.js";
import { getXPLogs } from "@/lib/xpService";

const Index: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDetails = await getCurrentUserData();
          setUserData(userDetails);

          const xpLogs = await getXPLogs(currentUser.uid);
          const totalXp = xpLogs.reduce((total, log) => total + log.xp, 0);
          setXp(totalXp);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        setXp(0);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  if (loading || !userData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="flex flex-1 px-12 gap-4 pt-4 max-w-[1440px] mx-auto w-full max-md:flex-col">
        <div className="flex-1">
          <ProfileHeader uid={user?.uid} />
          <AboutSection uid={user?.uid} />
          <div className="flex w-full items-stretch gap-4 flex-wrap mt-3 max-md:max-w-full">
            <LeagueInfoWidget xp={xp} />
            <ProgressWidget xp={xp} />
          </div>
          <BadgesSection uid={user?.uid} />
          <ActivitySection uid={user?.uid} />
        </div>
        <aside className="w-80 flex-shrink-0 max-md:w-full max-md:order-first">
          <div className="sticky top-4">
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <EventsWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              <TrendingTravelersWidget />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
