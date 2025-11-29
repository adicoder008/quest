import React, { useState, useEffect } from 'react';
import { Copy, X, Search, Send, User, Check, Share2, MessageCircle, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import chatService from '@/lib/chatService';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    questId: string;
    questTitle?: string;
    onShareToFeed?: () => void;
}

interface UserResult {
    uid: string;
    displayName: string;
    photoURL: string;
    username?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, questId, questTitle, onShareToFeed }) => {
    const [user] = useAuthState(auth);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [recentChats, setRecentChats] = useState<UserResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);
    const [sentUsers, setSentUsers] = useState<Set<string>>(new Set());

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/quest/${questId}` : '';

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSentUsers(new Set());
            fetchRecentChats();
        }
    }, [isOpen, user]);

    const fetchRecentChats = async () => {
        if (!user?.uid) return;
        try {
            // Fetch recent chats (simplified: querying chats where user is member)
            // In a real app, we'd use chatService.getUserChats() if it returns user details
            // For now, let's try to fetch from 'chats' collection
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('members', 'array-contains', user.uid),
                orderBy('updatedAt', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(q);
            const recents: UserResult[] = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.type === 'one_on_one' && data.memberInfo) {
                    // Find the other member
                    const otherId = data.members.find((id: string) => id !== user.uid);
                    if (otherId && data.memberInfo[otherId]) {
                        recents.push({
                            uid: otherId,
                            displayName: data.memberInfo[otherId].name || 'User',
                            photoURL: data.memberInfo[otherId].photoURL || '',
                        });
                    }
                }
            });

            setRecentChats(recents);
        } catch (error) {
            console.error("Error fetching recent chats:", error);
        }
    };

    // Debounced User Search
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim() || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const usersRef = collection(db, 'users');
                const q = query(
                    usersRef,
                    where('displayName', '>=', searchQuery),
                    where('displayName', '<=', searchQuery + '\uf8ff'),
                    limit(5)
                );

                const snapshot = await getDocs(q);
                const users: UserResult[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (doc.id !== user?.uid) {
                        users.push({
                            uid: doc.id,
                            displayName: data.displayName || 'Unknown User',
                            photoURL: data.photoURL || '',
                            username: data.username
                        });
                    }
                });
                setSearchResults(users);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, user?.uid]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: questTitle || 'Check out this Quest',
                    text: `Check out this Quest: ${questTitle}`,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            copyToClipboard();
        }
    };

    const handleSendToUser = async (targetUser: UserResult) => {
        if (!user || !user.uid) return;

        setSending(true);
        try {
            const chatId = await chatService.getOrCreateOneOnOneChat(
                { uid: user.uid, name: user.displayName || 'User', photoURL: user.photoURL || '' },
                { uid: targetUser.uid, name: targetUser.displayName, photoURL: targetUser.photoURL }
            );

            const messageText = `Check out this Quest: ${questTitle || 'Amazing Journey'}\n${shareUrl}`;
            await chatService.sendMessage(chatId, {
                uid: user.uid,
                text: messageText,
                authorName: user.displayName || 'User',
                authorPhoto: user.photoURL || ''
            });

            toast.success(`Sent to ${targetUser.displayName}!`);
            setSentUsers(prev => new Set(prev).add(targetUser.uid));
        } catch (error) {
            console.error("Error sending quest:", error);
            toast.error("Failed to send quest");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-xl max-w-md w-full border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white">Share Quest</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Social Share Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this Quest: ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                                <MessageCircle size={24} className="text-[#25D366]" />
                            </div>
                            <span className="text-xs text-gray-400">WhatsApp</span>
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this Quest: ${questTitle}`)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-12 h-12 bg-[#1DA1F2]/10 rounded-full flex items-center justify-center group-hover:bg-[#1DA1F2]/20 transition-colors">
                                <Twitter size={24} className="text-[#1DA1F2]" />
                            </div>
                            <span className="text-xs text-gray-400">Twitter</span>
                        </a>

                        <button
                            onClick={copyToClipboard}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                {copied ? <Check size={24} className="text-green-500" /> : <LinkIcon size={24} className="text-white" />}
                            </div>
                            <span className="text-xs text-gray-400">Copy Link</span>
                        </button>

                        <button
                            onClick={handleNativeShare}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                <Share2 size={24} className="text-white" />
                            </div>
                            <span className="text-xs text-gray-400">More</span>
                        </button>
                    </div>

                    {/* Recent Chats */}
                    {recentChats.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Chats</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {recentChats.map(chatUser => (
                                    <button
                                        key={chatUser.uid}
                                        onClick={() => handleSendToUser(chatUser)}
                                        className="flex flex-col items-center gap-2 min-w-[60px] group"
                                        disabled={sentUsers.has(chatUser.uid) || sending}
                                    >
                                        <div className="relative">
                                            <img
                                                src={chatUser.photoURL || '/default-avatar.png'}
                                                alt={chatUser.displayName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-orange-500 transition-all"
                                            />
                                            {sentUsers.has(chatUser.uid) && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <Check size={16} className="text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 truncate w-full text-center">
                                            {chatUser.displayName.split(' ')[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search & Send */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Send to User</h4>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                            {searching ? (
                                <div className="text-center py-4 text-gray-500 text-sm">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <div
                                        key={result.uid}
                                        className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={result.photoURL || '/default-avatar.png'}
                                                alt={result.displayName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="text-white font-medium text-sm">{result.displayName}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSendToUser(result)}
                                            disabled={sentUsers.has(result.uid) || sending}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sentUsers.has(result.uid)
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                }`}
                                        >
                                            {sentUsers.has(result.uid) ? 'Sent' : 'Send'}
                                        </button>
                                    </div>
                                ))
                            ) : searchQuery.length >= 2 ? (
                                <div className="text-center py-4 text-gray-500 text-sm">No users found</div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
