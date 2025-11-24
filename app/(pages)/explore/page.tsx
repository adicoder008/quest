'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ChevronRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import TrendingQuestCard from '@/components/Explore/TrendingQuestCard';
import Footer from '@/components/phoneComponents/Footer';
import Header from '@/components/phoneComponents/header';
import NavBar from '@/components/LeftSideNav';
import ExploreRightSidebar from '@/components/RightSidebar/page';
import { Post, User as UserType } from '@/app/types';
import { getCurrentUserData } from '@/lib/authService';
import { auth, db } from '@/lib/firebase';
import useResponsive from '@/hooks/useResponsive';

const DesktopLoadingSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="relative w-full h-[224px] rounded-lg overflow-hidden bg-gray-800 animate-pulse">
        <div className="absolute bottom-2 left-2 w-3/4 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const MobileLoadingSkeleton = () => (
  <div className="flex space-x-3 overflow-x-scroll scrollbar-none">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="relative shrink-0 w-[216px] h-[224px] rounded-lg overflow-hidden bg-gray-800 animate-pulse mr-3"
      >
        <div className="absolute bottom-2 left-2 w-3/4 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const DESKTOP_MAIN_WIDTH = 50; // percentage of viewport width used for main content
const LEFT_NAV_WIDTH = 300;
const RIGHT_SIDEBAR_WIDTH = 350;
const SIDEBAR_GAP = 5;

const ExplorePage = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);

  const router = useRouter();
  const isDesktop = useResponsive(768);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName ?? undefined,
          email: currentUser.email ?? undefined,
          photoURL: currentUser.photoURL ?? undefined,
        });

        try {
          const userDetails = await getCurrentUserData();
          setUserData(userDetails);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestPosts = async () => {
      try {
        setLoading(true);

        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('postType', '==', 'quest_completion'), orderBy('createdAt', 'desc'), limit(24));

        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];

        querySnapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data(),
          } as Post);
        });

        setTrendingPosts(posts.slice(0, 12));

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

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const postsRef = collection(db, 'posts');
      const results: Post[] = [];
      const querySnapshot = await getDocs(query(postsRef, limit(100)));

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchLower = searchTerm.toLowerCase();

        const questTitle = data.questContext?.questTitle?.toLowerCase() || '';
        const questDescription = data.questContext?.description?.toLowerCase() || '';
        const postText = data.text?.toLowerCase() || '';
        const location = data.location?.toLowerCase() || '';
        const userName = data.userName?.toLowerCase() || '';

        if (
          questTitle.includes(searchLower) ||
          questDescription.includes(searchLower) ||
          postText.includes(searchLower) ||
          location.includes(searchLower) ||
          userName.includes(searchLower)
        ) {
          results.push({
            id: doc.id,
            ...data,
          } as Post);
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isDesktop) {
    return (
      <>
        <div className="bg-black text-white min-h-screen">
          <Header />

          <div className="relative bg-[url('https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWR2ZW50dXJlfGVufDB8fDB8fHww')] mb-5 bg-no-repeat bg-cover bg-center h-[420px] sm:h-[460px] pt-4 pb-24 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-2 w-full px-4">
              <div className="relative">
                <Search className="absolute text-white left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search quests, locations, or travelers..."
                  className="w-full bg-black/60 text-white pl-12 pr-12 py-3 rounded-full border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 w-full flex justify-center">
              <button
                onClick={() => router.push('/aitrip')}
                className="group relative bg-white text-black px-8 py-3.5 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Plan Your Trip with AI</span>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="m-6 pt-4">
            {searchQuery && (
              <div className="mb-6">
                {searching ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">Search Results ({searchResults.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((post) => (
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
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            )}

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
                <MobileLoadingSkeleton />
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
                <MobileLoadingSkeleton />
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
  }

  const totalFixedWidth = LEFT_NAV_WIDTH + RIGHT_SIDEBAR_WIDTH + SIDEBAR_GAP * 2;
  const containerStartExpression = `calc((100vw - (${totalFixedWidth}px + ${DESKTOP_MAIN_WIDTH}vw)) / 2)`;
  const mainLeftExpression = `calc(${containerStartExpression} + ${LEFT_NAV_WIDTH + SIDEBAR_GAP}px)`;
  const rightSidebarLeftExpression = `calc(${containerStartExpression} + ${LEFT_NAV_WIDTH + SIDEBAR_GAP}px + ${DESKTOP_MAIN_WIDTH}vw + ${SIDEBAR_GAP}px)`;

  const mainWidthStyle: React.CSSProperties = {
    width: `${DESKTOP_MAIN_WIDTH}vw`,
    marginLeft: mainLeftExpression,
    marginRight: 'auto',
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <NavBar
        user={user}
        onSignOut={handleSignOut}
        style={{ left: containerStartExpression, right: 'auto', width: `${LEFT_NAV_WIDTH}px` }}
      />

      <main className="relative min-h-screen bg-black" style={mainWidthStyle}>
        <div className="max-w-4xl mx-auto md:border-x border-gray-700 min-h-screen">

          <div className="relative bg-[url('https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWR2ZW50dXJlfGVufDB8fDB8fHww')] bg-no-repeat bg-cover bg-center h-[360px] overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-4 left-0 w-full px-6">
              <div className="relative">
                <Search className="absolute text-white left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search quests, locations, or travelers..."
                  className="w-full bg-black/60 text-white pl-12 pr-12 py-3 rounded-full border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 p-6 w-full flex justify-center">
              <button
                onClick={() => router.push('/aitrip')}
                className="group relative bg-white text-black px-8 py-3.5 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Plan Your Trip with AI</span>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 w-full border-b border-gray-700">
            {searchQuery && (
              <div>
                {searching ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">Search Results ({searchResults.length})</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((post) => (
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
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!searchQuery && (
            <div className="p-6">
              <div className="mb-8">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-2xl">Trending Quests</h3>
                      <p className="text-gray-400 text-sm">What other travelers are up to this week</p>
                    </div>
                    <button className="cursor-pointer hover:bg-gray-800 p-2 rounded-full transition-colors">
                      <ChevronRight className="font-bold w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <DesktopLoadingSkeleton />
                ) : trendingPosts.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div className="mb-8">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-2xl">Recommended for You</h3>
                      <p className="text-gray-400 text-sm">Handpicked just for you</p>
                    </div>
                    <button className="cursor-pointer hover:bg-gray-800 p-2 rounded-full transition-colors">
                      <ChevronRight className="font-bold w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <DesktopLoadingSkeleton />
                ) : recommendedPosts.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
          )}
        </div>
      </main>

      <ExploreRightSidebar
        user={user}
        userData={userData}
        style={{ left: rightSidebarLeftExpression, right: 'auto', width: `${RIGHT_SIDEBAR_WIDTH}px` }}
      />
    </div>
  );
};

export default ExplorePage;