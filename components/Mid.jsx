import React from 'react'

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

        {/* Bento Grid Layout */}
        <div className='grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6'>

          {/* Large Feature (Span 2 rows on desktop) */}
          <div className='md:col-span-1 md:row-span-2 group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500'>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <img src="/Mid1.png" alt="Create" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="w-12 h-12 rounded-full bg-[#EA6100] flex items-center justify-center mb-4 text-white text-xl">✍️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Create & Share</h3>
              <p className="text-gray-300 leading-relaxed">Turn your chaotic travel notes into beautiful, structured Quests that inspire others.</p>
            </div>
          </div>

          {/* Top Right Feature */}
          <div className='md:col-span-2 group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500 min-h-[300px]'>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10"></div>
            <img src="/Mid2.png" alt="Explore" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 md:top-0 md:left-0 md:h-full w-full md:w-1/2 p-8 z-20 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-4 text-white">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-2">Explore the World</h3>
              <p className="text-gray-300">Find hidden gems and local favorites curated by real travelers, not algorithms.</p>
            </div>
          </div>

          {/* Bottom Right Feature 1 */}
          <div className='group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#EA6100]/30 transition-all duration-500 min-h-[250px]'>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10"></div>
            <img src="/Mid3.png" alt="Gamify" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 md:top-0 md:left-0 md:h-full w-full md:w-1/2 p-8 z-20 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-4 text-white">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2">Earn Badges</h3>
              <p className="text-gray-300">Level up your traveler rank and unlock exclusive rewards.</p>
            </div>
          </div>

          {/* Bottom Right Feature 2 (Community) */}
          <div className='hidden md:block group relative bg-[#EA6100] rounded-3xl overflow-hidden min-h-[250px] flex flex-col items-center justify-center text-center p-6 hover:bg-[#F86F0A] transition-colors'>
            <div className="text-white text-5xl font-black mb-2">10k+</div>
            <h3 className="text-xl font-bold text-white">Quests Created</h3>
            <p className="text-white/80 text-sm mt-2">Join the fastest growing travel community</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Mid
