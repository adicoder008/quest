//testing
import Header from '@/components/phoneComponents/header'
// import Index from '@/components/Feed/Index'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import TrendingQuestCard from '@/components/Explore/TrendingQuestCard'
import SearchBar from '@/components/Explore/SearchBar'
import { ChevronRight } from 'lucide-react'

const page = () => {
  return (
    <>
      {/* <Index/>->old linkedin type feed */}
      <div className='bg-black text-white'>
        <Header />

        <div
          className=' relative bg-[url("https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWR2ZW50dXJlfGVufDB8fDB8fHww")]
    mb-5 bg-no-repeat bg-cover bg-center h-[360px] sm:h-2/4 pt-4 pb-20 overflow-hidden'
        >
          {/* Search bar placed at top center */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[70%]">
            <SearchBar />
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 p-4 w-full text-white bg-gradient-to-t from-black/60 to-transparent">
            <h2 className="text-sm sm:text-lg">Ride the Skies in Royal Style</h2>
            <p className="text-xl sm:text-2xl font-bold">
              Hot Air Balloon – Jaipur, Rajasthan
            </p>
          </div>
        </div>
        <div className='m-6 pt-4'>
          {/* Trending Quests */}
          <div className='mb-5'>
            <div className='mb-2'>
              <div className='flex justify-between'>
                <h3 className="font-semibold text-2xl ">Trending Quests</h3>
                <div> <ChevronRight className='font-bold size-8' /> </div>
              </div>
              <p>What other travelers are upto this week.</p>
            </div>
            <div className="flex overflow-x-scroll scrollbar-none">
              <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb' />
              <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
              <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
              <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
              <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
              <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
              <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb' />
              <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
              <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
              <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
              <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
              <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
              <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb' />
              <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
              <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
              <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
              <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
              <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
              {/* <TrendingQuestCard cardTitle='Historic Trails – Hampi' cardALT='H    */}
            </div>

          </div>
          <div className='mb-2'>
            <div className='flex justify-between '>
              <h3 className="font-semibold text-2xl ">Recommended  for  you</h3>
              <div> <ChevronRight className='font-bold size-8' /> </div>
            </div>
            <p>Handpicked just for you</p>
          </div>
          <div className="flex space-x-3 overflow-x-scroll scrollbar-none">
            <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb' />
            <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
            <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
            <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
            <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
            <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
            <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
            <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
            <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
            <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
            <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
            <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' />
            <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7' />
            <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470' />
            <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156' />
            <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' />
            {/* <TrendingQuestCard cardTitle='Historic Trails – Hampi' cardALT='H    */}

          </div>
        </div>

      </div>
        <Footer />
    </>
  )
}

export default page