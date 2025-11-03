// remotion/Root.tsx
import { Composition, registerRoot } from 'remotion'; // <-- 1. IMPORT IT
import { ComponentType } from 'react';
import { QuestVideo, calculateDuration } from './QuestVideo';
import type { QuestVideoProps } from './QuestVideo';

const defaultVideoProps: QuestVideoProps = {
  destination: 'Bali, Indonesia',
  userName: 'traveler',
  userProfilePic: '',
  coverImageUrl: '',
  days: [],
  questTitle: 'Amazing Quest'
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuestVideo"
        component={QuestVideo as React.ComponentType<any>}
        // This is a great solution for dynamic props!
        calculateMetadata={({ props }) => {
          const typedProps = props as unknown as QuestVideoProps;
          // Add a fallback for defaultProps which might not have 'days'
          const days = typedProps?.days || defaultVideoProps.days;
          const duration = calculateDuration(days);
          
          return {
            durationInFrames: duration,
            fps: 30,
            width: 1080,
            height: 1920,
          };
        }}
        defaultProps={defaultVideoProps}
      />
    </>
  );
};

// ---  ✅ 2. ADD THIS LINE  ---
// You must call registerRoot() in your entry file.
registerRoot(RemotionRoot);