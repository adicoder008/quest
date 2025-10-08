"use client";
import Footer from '@/components/phoneComponents/Footer'
import React from 'react'
import { useRouter } from 'next/navigation'
import {ChevronLeft, Circle} from 'lucide-react';


const Page = () => {

    const router = useRouter();

    const navigateTo = (path: string) => {
        router.push(path);
    }

    return (
        <>
            <p className='text-3xl h-[107/2px] w-full bg-black font-semibold p-5 text-[#F7CEB0] flex gap-2 items-center justify-between'>
                <ChevronLeft onClick={() => navigateTo('/account')} size={40} />
                Saved Quests
                <span>
                    {/* TODO: change this to real profile badge  */}
                    <Circle size={20}/>
                </span>

            </p>
            <div className='bg-[#121212] text-white min-h-[800px] sm:min-h-[650px] p-5'>

                <Footer />
            </div>
        </>
    )
}

export default Page