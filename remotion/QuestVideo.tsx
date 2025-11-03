// remotion/QuestVideo-GenZ.tsx
import {
	AbsoluteFill,
	Img,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	Sequence,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRighteous } from '@remotion/google-fonts/Righteous';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import React, { useMemo } from 'react';

// --- Font Loading ---
// We load multiple fonts for different vibes
const { fontFamily: inter } = loadInter(); // Kept for default/fallback
const { fontFamily: righteous } = loadRighteous();
const { fontFamily: caveat } = loadCaveat();

// --- Data Types (Unchanged) ---
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

export interface QuestVideoProps {
	destination: string;
	userName: string;
	userProfilePic?: string;
	coverImageUrl?: string;
	days: Day[];
	questTitle: string;
}

// --- Helper: Hand-Drawn Animated Arrow ---
// This component draws a 'sketchy' curved arrow between two points.
const HandDrawnArrow: React.FC<{
	from: { x: number; y: number };
	to: { x: number; y: number };
	animProgress: number; // 0 to 1
}> = ({ from, to, animProgress }) => {
	// Calculate a curve
	const midX = (from.x + to.x) / 2;
	const midY = (from.y + to.y) / 2;
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	// Add some curve by offsetting the control point
	const controlX = midX - dy * 0.2;
	const controlY = midY + dx * 0.2;

	const pathD = `M ${from.x} ${from.y} Q ${controlX} ${controlY}, ${to.x} ${to.y}`;

	// Use a ref to measure path length
	const [length, setLength] = React.useState(200);
	const ref = React.useCallback((node: SVGPathElement | null) => {
		if (node) {
			setLength(node.getTotalLength());
		}
	}, []);

	// Animate stroke-dashoffset to 'draw' the line
	const strokeDashoffset = interpolate(animProgress, [0, 1], [length, 0]);

	return (
		<AbsoluteFill>
			<svg
				viewBox="0 0 1080 1920"
				style={{
					position: 'absolute',
					width: 1080,
					height: 1920,
					overflow: 'visible',
				}}
			>
				{/* SVG filter to make the line 'sketchy' */}
				<defs>
					<filter id="rough-paper-filter">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.04"
							numOctaves="5"
							result="noise"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							in2="noise"
							scale="5"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
					<marker
						id="arrowhead"
						markerWidth="10"
						markerHeight="7"
						refX="9"
						refY="3.5"
						orient="auto"
					>
						<polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
					</marker>
				</defs>
				{/* The path itself */}
				<path
					ref={ref}
					d={pathD}
					stroke="#f97316"
					strokeWidth={8}
					strokeLinecap="round"
					fill="none"
					strokeDasharray={length}
					strokeDashoffset={strokeDashoffset}
					markerEnd="url(#arrowhead)"
					style={{
						filter: 'url(#rough-paper-filter)',
						opacity: animProgress,
					}}
				/>
			</svg>
		</AbsoluteFill>
	);
};

// --- Helper: New "Scrapbook" Activity Card ---
// This is the new card, styled like a polaroid/scrapbook item.
const CollageCard: React.FC<{
	activity: Activity;
	animProgress: number; // Spring value (0 to 1)
	layout: { x: number; y: number; rotate: number; fromX: number; fromY: number };
}> = ({ activity, animProgress, layout }) => {
	// Interpolate all properties based on the spring
	const x = interpolate(animProgress, [0, 1], [layout.fromX, layout.x]);
	const y = interpolate(animProgress, [0, 1], [layout.fromY, layout.y]);
	const rotate = interpolate(animProgress, [0, 1], [layout.rotate - 10, layout.rotate]);
	const scale = animProgress;
	const opacity = animProgress;

	return (
		<div
			style={{
				position: 'absolute',
				width: 400,
				backgroundColor: 'white',
				borderRadius: 12,
				boxShadow: '8px 10px 30px rgba(0, 0, 0, 0.2)',
				padding: 16,
				// Apply all animations
				transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
				opacity: opacity,
			}}
		>
			{/* Image */}
			<div style={{ height: 280, borderRadius: 6, overflow: 'hidden' }}>
				{activity.media?.[0]?.url ? (
					<Img
						src={activity.media[0].url}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							background: 'linear-gradient(135deg, #f97316, #7c3aed)',
						}}
					/>
				)}
			</div>
			{/* Time Badge (like a sticker) */}
			<div
				style={{
					position: 'absolute',
					top: -15,
					left: -20,
					fontFamily: righteous,
					fontSize: 24,
					color: 'white',
					backgroundColor: '#f97316',
					padding: '8px 16px',
					borderRadius: 20,
					transform: 'rotate(-8deg)',
					border: '3px solid white',
					boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
				}}
			>
				{activity.time}
			</div>

			{/* Title (handwritten font) */}
			<div
				style={{
					fontFamily: caveat,
					fontSize: 40,
					fontWeight: 700,
					color: '#1e293b',
					textAlign: 'center',
					marginTop: 20,
					lineHeight: 1.1,
				}}
			>
				{activity.title}
			</div>

			{/* Location */}
			{activity.location?.name && (
				<div
					style={{
						fontFamily: inter,
						fontSize: 20,
						fontWeight: 600,
						color: '#f97316',
						textAlign: 'center',
						marginTop: 8,
					}}
				>
					📍 {activity.location.name}
				</div>
			)}
		</div>
	);
};

