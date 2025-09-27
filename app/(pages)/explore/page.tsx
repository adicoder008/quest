//testing
import Header from '@/components/phoneComponents/header'
// import Index from '@/components/Feed/Index'
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import TrendingQuestCard from '@/components/Explore/TrendingQuestCard'

const page = () => {
  return (
    <>
    {/* <Index/>->old linkedin type feed */}
    <div className='bg-black text-white'>
    <Header/>
    <div className='mx-2'>
      <div className='BG_IMAGE: bg-[url("https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWR2ZW50dXJlfGVufDB8fDB8fHww")] mb-5 bg-no-repeat bg-cover bg-center h-1/2 pt-4 pb-20'>
          
        {/* <div className='text-white text-3xl font-bold text-center mb-6'>Explore</div>
        <div className='text-white text-center mb-6 px-4'>Discover quests, connect with adventurers, and embark on new journeys. Your next adventure awaits!</div> */}
        <div className=" bottom-0 left-0 p-3  w-full text-white">
          <h2 className="font-bold text-lg">Ride the Skies in Royal Style</h2>
          <p className="text-sm">Hot Air Balloon – Jaipur, Rajasthan</p>
        </div>
      {/* <div className='flex justify-center mb-6'> */}
      </div>

      {/* Trending Quests */}
      <div className='mb-5'>
        <div className='mb-2 '>
          <h3 className="font-semibold text-2xl ">Trending Quests</h3>
          <p>What other travelers are upto this week.</p>
        </div>
        {/* <h3 className="font-semibold text-2xl ">Trending Quests</h3>
        <p>What other travelers are upto this week.</p> */}
        <div className="flex space-x-3 overflow-x-scroll scrollbar-hide">
          <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb'/>
          <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0'/>
          <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7'/>
          <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470'/>
          <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156'/>
          <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91'/>
          {/* <TrendingQuestCard cardTitle='Historic Trails – Hampi' cardALT='H    */}
          
        </div>
      </div>

      <div className=''>
        <div className='mb-2 '>
          <h3 className="font-semibold text-2xl ">Recommended  for  you</h3>
          <p>Handpicked just for you</p>
        </div>
        <div className="flex space-x-3 overflow-x-scroll scrollbar-hide">
          <TrendingQuestCard cardTitle='Catch the Sunrise – Nandi Hills' cardContent='start your day above the clouds' cardALT='Nandi Hills' cardURL='https://images.unsplash.com/photo-1506744038136-46273834b3fb'/>
          <TrendingQuestCard cardTitle='Serene Backwaters – Kerala' cardContent='start your day above the clouds' cardALT='Kerala' cardURL='https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0'/>
          <TrendingQuestCard cardTitle='Majestic Forts – Rajasthan' cardContent='start your day above the clouds' cardALT='Rajasthan' cardURL='https://images.unsplash.com/photo-1500534623283-312aade485b7'/>
          <TrendingQuestCard cardTitle='Misty Mountains – Himachal' cardContent='start your day above the clouds' cardALT='Himachal' cardURL='https://images.unsplash.com/photo-1501785888041-af3ef285b470'/>
          <TrendingQuestCard cardTitle='Golden Sands – Rann of Kutch' cardContent='start your day above the clouds' cardALT='Rann of Kutch' cardURL='https://images.unsplash.com/photo-1494526585095-c41746248156'/>
          <TrendingQuestCard cardTitle='Lush Tea Gardens – Munnar' cardContent='start your day above the clouds' cardALT='Munnar' cardURL='https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91'/>
          {/* <TrendingQuestCard cardTitle='Historic Trails – Hampi' cardALT='H    */}
          
        </div>
      </div>


    </div>

    <Footer />
    </div>
    </>
  )
}

export default page