import React from 'react'
import { CardContent } from '../ui/card';

interface TrendingQuestCardProps {
  cardURL: string;
  cardALT: string;
  cardTitle: string;
  cardContent?: string;
}

const TrendingQuestCard = ({cardURL,cardALT,cardTitle,cardContent}:TrendingQuestCardProps) => {
  return (
    <>
        <div className="min-w-[140px] rounded-lg overflow-hidden bg-gray-900">
            <img
              src={cardURL || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
              alt={cardALT}
              className="h-24 w-full object-cover"
            />
            <div>
            <p className="px-2 text-md">{cardTitle}</p>
            <p>{cardContent}</p>
            </div>
            
          </div>
      
    </>
  )
}

export default TrendingQuestCard
