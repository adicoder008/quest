// remotion/Root.tsx
import { Composition } from 'remotion';
import { QuestVideo, calculateDuration } from './QuestVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuestVideo"
        component={QuestVideo}
        durationInFrames={300} // Default, will be overridden
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          destination: 'Bali, Indonesia',
          userName: 'traveler',
          userProfilePic: '',
          coverImageUrl: '',
          days: [],
          questTitle: 'Amazing Quest'
        }}
      />
    </>
  );
};