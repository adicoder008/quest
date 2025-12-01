import React from 'react'
import Image from 'next/image';

const Mid = () => {
  const features = [
    {
      img: "/Mid1.png",
      title: "Create & Share Your Journey",
      desc: "Turn your itinerary into a post :- share, build, and get ideas"
    },
    {
      img: "/Mid2.png",
      title: "Explore Quests",
      desc: "Explore Quests created by others, get inspired, and plan your own adventure."
    },
    {
      img: "/Mid3.png",
      title: "Finish Quests. Flaunt Badges",
      desc: "Travel’s more fun when there’s a score to beat. Stay OnQuest!"
    }
  ];

  return (
    <div className='bg-black py-20 px-4 relative overflow-hidden'>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#EA6100] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F86F0A] rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className='relative z-10 max-w-7xl mx-auto'>
        <div className='text-center mb-16 space-y-4'>
          <h2 className='text-4xl md:text-5xl font-mont font-bold text-white tracking-tight'>
            Join the <span className='text-[#EA6100]'>Quest</span> Community
          </h2>
          <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
            Discover how thousands of travelers are turning their journeys into lasting memories.
          </p>
        </div>

        {/* Single Row Layout */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

          {/* Feature 1 */}
          <div className='group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500 h-[400px]'>
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image src="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1974&auto=format&fit=crop" alt="Create" width={1974} height={1316} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="w-12 h-12 rounded-full bg-[#EA6100] flex items-center justify-center mb-4 text-white text-xl">✍️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Create & Share</h3>
              <p className="text-gray-300 leading-relaxed">Turn your chaotic travel notes into beautiful, structured Quests that inspire others.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className='group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500 h-[400px]'>
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" alt="Explore" width={2021} height={1347} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4 text-white text-xl">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-2">Explore the World</h3>
              <p className="text-gray-300 leading-relaxed">Find hidden gems and local favorites curated by real travelers, not algorithms.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className='group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500 h-[400px]'>
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image src="/CommunityChampion.svg" alt="Gamify" width={400} height={400} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4 text-white text-xl">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2">Earn Badges</h3>
              <p className="text-gray-300 leading-relaxed">Level up your traveler rank and unlock exclusive rewards.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Mid