// --- SCENE 1: Intro (Tweaked for GenZ vibe) ---
const IntroScene: React.FC<{
	destination: string;
	userName: string;
	userProfilePic?: string;
	coverImageUrl?: string;
}> = ({ destination, userName, userProfilePic, coverImageUrl }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const titleSpring = spring({
		frame,
		fps,
		config: { damping: 100, stiffness: 120 },
	});
	const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
	const titleOpacity = titleSpring;

	const userSpring = spring({
		frame: frame - 20,
		fps,
		config: { damping: 100, stiffness: 120 },
	});
	const userY = interpolate(userSpring, [0, 1], [50, 0]);
	const userOpacity = userSpring;

	return (
		<AbsoluteFill style={{ backgroundColor: '#fefcf7' }}>
			{/* Optional cover image, but desaturated and textured */}
			{coverImageUrl && (
				<Img
					src={coverImageUrl}
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						opacity: 0.3,
						filter: 'grayscale(80%) blur(5px)',
					}}
				/>
			)}
			{/* Paper texture overlay */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: 0.5,
					background:
						'url(https://www.transparenttextures.com/patterns/paper.png)',
				}}
			/>

			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 40,
				}}
			>
				{/* Destination Title */}
				<div
					style={{
						fontFamily: righteous,
						fontSize: 140,
						color: '#1e293b',
						textAlign: 'center',
						lineHeight: 1,
						letterSpacing: '-5px',
						transform: `translateY(${titleY}px)`,
						opacity: titleOpacity,
						textShadow: '0 4px 0px rgba(249, 115, 22, 0.8)',
					}}
				>
					{destination}
				</div>

				{/* "A Trip By" text */}
				<div
					style={{
						fontFamily: caveat,
						fontSize: 60,
						color: '#475569',
						marginTop: 30,
						transform: `translateY(${userY}px)`,
						opacity: userOpacity,
					}}
				>
					A trip by
				</div>

				{/* User Info (Sticker style) */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 20,
						marginTop: 20,
						backgroundColor: 'white',
						padding: '16px 32px',
						borderRadius: 50,
						boxShadow: '5px 5px 20px rgba(0,0,0,0.15)',
						border: '3px solid #1e293b',
						transform: `translateY(${userY}px) rotate(-2deg)`,
						opacity: userOpacity,
					}}
				>
					{userProfilePic && (
						<Img
							src={userProfilePic}
							style={{
								width: 60,
								height: 60,
								borderRadius: '50%',
								border: '3px solid #f97316',
							}}
						/>
					)}
					<div
						style={{
							fontFamily: righteous,
							fontSize: 40,
							color: '#1e293b',
						}}
					>
						@{userName}
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- SCENE 2: The NEW Day Collage Scene ---
// This is where the magic happens.
const DayCollageScene: React.FC<{
	day: Day;
	sceneFrame: number;
}> = ({ day, sceneFrame }) => {
	const { fps } = useVideoConfig();
	const { activities } = day;

	// --- Dynamic Layout Engine ---
	// Pre-defined positions for up to 6 activities
	// [x, y, rotate, fromX, fromY]
	const layouts = [
		// Layout for 1 activity
		[
			{ x: 340, y: 700, rotate: -2, fromX: 340, fromY: 2000 },
		],
		// Layout for 2 activities
		[
			{ x: 100, y: 500, rotate: -5, fromX: -500, fromY: 500 },
			{ x: 580, y: 1000, rotate: 3, fromX: 1200, fromY: 1000 },
		],
		// Layout for 3 activities
		[
			{ x: 100, y: 450, rotate: 4, fromX: -500, fromY: 450 },
			{ x: 580, y: 800, rotate: -3, fromX: 1200, fromY: 800 },
			{ x: 100, y: 1150, rotate: 2, fromX: -500, fromY: 1150 },
		],
		// Layout for 4 activities
		[
			{ x: 100, y: 400, rotate: -4, fromX: -500, fromY: 400 },
			{ x: 580, y: 650, rotate: 3, fromX: 1200, fromY: 650 },
			{ x: 100, y: 950, rotate: 5, fromX: -500, fromY: 950 },
			{ x: 580, y: 1250, rotate: -2, fromX: 1200, fromY: 1250 },
		],
		// Layout for 5 activities
		[
			{ x: 340, y: 860, rotate: 1, fromX: 340, fromY: 2000 }, // Center
			{ x: 100, y: 400, rotate: -5, fromX: -500, fromY: 400 },
			{ x: 580, y: 500, rotate: 4, fromX: 1200, fromY: 500 },
			{ x: 100, y: 1300, rotate: 3, fromX: -500, fromY: 1300 },
			{ x: 580, y: 1200, rotate: -3, fromX: 1200, fromY: 1200 },
		],
		// Layout for 6 activities
		[
			{ x: 100, y: 350, rotate: -5, fromX: -500, fromY: 350 },
			{ x: 580, y: 550, rotate: 3, fromX: 1200, fromY: 550 },
			{ x: 100, y: 800, rotate: 2, fromX: -500, fromY: 800 },
			{ x: 580, y: 1000, rotate: -4, fromX: 1200, fromY: 1000 },
			{ x: 100, y: 1250, rotate: 5, fromX: -500, fromY: 1250 },
			{ x: 580, y: 1450, rotate: 1, fromX: 1200, fromY: 1450 },
		],
	];

	// Pick the correct layout based on activity count
	// Cap at 6, use 0-indexing
	const currentLayout =
		layouts[Math.min(activities.length, 6) - 1] || layouts[0];

	// --- Animation Timings ---
	const DAY_TITLE_START = 0;
	const DAY_TITLE_DURATION = 45; // 1.5s
	const ACTIVITY_START = DAY_TITLE_DURATION;
	const ACTIVITY_DURATION = 30; // 1s per activity
	const ARROW_DELAY = 15; // Arrow starts drawing 0.5s after card starts

	// Day Title Animation
	const titleSpring = spring({
		frame: sceneFrame - DAY_TITLE_START,
		fps,
		durationInFrames: DAY_TITLE_DURATION,
	});
	const titleY = interpolate(titleSpring, [0, 1], [-200, 100]);
	const titleOpacity = titleSpring;

	return (
		<AbsoluteFill style={{ backgroundColor: '#fefcf7', overflow: 'hidden' }}>
			{/* Paper texture overlay */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: 0.5,
					background:
						'url(https://www.transparenttextures.com/patterns/paper.png)',
				}}
			/>

			{/* Day Title */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					textAlign: 'center',
					top: 0,
					transform: `translateY(${titleY}px)`,
					opacity: titleOpacity,
					zIndex: 1000,
				}}
			>
				<div
					style={{
						fontFamily: righteous,
						fontSize: 90,
						color: '#1e293b',
						lineHeight: 1,
						textShadow: '0 4px 0px rgba(249, 115, 22, 0.8)',
					}}
				>
					Day {day.day}
				</div>
				<div
					style={{
						fontFamily: caveat,
						fontSize: 50,
						color: '#475569',
						marginTop: 10,
					}}
				>
					{day.title}
				</div>
			</div>

			{/* Render each activity card */}
			{activities.map((activity, index) => {
				if (!currentLayout[index]) return null; // Safety check

				const cardStartFrame = ACTIVITY_START + index * ACTIVITY_DURATION;
				const cardProgress = spring({
					frame: sceneFrame - cardStartFrame,
					fps,
					config: { damping: 100, stiffness: 120 },
				});

				return (
					<CollageCard
						key={index}
						activity={activity}
						animProgress={cardProgress}
						layout={currentLayout[index]}
					/>
				);
			})}

			{/* Render each connecting arrow */}
			{activities.map((_, index) => {
				if (index === 0) return null; // No arrow for the first card
				if (!currentLayout[index] || !currentLayout[index - 1]) return null;

				const arrowStartFrame =
					ACTIVITY_START + index * ACTIVITY_DURATION - ARROW_DELAY;

				const arrowProgress = spring({
					frame: sceneFrame - arrowStartFrame,
					fps,
					config: { damping: 100, stiffness: 120 },
				});

				// Get center points of cards
				const fromPos = {
					x: currentLayout[index - 1].x + 200, // + half width
					y: currentLayout[index - 1].y + 200, // + approx half height
				};
				const toPos = {
					x: currentLayout[index].x + 200,
					y: currentLayout[index].y + 200,
				};

				return (
					<HandDrawnArrow
						key={`arrow-${index}`}
						from={fromPos}
						to={toPos}
						animProgress={arrowProgress}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// --- SCENE 3: Outro (Tweaked for GenZ vibe) ---
const OutroScene: React.FC<{ sceneFrame: number }> = ({ sceneFrame }) => {
	const { fps } = useVideoConfig();

	const logoSpring = spring({ frame: sceneFrame, fps });
	const textSpring = spring({ frame: sceneFrame - 15, fps });
	const ctaSpring = spring({ frame: sceneFrame - 30, fps });

	return (
		<AbsoluteFill style={{ backgroundColor: '#fefcf7' }}>
			{/* Paper texture overlay */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: 0.5,
					background:
						'url(https://www.transparenttextures.com/patterns/paper.png)',
				}}
			/>

			<AbsoluteFill
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 40,
				}}
			>
				{/* Logo */}
				<div
					style={{
						fontFamily: righteous,
						fontSize: 120,
						color: '#1e293b',
						transform: `scale(${logoSpring})`,
						opacity: logoSpring,
						textShadow: '0 4px 0px rgba(249, 115, 22, 0.8)',
					}}
				>
					🗺️ OnQuest
				</div>

				{/* Subtext */}
				<div
					style={{
						fontFamily: caveat,
						fontSize: 60,
						color: '#475569',
						transform: `scale(${textSpring})`,
						opacity: textSpring,
					}}
				>
					Your Adventure, Your Story
				</div>

				{/* CTA */}
				<div
					style={{
						fontFamily: righteous,
						fontSize: 50,
						color: 'white',
						backgroundColor: '#f97316',
						padding: '20px 40px',
						borderRadius: 50,
						border: '4px solid #1e293b',
						boxShadow: '5px 5px 20px rgba(0,0,0,0.15)',
						transform: `scale(${ctaSpring}) rotate(-3deg)`,
						opacity: ctaSpring,
					}}
				>
					onquest.in
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Main Composition: NEW LOGIC ---
export const QuestVideo: React.FC<QuestVideoProps> = ({
	destination,
	userName,
	userProfilePic,
	coverImageUrl,
	days,
	questTitle,
}) => {
	// <-- The rogue '_' is gone from this line
	const frame = useCurrentFrame();

	// --- New Duration Calculation ---
	const INTRO_DURATION = 120; // 4 seconds
	const OUTRO_DURATION = 90; // 3 seconds

	// Each day gets a base time + time for each activity + a small buffer
	const DAY_TITLE_DURATION = 45; // 1.5s for title
	const PER_ACTIVITY_DURATION = 35; // ~1.2s per activity (slight overlap)
	const DAY_OUTRO_BUFFER = 60; // 2s to admire the final collage

	const dayTimings = useMemo(() => {
		let currentTime = INTRO_DURATION;
		const timings: Array<{ start: number; end: number; day: Day }> = [];

		days.forEach((day) => {
			// A day with 0 activities shouldn't be rendered
			if (day.activities.length === 0) return;

			const duration =
				DAY_TITLE_DURATION +
				day.activities.length * PER_ACTIVITY_DURATION +
				DAY_OUTRO_BUFFER;

			timings.push({
				start: currentTime,
				end: currentTime + duration,
				day,
			});
			currentTime += duration;
		});
		return { timings, outroStart: currentTime };
	}, [days]);

	const { timings, outroStart } = dayTimings;

	// --- Render Logic ---
	return (
		<AbsoluteFill>
			{/* Intro */}
			<Sequence from={0} durationInFrames={INTRO_DURATION}>
				<IntroScene
					destination={destination}
					userName={userName}
					userProfilePic={userProfilePic}
					coverImageUrl={coverImageUrl}
				/>
			</Sequence>

			{/* Day Scenes */}
			{timings.map((timing) => (
				<Sequence
					key={timing.day.day}
					from={timing.start}
					durationInFrames={timing.end - timing.start}
				>
					<DayCollageScene
						day={timing.day}
						sceneFrame={frame - timing.start}
					/>
				</Sequence>
			))}

			{/* Outro */}
			<Sequence from={outroStart} durationInFrames={OUTRO_DURATION}>
				<OutroScene sceneFrame={frame - outroStart} />
			</Sequence>
		</AbsoluteFill>
	);
};

// --- Calculate total duration (NEW LOGIC) ---
export const calculateDuration = (days: Day[]): number => {
	const INTRO_DURATION = 120;
	const OUTRO_DURATION = 90;
	const DAY_TITLE_DURATION = 45;
	const PER_ACTIVITY_DURATION = 35;
	const DAY_OUTRO_BUFFER = 60;

	const daysDuration = days.reduce((total, day) => {
		if (day.activities.length === 0) return total;
		return (
			total +
			DAY_TITLE_DURATION +
			day.activities.length * PER_ACTIVITY_DURATION +
			DAY_OUTRO_BUFFER
		);
	}, 0);

	return INTRO_DURATION + daysDuration + OUTRO_DURATION;
};