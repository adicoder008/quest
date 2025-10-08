"use client";
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Circle } from 'lucide-react';
import QuestCard from '@/components/accounts/quest-card';


const Page = () => {

    const router = useRouter();

    const navigateTo = (path: string) => {
        router.push(path);
    }

    const londonTrip = {
        location: 'London',
        month: 'April',
        year: '2026',
        rating: 4.0,
        duration: '7 days trip',
        backgroundImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
        travelers: [
            'https://i.pravatar.cc/150?img=1',
            'https://i.pravatar.cc/150?img=2',
            'https://i.pravatar.cc/150?img=3',
            'https://i.pravatar.cc/150?img=4'
        ]
    };

    const maldivesTrip = {
        location: 'Maldives',
        month: 'Oct',
        year: '2024',
        rating: 4.8,
        duration: '7 days trip',
        backgroundImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        travelers: [
            'https://i.pravatar.cc/150?img=5',
            'https://i.pravatar.cc/150?img=6',
            'https://i.pravatar.cc/150?img=7',
            'https://i.pravatar.cc/150?img=8'
        ]
    };

    return (
        <>
            <p className='text-3xl h-[107/2px] w-full bg-black font-semibold p-5 text-[#F7CEB0] flex gap-2 items-center justify-between'>
                <ChevronLeft onClick={() => navigateTo('/account')} size={40} />
                Completed Quests
                <span>
                    {/* TODO: change this to real profile badge  */}
                    <Circle size={20} />
                </span>

            </p>
            <div className='bg-[#121212] text-white min-h-[800px] sm:min-h-[650px]'>
                <div className='p-2 flex justify-center gap-4 pt-8'>
                    <QuestCard {...londonTrip} orientation="portrait" />
                    <QuestCard {...maldivesTrip} orientation="portrait" />
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Page