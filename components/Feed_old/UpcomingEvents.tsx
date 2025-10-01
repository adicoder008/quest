import React from "react";
import {EventCard} from "./EventCard";

const UpcomingEvents: React.FC = () => {
  const events = [
    {
      day: "15",
      month: "Jan",
      title: "Neon Drift Performance",
      location: "Gangtok, Sikkim, India",
    },
    {
      day: "20",
      month: "Jan",
      title: "Travel Photography Workshop",
      location: "Cochi, Kerala, India",
    },
    {
      day: "22",
      month: "Jan",
      title: "Bike Riders Meetup",
      location: "Delhi, India",
    },
    {
      day: "22",
      month: "Jan",
      title: "Bike Riders Meetup",
      location: "Delhi, India",
    },
    {
      day: "22",
      month: "Jan",
      title: "Bike Riders Meetup",
      location: "Delhi, India",
    },
  ];

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full pt-4 pb-5 px-3 rounded-lg border-[rgba(197,196,199,1)] border-solid">
      <div className="self-stretch w-full rounded gap-3 text-base text-black font-medium pr-2 py-2">
        Upcoming Events
      </div>
      <div className="w-full mt-4">
        {events.map((event, index) => (
          <div key={index} className={index > 0 ? "mt-3" : ""}>
            <EventCard
              date={{ day: event.day, month: event.month }}
              // month={event.month}
              title={event.title}
              location={event.location}
            />
          </div>
        ))}
      </div>
      <button className="self-stretch border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] w-full gap-2.5 text-sm text-black font-normal mt-4 px-6 py-1.5 rounded-lg border-solid max-md:px-5">
        Explore more
      </button>
    </div>
  );
};

export default UpcomingEvents;
