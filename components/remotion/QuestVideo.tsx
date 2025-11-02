// remotion/QuestVideo.tsx
import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

interface Activity {
  title: string;
  description: string;
  location: { name: string };
  media?: Array<{ url: string }>;
  time: string;
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface QuestVideoProps {
  destination: string;
  userName: string;
  userProfilePic?: string;
  coverImageUrl?: string;
  days: Day[];
  questTitle: string;
}

// INTRO SCENE (0-120 frames = 4 seconds at 30fps)
const IntroScene: React.FC<{
  destination: string;
  userName: string;
  userProfilePic?: string;
  coverImageUrl?: string;
}> = ({ destination, userName, userProfilePic, coverImageUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 100, stiffness: 200, mass: 0.5 }
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const userOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  const overlayOpacity = interpolate(frame, [0, 30], [0.7, 0.4]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background Image */}
      {coverImageUrl && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
          <Img
            src={coverImageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(8px) brightness(0.7)'
            }}
          />
        </div>
      )}

      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%)',
          opacity: overlayOpacity
        }}
      />

      {/* Content */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 40px' }}>
        {/* Destination */}
        <div
          style={{
            fontFamily,
            fontSize: 72,
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 20,
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            lineHeight: 1.2
          }}
        >
          {destination}
        </div>

        {/* Decorative Line */}
        <div
          style={{
            width: interpolate(frame, [20, 60], [0, 200], { extrapolateRight: 'clamp' }),
            height: 4,
            background: 'linear-gradient(90deg, transparent, #f97316, transparent)',
            marginBottom: 40,
            opacity: titleOpacity
          }}
        />

        {/* User Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: userOpacity,
            transform: `translateY(${interpolate(frame, [30, 50], [20, 0])}px)`
          }}
        >
          {userProfilePic && (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #f97316',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.5)'
              }}
            >
              <Img src={userProfilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ fontFamily, fontSize: 32, fontWeight: 700, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            @{userName}
          </div>
        </div>

        {/* OnQuest Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            fontFamily,
            fontSize: 24,
            fontWeight: 800,
            color: '#f97316',
            opacity: userOpacity,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}
        >
          🗺️ OnQuest
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// DAY SCENE (each day gets 240 frames = 8 seconds at 30fps)
const DayScene: React.FC<{
  day: Day;
  sceneFrame: number;
}> = ({ day, sceneFrame }) => {
  const { fps } = useVideoConfig();

  // Day title animation
  const dayTitleY = spring({
    frame: sceneFrame,
    fps,
    from: -100,
    to: 0,
    config: { damping: 100 }
  });

  const dayTitleOpacity = interpolate(sceneFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Calculate activities per screen (max 3 for readability)
  const activitiesPerScreen = 3;
  const totalScreens = Math.ceil(day.activities.length / activitiesPerScreen);
  const screenDuration = 180; // 6 seconds per screen
  const currentScreen = Math.floor(sceneFrame / screenDuration);
  const screenFrame = sceneFrame % screenDuration;

  const currentActivities = day.activities.slice(
    currentScreen * activitiesPerScreen,
    (currentScreen + 1) * activitiesPerScreen
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Gradient Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(234, 88, 12, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.1), transparent 50%)'
        }}
      />

      {/* Day Header */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${dayTitleY}px)`,
          opacity: dayTitleOpacity
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 700,
            color: '#f97316',
            letterSpacing: '2px',
            marginBottom: 8
          }}
        >
          DAY {day.day}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 40,
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            padding: '0 40px'
          }}
        >
          {day.title}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 18,
            color: '#9ca3af',
            marginTop: 8
          }}
        >
          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Activities */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 0,
          right: 0,
          bottom: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: '0 40px',
          overflowY: 'hidden'
        }}
      >
        {currentActivities.map((activity, idx) => {
          const activityDelay = 15 + idx * 12;
          const activityFrame = screenFrame - activityDelay;

          // Alternate slide direction
          const slideFrom = idx % 2 === 0 ? -1080 : 1080;

          const slideX = spring({
            frame: activityFrame,
            fps,
            from: slideFrom,
            to: 0,
            config: { damping: 100, stiffness: 200 }
          });

          const activityOpacity = interpolate(activityFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 20,
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderRadius: 20,
                padding: 20,
                border: '2px solid rgba(249, 115, 22, 0.3)',
                backdropFilter: 'blur(10px)',
                transform: `translateX(${slideX}px)`,
                opacity: activityOpacity,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Activity Image */}
              {activity.media?.[0]?.url && (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 16,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid rgba(249, 115, 22, 0.5)'
                  }}
                >
                  <Img
                    src={activity.media[0].url}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Activity Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Time Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    alignSelf: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: 16 }}>🕐</span>
                  <span style={{ fontFamily, fontSize: 14, fontWeight: 600, color: '#f97316' }}>
                    {activity.time}
                  </span>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily,
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.3
                  }}
                >
                  {activity.title}
                </div>

                {/* Location */}
                {activity.location?.name && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontFamily,
                      fontSize: 16,
                      color: '#9ca3af'
                    }}
                  >
                    <span>📍</span>
                    <span>{activity.location.name}</span>
                  </div>
                )}

                {/* Description */}
                {activity.description && (
                  <div
                    style={{
                      fontFamily,
                      fontSize: 16,
                      color: '#d1d5db',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {activity.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      {totalScreens > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {Array.from({ length: totalScreens }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentScreen ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: idx === currentScreen ? '#f97316' : 'rgba(156, 163, 175, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

// OUTRO SCENE (90 frames = 3 seconds at 30fps)
const OutroScene: React.FC<{ sceneFrame: number }> = ({ sceneFrame }) => {
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  const textOpacity = interpolate(sceneFrame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });
  const ctaY = spring({
    frame: sceneFrame - 20,
    fps,
    from: 50,
    to: 0,
    config: { damping: 100 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Gradient Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(234, 88, 12, 0.2), transparent 70%)'
        }}
      />

      {/* Content */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
        {/* Logo */}
        <div
          style={{
            fontFamily,
            fontSize: 80,
            fontWeight: 900,
            color: '#fff',
            transform: `scale(${logoScale})`,
            textShadow: '0 4px 20px rgba(249, 115, 22, 0.5)'
          }}
        >
          🗺️ OnQuest
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 600,
            color: '#f97316',
            opacity: textOpacity,
            textAlign: 'center',
            padding: '0 60px'
          }}
        >
          Create Your Adventure
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            transform: `translateY(${ctaY}px)`,
            opacity: textOpacity
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 20,
              color: '#d1d5db',
              textAlign: 'center'
            }}
          >
            Start planning your quest at
          </div>
          <div
            style={{
              fontFamily,
              fontSize: 32,
              fontWeight: 800,
              color: '#fff',
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              padding: '12px 32px',
              borderRadius: 40,
              border: '2px solid #f97316'
            }}
          >
            onquest.in
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// MAIN COMPOSITION
export const QuestVideo: React.FC<QuestVideoProps> = ({
  destination,
  userName,
  userProfilePic,
  coverImageUrl,
  days,
  questTitle
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing (at 30fps)
  const INTRO_DURATION = 120; // 4 seconds
  const DAY_DURATION = 240; // 8 seconds per day
  const OUTRO_DURATION = 90; // 3 seconds

  // Calculate total days with multiple screens if needed
  let currentTime = INTRO_DURATION;
  const dayTimings: Array<{ start: number; end: number; day: Day }> = [];

  days.forEach(day => {
    const activitiesPerScreen = 3;
    const screens = Math.ceil(day.activities.length / activitiesPerScreen);
    const duration = screens * 180; // 6 seconds per screen
    
    dayTimings.push({
      start: currentTime,
      end: currentTime + duration,
      day
    });
    
    currentTime += duration;
  });

  const OUTRO_START = currentTime;

  // Determine which scene to show
  if (frame < INTRO_DURATION) {
    return (
      <IntroScene
        destination={destination}
        userName={userName}
        userProfilePic={userProfilePic}
        coverImageUrl={coverImageUrl}
      />
    );
  }

  // Check day scenes
  for (const timing of dayTimings) {
    if (frame >= timing.start && frame < timing.end) {
      return <DayScene day={timing.day} sceneFrame={frame - timing.start} />;
    }
  }

  // Outro
  if (frame >= OUTRO_START) {
    return <OutroScene sceneFrame={frame - OUTRO_START} />;
  }

  return null;
};

// Calculate total duration for the video
export const calculateDuration = (days: Day[]): number => {
  const INTRO_DURATION = 120;
  const OUTRO_DURATION = 90;
  
  const daysDuration = days.reduce((total, day) => {
    const activitiesPerScreen = 3;
    const screens = Math.ceil(day.activities.length / activitiesPerScreen);
    return total + (screens * 180); // 6 seconds per screen
  }, 0);
  
  return INTRO_DURATION + daysDuration + OUTRO_DURATION;
};