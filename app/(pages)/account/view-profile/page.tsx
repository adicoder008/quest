'use client'
import React, { useState } from 'react';
import { ArrowRight, Camera, Check, ChevronLeft, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import Footer from '@/components/phoneComponents/Footer';
import { useRouter } from 'next/navigation'
import { PostCardProps } from '@/components/My-Profile/profile/PostCard';
import { PostCard } from '@/components/My-Profile/profile/PostCardNew';
interface Props { }

function Page(props: Props) {
    const { } = props
    const router = useRouter();
    const navigateTo = (path: string) => {
        router.push(path);
    }

    //dummy data
    const tags = ["Travel Photographer", "Bagpacker", "Adventure Seeker"]
    const posts = 32;
    const followers = 332;
    const followings = 233;
    const postsList: PostCardProps[] = [
        {
            postId: 'post_001',
            avatar: 'https://picsum.photos/seed/user1/200',
            username: 'creative_coder',
            timeAgo: '15m ago',
            location: 'Bengaluru, India',
            content: 'Just pushed the final commit for my new side project! 🚀 It\'s a tool to visualize sorting algorithms. Check it out on GitHub! #coding #react #typescript',
            likes: 128,
            comments: 16,
            isVerified: true,
            level: 'Pro',
            images: ['https://picsum.photos/seed/post1/800/600'],
        },
        {
            postId: 'post_002',
            avatar: 'https://picsum.photos/seed/user2/200',
            username: 'wanderlust_anna',
            timeAgo: '2h ago',
            location: 'Kyoto, Japan',
            content: 'Absolutely breathtaking views at Fushimi Inari Shrine today. The thousands of torii gates are magical. ✨⛩️ #travel #japan #kyoto #explore',
            likes: 842,
            comments: 58,
            isVerified: false,
              images: [
            'https://picsum.photos/seed/post2a/800/600',
            'https://picsum.photos/seed/post2b/600/800',
            'https://picsum.photos/seed/post2c/800/800',
              ],
        },
        {
            postId: 'post_003',
            avatar: 'https://picsum.photos/seed/user3/200',
            username: 'FoodieFiesta',
            timeAgo: '1d ago',
            location: 'Mumbai, India',
            content: 'This Vada Pav was on another level! 🤤 The perfect blend of spices. Mumbai street food never disappoints. What\'s your favorite? #food #streetfood #mumbai #indianfood',
            likes: 451,
            comments: 92,
            level: 'Gold Member',
        },
        {
            postId: 'post_004',
            avatar: 'https://picsum.photos/seed/user4/200',
            username: 'PhilosoRaptor',
            timeAgo: '5d ago',
            location: 'The Internet',
            content: 'If you try to fail, and succeed, which one have you done?',
            likes: 2048,
            comments: 312,
            isVerified: true,
            // This post intentionally has no images or level.
        },
        {
            postId: 'post_005',
            avatar: 'https://picsum.photos/seed/user5/200',
            username: 'minimal_jane',
            timeAgo: '3w ago',
            location: 'Copenhagen, Denmark',
            content: 'Sunday morning coffee and a good book. It\'s the simple things. ☕️📖 #minimalism #simpleliving #hygge',
            likes: 310,
            comments: 25,
            images: ['https://picsum.photos/seed/post5/800/800'],
        },
    ];


    const handleImageUpload = () => {
        // Handle profile image upload
        console.log('Upload image');
    };

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col">

            {/* Main Content */}
            <div className="flex-1 text-white">
                <div className="z-10 w-full mb-20">

                    <div className='relative w-full h-42'>
                        <div className="flex justify-center mb-8">
                            <img src="/large.png" alt="cover-img" className="w-full h-full object-cover absolute" />

                            <div className="flex gap-3 text-white">
                                <div className="absolute left-2 -bottom-18 w-28 h-28 rounded-full overflow-hidden border-1 border-purple-900 bg-gray-800">
                                    <img
                                        src="/image 10.png"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* profile info  */}
                                <div className='absolute left-32 -bottom-20 flex flex-col gap-0 justify-center items-start right-3'>
                                    <div className='flex gap-2 justify-center items-center'>
                                        <div className='text-2xl font-semibold'> Sarah Parker </div>
                                        <div className=' text-xs px-2 py-1 bg-[#572910] rounded-2xl'>Scout</div>
                                        <div>
                                            0
                                        </div>
                                    </div>
                                    <div className='text-white/38 my-1 flex text-[10px] gap-1 justify-around items-center'>
                                        {tags.map((tag, index) => (
                                            <span key={tag} className="whitespace-nowrap">
                                                {tag}
                                                {index < tags.length - 1 && <span className="mx-1">|</span>}
                                            </span>
                                        ))}

                                    </div>
                                    <div className='flex justify-between text-sm gap-2 '>
                                        <p className='flex gap-1'>{posts} <span className='text-white/30'>posts</span>
                                        </p>
                                        <p className='flex gap-1'>{followers} <span className='text-white/30'>followers</span>
                                        </p>
                                        <p className='flex gap-1'>{followings} <span className='text-white/30'>followings</span>
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* <div className='absolute bg-[#F7CEB0] text-black p-3  rounded-full -bottom-6 right-0'>
                                <Pencil size={30}/>
                                </div> */}
                        </div>
                    </div>


                    {/* desc  */}
                    <div className='mt-28 p-4 '>
                        <p className='text-xs'>
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consectetur incidunt aspernatur facilis libero esse, harum officia veritatis placeat, illum fugiat, dolor obcaecati deserunt?
                        </p>

                        <div className='grid grid-cols-2 gap-2 mt-4'>
                            <button className='flex justify-center items-center px-2 py-1 bg-[#F86F0A] text-white rounded-md'>  <Plus /> Follow </button>
                            <button className='items-center px-2 py-1 border-1 rounded-md border-white'> Message </button>
                        </div>

                    </div>



                    {/* posts  */}
                    <div className='mt-4 bg-[#1F222A] w-full h-[560px] '>
                        <div className='flex justify-between p-4'>
                            <div className='flex flex-col gap-1'>
                                <div className='text-2xl font-sans'>Activity</div>
                                <div className='text-white/30'>{followers} followers</div>
                                <div className='flex gap-2'>
                                    <button className='px-4 py-1 bg-[#EA6100] rounded-2xl'>Post</button>
                                    <button className='px-4 py-1 border-1 border-white/30 rounded-2xl'>Quest</button>
                                </div>
                            </div>
                            <div>
                                <button className='flex bg-[#EA6100] text-white py-1 px-2 rounded-xl'>
                                    <Plus /> Follow
                                </button>
                            </div>
                        </div>

                        {/* posts list  */}
                        <div className='mt-2 mb-24 p-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {postsList.map((post) => (
                                <div key={post.postId} className="flex-shrink-0">
                                    <PostCard {...post} />
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className='flex w-full justify-center items-center m-1 p-2 text-[12px]'>
                        Show all posts <ArrowRight size={20} />
                    </div>


                    
                    {/* recent trips  */}
                    <div className='w-full]'>

                    </div>

                </div>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Page