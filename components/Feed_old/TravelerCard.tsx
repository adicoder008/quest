
import  {Avatar}  from "./Avatar";
import { Button } from "./Button";

interface TravelerCardProps {
  name: string;
  title: string;
  avatar: string;
}

export const TravelerCard = ({ name, title, avatar }: TravelerCardProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} alt={name} size="sm" />
        <div>
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-[#8B8A8F]">{title}</p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Follow
      </Button>
    </div>
  );
};
