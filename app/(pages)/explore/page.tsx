'use client';

import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import React, { useEffect, useState } from 'react';
import TrendingQuestCard from '@/components/Explore/TrendingQuestCard';
import SearchBar from '@/components/Explore/SearchBar';
import { ChevronRight } from 'lucide-react';
import { Post } from '@/app/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const ExplorePage = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch quest completion posts from the feed
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('postType', '==', 'quest_completion'),
          orderBy('createdAt', 'desc'),
          limit(24)
        );
        
        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];
        
        querySnapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data()
          } as Post);
        });
        
        // Split posts into trending and recommended
        // Trending: First 12 posts (most recent)
        setTrendingPosts(posts.slice(0, 12));
        
        // Recommended: Shuffle the remaining posts for variety
        const remaining = posts.slice(12);
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        setRecommendedPosts(shuffled.slice(0, 12));
        
      } catch (error) {
        console.error('Error fetching quest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestPosts();
  }, []);

  const LoadingSkeleton = () => (
    <div className="flex space-x-3 overflow-x-scroll scrollbar-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="relative flex-shrink-0 w-[216px] h-[224px] rounded-lg overflow-hidden bg-gray-800 animate-pulse mr-3"
        >
          <div className="absolute bottom-2 left-2 w-3/4 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-black text-white min-h-screen">
        <Header />

        {/* Hero Section with Search */}
        <div className="relative bg-[url('https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWR2ZW50dXJlfGVufDB8fDB8fHww')] mb-5 bg-no-repeat bg-cover bg-center h-[360px] sm:h-96 pt-4 pb-20 overflow-hidden">
          {/* Search bar */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[70%] z-10">
            <SearchBar />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 p-4 w-full text-white">
            <h2 className="text-sm sm:text-lg">Ride the Skies in Royal Style</h2>
            <p className="text-xl sm:text-2xl font-bold">
              Hot Air Balloon – Jaipur, Rajasthan
            </p>
          </div>
        </div>

        <div className="m-6 pt-4">
          {/* Trending Quests Section */}
          <div className="mb-8">
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-2xl">Trending Quests</h3>
                  <p className="text-gray-400 text-sm">What other travelers are up to this week</p>
                </div>
                <div className="cursor-pointer hover:bg-gray-800 p-2 rounded-full transition-colors">
                  <ChevronRight className="font-bold size-6 sm:size-8 text-gray-400" />
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : trendingPosts.length > 0 ? (
              <div className="flex space-x-3 overflow-x-scroll scrollbar-none pb-4">
                {trendingPosts.map((post) => (
                  <TrendingQuestCard
                    key={post.id}
                    postId={post.id}
                    questId={post.questContext?.questId || ''}
                    cardTitle={post.questContext?.questTitle || 'Untitled Quest'}
                    cardContent={post.questContext?.description || post.text || ''}
                    cardALT={post.questContext?.questTitle || 'Quest'}
                    cardURL={post.photoUrl || post.imageUrls?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
                    ownerName={post.userName || 'Anonymous'}
                    ownerPhoto={post.userProfilePic || ''}
                    xpEarned={post.questContext?.xpEarned}
                    difficulty={post.questContext?.difficulty}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending quests available yet</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to share your quest!</p>
              </div>
            )}
          </div>

          {/* Recommended for You Section */}
          <div className="mb-8">
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-2xl">Recommended for You</h3>
                  <p className="text-gray-400 text-sm">Handpicked just for you</p>
                </div>
                <div className="cursor-pointer hover:bg-gray-800 p-2 rounded-full transition-colors">
                  <ChevronRight className="font-bold size-6 sm:size-8 text-gray-400" />
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : recommendedPosts.length > 0 ? (
              <div className="flex space-x-3 overflow-x-scroll scrollbar-none pb-4">
                {recommendedPosts.map((post) => (
                  <TrendingQuestCard
                    key={post.id}
                    postId={post.id}
                    questId={post.questContext?.questId || ''}
                    cardTitle={post.questContext?.questTitle || 'Untitled Quest'}
                    cardContent={post.questContext?.description || post.text || ''}
                    cardALT={post.questContext?.questTitle || 'Quest'}
                    cardURL={post.photoUrl || post.imageUrls?.[0] || 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0'}
                    ownerName={post.userName || 'Anonymous'}
                    ownerPhoto={post.userProfilePic || ''}
                    xpEarned={post.questContext?.xpEarned}
                    difficulty={post.questContext?.difficulty}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No recommendations available yet</p>
                <p className="text-gray-500 text-sm mt-2">Explore more quests to get personalized recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ExplorePage;