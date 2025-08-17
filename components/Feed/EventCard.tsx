
interface EventCardProps {
    date: {
      day: string;
      month: string;
    };
    title: string;
    location: string;
    type?: "music" | "workshop" | "meetup" | "festival" | "other";
  }
  
  export const EventCard = ({ date, title, location, type = "other" }: EventCardProps) => {
    // Function to get the background color based on event type
    const getTypeColor = () => {
      switch (type) {
        case "music":
          return "bg-blue-500";
        case "workshop":
          return "bg-green-500";
        case "meetup":
          return "bg-purple-500";
        case "festival":
          return "bg-yellow-500";
        default:
          return "bg-[#EA6100]";
      }
    };
  
    return (
      <div className="flex items-center gap-3">
        <div className={`flex flex-col items-center justify-center min-w-[48px] h-12 ${getTypeColor()} rounded-lg text-white`}>
          <span className="text-sm font-medium">{date.month}</span>
          <span className="text-base font-bold">{date.day}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#8B8A8F]">{location}</p>
          </div>
        </div>
      </div>
    );
  };
  