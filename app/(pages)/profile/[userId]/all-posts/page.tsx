"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getUserData } from '@/lib/firebaseSerive';
import { addComment, savePost, unsavePost, sharePost } from '@/lib/postService';
import MobilePostCard from '@/components/Home/MobilePostCard';
import { ArrowLeft } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc as firestoreDoc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';

interface Post {
    id: string;
    uid: string;
    authorId: string;
    userName: string;
    userProfilePic: string;
    text: string;
    photoUrl?: string;
    createdAt: any;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    location: string;
    likedBy: string[];
    isSaved?: boolean;
    postType?: 'regular' | 'event' | 'sponsored' | 'quest_completion';
    questData?: any;
    questContext?: any;

}

const PublicAllPostsPage = () => {
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostForMenu, setSelectedPostForMenu] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (userId) {
                try {
                    const userDoc = await getUserData(userId);
                    setProfileUser(userDoc);
                    await fetchUserPosts(userId, user);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const fetchUserPosts = async (uid: string, currentUser: any) => {
        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                where('uid', '==', uid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Get current user data to check saved posts
            let currentUserData: any = null;
            if (currentUser) {
                currentUserData = await getUserData(currentUser.uid);
            }

            const postsData: Post[] = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    uid: data.uid || uid,
                    authorId: data.authorId || data.uid || '',
                    userName: data.userName || profileUser?.displayName || 'User',
                    userProfilePic: data.userProfilePic || profileUser?.photoURL || '/default-avatar.png',
                    text: data.text || '',
                    photoUrl: Array.isArray(data.photoUrl) ? data.photoUrl[0] : data.photoUrl || '',
                    createdAt: data.createdAt,
                    likeCount: data.likeCount || 0,
                    commentCount: data.commentCount || 0,
                    shareCount: data.shareCount || 0,
                    location: data.location || '',
                    likedBy: data.likedBy || [],
                    isSaved: currentUserData?.savedPosts?.includes(doc.id) || false,
                    postType: data.postType || 'regular',
                    questData: data.questData || null,
                    questContext: data.questContext || null,
                };
            });

            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching user posts:', error);
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!currentUser?.uid) return;

        try {
            const updatePosts = (posts: Post[]) => posts.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likedBy?.includes(currentUser.uid);
                    return {
                        ...p,
                        likeCount: isLiked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1,
                        likedBy: isLiked
                            ? (p.likedBy || []).filter((uid: string) => uid !== currentUser.uid)
                            : [...(p.likedBy || []), currentUser.uid]
                    };
                }
                return p;
            });

            setPosts(updatePosts);

            const post = posts.find(p => p.id === postId);
            if (!post) return;

            const isLiked = post.likedBy?.includes(currentUser.uid);
            const postRef = firestoreDoc(db, 'posts', postId);

            if (isLiked) {
                await updateDoc(postRef, {
                    likedBy: arrayRemove(currentUser.uid),
                    likeCount: increment(-1)
                });
            } else {
                await updateDoc(postRef, {
                    likedBy: arrayUnion(currentUser.uid),
                    likeCount: increment(1)
                });
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleSavePost = async (postId: string) => {
        if (!currentUser?.uid) return;

        try {
            const updatePosts = (posts: Post[]) => posts.map(p =>
                p.id === postId ? { ...p, isSaved: !p.isSaved } : p
            );

            const post = posts.find(p => p.id === postId);
            const isSaved = post?.isSaved;

            setPosts(updatePosts);

            if (isSaved) {
                await unsavePost(postId, currentUser.uid);
            } else {
                await savePost(postId, currentUser.uid);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleSharePost = async (postId: string) => {
        if (currentUser?.uid) {
            try {
                await sharePost(postId, currentUser.uid);

                const updatePosts = (posts: Post[]) => posts.map(p =>
                    p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
                );

                setPosts(updatePosts);
            } catch (error) {
                console.error('Error sharing post:', error);
            }
        }
    };

    const handleAddComment = async (postId: string, commentText: string) => {
        if (!currentUser?.uid || !commentText.trim()) return;

        try {
            await addComment(postId, {
                uid: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userProfilePic: currentUser.photoURL || '',
                text: commentText.trim()
            });

            const updatePosts = (posts: Post[]) => posts.map(post =>
                post.id === postId ? { ...post, commentCount: (post.commentCount || 0) + 1 } : post
            );

            setPosts(updatePosts);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            {/* Header */}
            <div className='sticky top-0 z-10 bg-black border-b border-gray-700'>
                <div className='flex items-center gap-4 px-5 py-4'>
                    <button
                        onClick={() => router.back()}
                        className='text-white hover:text-[#EA6100] transition-colors'
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className='text-2xl font-semibold text-white'>Posts</h1>
                        <p className='text-sm text-gray-400'>@{profileUser?.displayName || 'User'}</p>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className='pb-20'>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <MobilePostCard
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            onLike={() => handleLikePost(post.id)}
                            onComment={(text) => handleAddComment(post.id, text)}
                            onSave={() => handleSavePost(post.id)}
                            onShare={() => handleSharePost(post.id)}
                            onMenuClick={() => setSelectedPostForMenu(post)}
                        />
                    ))
                ) : (
                    <div className='text-center py-12 px-5'>
                        <div className='bg-[#292929] rounded-xl p-8'>
                            <p className='text-gray-400 text-lg mb-2'>No posts yet</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicAllPostsPage;
