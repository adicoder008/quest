import React, { FunctionComponent } from 'react';

// Interface for a single train data object
interface TrainData {
  arrivalTime: string;
  departureTime: string;
  duration: string;
  fare: string;
  trainName: string;
  trainNumber: string;
}

// Interface for the component's props
interface TrainCardProps {
  trains: TrainData[];
}

const TrainCard: FunctionComponent<TrainCardProps> = ({ trains }) => {
  // The parent component now handles loading, errors, and data fetching.
  // This component's only job is to display the train data it's given.

  if (!trains || trains.length === 0) {
    return <div className="text-center p-4 text-gray-500">No train data available for this trip.</div>;
  }

  return (
    <div className="w-full p-5 border-blue-600 border-dashed border rounded-md flex flex-col gap-5">
      {trains.map((train, index) => (
        <div 
          key={`${train.trainNumber}-${index}`} // Use a more reliable key
          className="self-stretch shadow-lg rounded-lg bg-white border border-gray-200 flex flex-col p-4 gap-4"
        >
          {/* Train Name and Price Section */}
          <div className="self-stretch flex justify-between items-start">
            <div>
              <div className="text-base font-semibold text-gray-800">{train.trainName}</div>
              <div className="text-sm text-gray-500">{train.trainNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">{train.fare}</div>
              <div className="text-xs text-gray-500">
                <span>3AC </span>
                <span className="text-yellow-600 font-semibold">62RAC</span>
              </div>
            </div>
          </div>
          
          {/* Timing and Route Section */}
          <div className="self-stretch flex items-center justify-between text-xs text-gray-500">
            {/* Departure */}
            <div className="text-left w-1/3">
              <div className="text-sm font-medium text-gray-800">{train.departureTime}</div>
              <div>Departure</div>
            </div>

            {/* Duration and Route Visual */}
            <div className="flex-1 flex flex-col items-center text-center mx-2">
              <div>{train.duration}</div>
              <div className="w-full h-0.5 bg-green-500 rounded-full my-1" />
              <div>Route</div>
            </div>
            
            {/* Arrival */}
            <div className="text-right w-1/3">
              <div className="text-sm font-medium text-gray-800">{train.arrivalTime}</div>
              <div>Arrival</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainCard;

