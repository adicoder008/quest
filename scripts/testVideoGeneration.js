// scripts/testVideoGeneration.js
/**
 * Local testing script for video generation
 * Run with: node scripts/testVideoGeneration.js
 */

const sampleQuestData = {
  destination: "Tokyo, Japan",
  userName: "adventure_seeker",
  userProfilePic: "https://i.pravatar.cc/150?img=1",
  coverImageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
  questTitle: "Amazing Tokyo Adventure",
  days: [
    {
      day: 1,
      date: "2025-03-15",
      title: "Arrival & Shibuya Exploration",
      activities: [
        {
          time: "Morning",
          title: "Arrive at Narita Airport",
          description: "Pick up JR Pass and take Narita Express to Tokyo Station",
          location: {
            name: "Narita International Airport",
            coordinates: { lat: 35.7720, lng: 140.3929 }
          },
          tags: ["travel", "arrival"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400",
              type: "image"
            }
          ]
        },
        {
          time: "Afternoon",
          title: "Shibuya Crossing",
          description: "Experience the world's busiest pedestrian crossing and explore Shibuya district",
          location: {
            name: "Shibuya Crossing, Tokyo",
            coordinates: { lat: 35.6595, lng: 139.7004 }
          },
          tags: ["sightseeing", "iconic"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400",
              type: "image"
            }
          ]
        },
        {
          time: "Evening",
          title: "Dinner at Ichiran Ramen",
          description: "Try authentic tonkotsu ramen at this famous chain restaurant",
          location: {
            name: "Ichiran Shibuya",
            coordinates: { lat: 35.6586, lng: 139.7016 }
          },
          tags: ["food", "ramen"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400",
              type: "image"
            }
          ]
        }
      ]
    },
    {
      day: 2,
      date: "2025-03-16",
      title: "Traditional Tokyo",
      activities: [
        {
          time: "Morning",
          title: "Senso-ji Temple",
          description: "Visit Tokyo's oldest temple and explore Nakamise Shopping Street",
          location: {
            name: "Senso-ji Temple, Asakusa",
            coordinates: { lat: 35.7148, lng: 139.7967 }
          },
          tags: ["temple", "culture"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
              type: "image"
            }
          ]
        },
        {
          time: "Afternoon",
          title: "TeamLab Borderless",
          description: "Immerse yourself in digital art at this interactive museum",
          location: {
            name: "Mori Building Digital Art Museum",
            coordinates: { lat: 35.6249, lng: 139.7756 }
          },
          tags: ["art", "technology"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400",
              type: "image"
            }
          ]
        },
        {
          time: "Evening",
          title: "Tokyo Skytree",
          description: "Watch the sunset from the tallest structure in Japan",
          location: {
            name: "Tokyo Skytree",
            coordinates: { lat: 35.7101, lng: 139.8107 }
          },
          tags: ["viewpoint", "night"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400",
              type: "image"
            }
          ]
        }
      ]
    },
    {
      day: 3,
      date: "2025-03-17",
      title: "Day Trip to Mount Fuji",
      activities: [
        {
          time: "Morning",
          title: "Travel to Mount Fuji",
          description: "Take express bus from Shinjuku to Kawaguchiko",
          location: {
            name: "Lake Kawaguchiko",
            coordinates: { lat: 35.5085, lng: 138.7639 }
          },
          tags: ["travel", "nature"],
          collapsed: false,
          type: "travel",
          media: []
        },
        {
          time: "Afternoon",
          title: "Lake Kawaguchiko",
          description: "Enjoy stunning views of Mount Fuji reflected in the lake",
          location: {
            name: "Lake Kawaguchiko",
            coordinates: { lat: 35.5085, lng: 138.7639 }
          },
          tags: ["nature", "photography"],
          collapsed: false,
          media: [
            {
              url: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400",
              type: "image"
            }
          ]
        },
        {
          time: "Evening",
          title: "Return to Tokyo",
          description: "Take evening bus back to Shinjuku",
          location: {
            name: "Shinjuku Station",
            coordinates: { lat: 35.6896, lng: 139.7006 }
          },
          tags: ["travel"],
          collapsed: false,
          type: "travel",
          media: []
        }
      ]
    }
  ]
};

console.log('📹 Sample Quest Data for Video Generation\n');
console.log('=' .repeat(50));
console.log('Destination:', sampleQuestData.destination);
console.log('Duration:', sampleQuestData.days.length, 'days');
console.log('Total Activities:', sampleQuestData.days.reduce((sum, day) => sum + day.activities.length, 0));
console.log('=' .repeat(50));
console.log('\n✅ This data structure is ready for video generation!');
console.log('\n📋 To test:');
console.log('1. Start your Next.js dev server: npm run dev');
console.log('2. Navigate to a quest page');
console.log('3. Click "Generate Video" button');
console.log('4. The video will use a placeholder in development mode');
console.log('\n💡 Sample data structure:');
console.log(JSON.stringify(sampleQuestData, null, 2));

// Calculate estimated video duration
const introDuration = 4; // seconds
const outroDuration = 3; // seconds
const activitiesPerScreen = 3;
const daysDuration = sampleQuestData.days.reduce((total, day) => {
  const screens = Math.ceil(day.activities.length / activitiesPerScreen);
  return total + (screens * 6); // 6 seconds per screen
}, 0);

const totalDuration = introDuration + daysDuration + outroDuration;

console.log('\n⏱️  Estimated Video Duration:', totalDuration, 'seconds');
console.log('   Intro:', introDuration, 'sec');
console.log('   Days:', daysDuration, 'sec');
console.log('   Outro:', outroDuration, 'sec');

// Export for testing
module.exports = sampleQuestData;