import React from "react";
import Navbar from "../My-Profile/profile/Navbar";
import MainLayout from "./MainLayout";
import PostCreator from "./PostCreator";
import TextPost from "./TextPost";
import ImagePost from "./ImagePost";
import SponsoredPost from "./SponsoredPost";
import EventPost from "./EventPost";
import UpcomingEvents from "./UpcomingEvents";
import TrendingTravelers from "./TrendingTravelers";
import Nav from "../Nav";

const Index: React.FC = () => {
  // Orange post right content
  const orangePostRightContent = (
    <div className="self-stretch min-w-60 text-xl text-[rgba(64,43,9,1)] font-medium whitespace-nowrap w-[253px]">
      <div className="self-stretch bg-[rgba(250,132,31,1)] min-h-16 w-full px-3 py-[17px] rounded-[8px_8px_0px_0px]">
        NYC→LDN
      </div>
      <div className="bg-[rgba(217,217,217,1)] flex min-h-[253px] w-[253px] flex-1 aspect-[1] mt-3 rounded-lg" />
    </div>
  );

  return (
    <div className="bg-[rgba(248,249,250,1)] flex flex-col overflow-hidden items-stretch pb-[106px] max-md:pb-[100px]">
      {/* <Navbar /> */}
      <Nav/>
        
        <div className="px-10  ">        
      <MainLayout
        content={
          <>
            <PostCreator />

            <TextPost />

            <TextPost
              headerColor="bg-[rgba(250,132,31,1)]"
              headerTextColor="text-[#402B09]"
              userTypeColor="text-white"
              userTypeBgColor="bg-[rgba(84,63,29,1)]"
              followIconSrc="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/ceaed05bdcecff7d1b380cf820077e44e6ca12c8?placeholderIfAbsent=true"
              rightContent={orangePostRightContent}
            />

            <ImagePost />

            <SponsoredPost />

            <EventPost />
          </>
        }
        sidebar={
          <>
            <UpcomingEvents />
            <TrendingTravelers />
          </>
        }
      />
      </div>
    </div>
  );
};

export default Index;
