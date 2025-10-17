'use client'
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Nav";
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
import { getUserXPHistory, XP_VALUES } from "@/lib/xpService";

interface UserData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  backgroundURL?: string;
  title?: string;
  postsCount?: number;
  followers?: string[];
  following?: string[];
  totalXP?: number;
}


const Index: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);

 
const [userData, setUserData] = useState<UserData | null>(null);


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);

    if (currentUser) {
      try {
        const userDetails = await getCurrentUserData();
        setUserData(userDetails);
        
        // Add null check and safe property access
        if (userDetails) {
          setUserData(userDetails as UserData);
          setXp((userDetails as UserData).totalXP || 0);
        }
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


  // if (loading || !userData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar user={null} onSignOut={function (): void {
        throw new Error("Function not implemented.");
      } } />
      <div className="flex flex-1 px-12 gap-4 pt-4 max-w-[1440px] mx-auto w-full max-md:flex-col">
        <div className="flex-1">
          <ProfileHeader />
          <AboutSection />
          <div className="flex w-full items-stretch gap-4 flex-wrap mt-3 max-md:max-w-full">
            <LeagueInfoWidget xp={xp} />
            <ProgressWidget xp={xp} />
          </div>
          <BadgesSection userId={user?.uid || ''} />
          <ActivitySection uid={user?.uid || ''} />
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
