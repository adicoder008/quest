'use client'
import React from 'react'
import { FaRegPlusSquare } from "react-icons/fa";
import { HiUser } from "react-icons/hi2";
import Link from 'next/link';
import { useState } from 'react';
import CreatePostModal from '@/components/Home/CreatePostModal';
import { User } from '@/app/types/index';
import { Post } from '@/app/types/index';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentUserData } from '@/lib/authService';
import { subscribeToPosts } from '@/lib/postService';
import { useRouter } from 'next/navigation';
import { House, Plus, Search } from 'lucide-react';


//TODO: Odd color acc to the selected tab.


const Footer = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userData = await getCurrentUserData();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser({
            uid: authUser.uid,
            displayName: authUser.displayName ?? undefined,
            email: authUser.email ?? undefined,
            photoURL: authUser.photoURL ?? undefined
          });
        }
      } else {
        setUser(null);
      }
    });

    // Subscribe to posts updates
    const unsubscribePosts = subscribeToPosts((newPosts: Post[]) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  return (
    <>
      {/* Create Post Modal */}
      {showCreateModal && user && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          user={user}
        />
      )}
      {/* Bottom Navigation */}
      <div className="py-1 fixed -bottom-1 left-0 right-0 border-1 border-black border-t-amber-100 bg-black backdrop-blur-md border-t border-peach-200/20">
        <div className="flex items-center justify-between px-6 py-2">
          <Link href={'/feed'}><div className="flex flex-col items-center text-peach-200 text-white">
            {/* <div className="w-6 h-6 mb-1">🏠</div> */}
            <House size={24} />
            <span className="text-xs">Home</span>
          </div></Link>

          <Link href={'/explore'}><div className="flex flex-col items-center text-white">
            {/* <div className="w-6 h-6 mb-1">🔍</div> */}
            <Search size={24} />
            {/* <FaSearchLocation size={22}/> */}

            <span className="text-xs ">Explore</span>
          </div></Link>

          <div onClick={() => setShowCreateModal(true)} className="flex flex-col items-center text-white">
            {/* <div className="w-6 h-6 mb-1">➕</div> */}
            <Plus size={22} className="" />
            <span className="text-xs ">Post</span>
          </div>

          <Link href={'/quest'}><div className="flex flex-col items-center text-white">
            {/* <Quest size={22} className="" /> */}
            <img src="/oq_logo.svg" alt="OQ logo" className="w-6 h-6 object-contain filter invert" />
            <span className="text-xs ">Quest</span>
          </div></Link>

          <Link href={'/account'}><div className="flex flex-col items-center text-[#EA6100]">
            {/* <div className="w-6 h-6 mb-1">👤</div> */}
            <HiUser size={22} className="" />
            <span className="text-xs">Account</span>
          </div>
          </Link>
        </div>
      </div>

    </>
  )
}

export default Footer
