import React from "react";

interface EventItem {
  day: string;
  month: string;
  title: string;
  location: string;
}

const EventsWidget: React.FC = () => {
  const events: EventItem[] = [
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
      day: "25",
      month: "Jan",
      title: "Cultural Heritage Tour",
      location: "Jaipur, India",
    },
    {
      day: "28",
      month: "Jan",
      title: "Mountain Hiking Experience",
      location: "Shimla, India",
    },
  ];

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full pt-4 pb-5 px-3 rounded-lg border-[rgba(197,196,199,1)] border-solid">
      <h2 className="sticky top-0 bg-[rgba(248,249,250,1)] z-10 self-stretch w-full rounded gap-3 text-base text-black font-medium pr-2 py-2">
        Upcoming Events
      </h2>
      <div className="w-full mt-4">
        {events.map((event, index) => (
          <div
            key={index}
            className={`flex w-full items-center gap-2 ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            <div className="rounded bg-[rgba(64,43,9,0.1)] self-stretch flex flex-col items-center text-black whitespace-nowrap justify-center w-[49px] h-[49px] my-auto px-3">
              <div className="text-base font-medium">{event.day}</div>
              <div className="text-sm font-normal">{event.month}</div>
            </div>
            <div className="self-stretch font-normal my-auto">
              <div className="text-black text-sm">{event.title}</div>
              <div className="text-[#8B8A8F] text-xs">{event.location} </div>
            </div>
          </div>
        ))}
      </div>
      <button className="self-stretch border border-[color:var(--Label-Tertiary,#C5C4C7)] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] w-full gap-2.5 text-sm text-black font-normal mt-4 px-6 py-1.5 rounded-lg border-solid max-md:px-5">
        Explore more
      </button>
    </div>
  );
};

export default EventsWidget;
