'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Send, 
  Image as ImageIcon, 
  X, 
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Phone,
  Video,
  Paperclip
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { User } from '@/app/types';
import { getCurrentUserData } from '@/lib/authService';
import useResponsive from '@/hooks/useResponsive';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: any;
  isGroup: boolean;
  members: string[];
  unreadCount: number;
  isOnline?: boolean;
  questId?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: any;
  imageUrl?: string;
  read: boolean;
  type: 'text' | 'image' | 'quest_invite';
}

// =================================================================
// CREATE GROUP MODAL
// =================================================================
interface CreateGroupModalProps {
  onClose: () => void;
  currentUser: User;
  questId?: string;
}

const CreateGroupModal = ({ onClose, currentUser, questId }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUser.uid);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [currentUser.uid]);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const members = [currentUser.uid, ...selectedUsers];
      const groupData = {
        name: groupName.trim(),
        isGroup: true,
        members,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        lastMessage: 'Group created',
        lastMessageTime: serverTimestamp(),
        ...(questId && { questId })
      };

      await addDoc(collection(db, 'chats'), groupData);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
            maxLength={50}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedUsers.includes(user.id)
                    ? 'bg-[#F7CEB0]/20 border-2 border-[#F7CEB0]'
                    : 'bg-gray-800 hover:bg-gray-750'
                }`}
              >
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{user.displayName || 'Anonymous'}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                {selectedUsers.includes(user.id) && (
                  <Check size={20} className="text-[#F7CEB0]" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading || !groupName.trim() || selectedUsers.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
            }`}
          >
            {loading ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// NEW DM MODAL
// =================================================================
interface NewDMModalProps {
  onClose: () => void;
  currentUser: User;
  onSelectUser: (userId: string) => void;
}

const NewDMModal = ({ onClose, currentUser, onSelectUser }: NewDMModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUser.uid);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [currentUser.uid]);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = async (userId: string) => {
    try {
      // Check if DM already exists
      const chatsQuery = query(
        collection(db, 'chats'),
        where('isGroup', '==', false),
        where('members', 'array-contains', currentUser.uid)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      const existingChat = chatsSnapshot.docs.find(doc => {
        const members = doc.data().members;
        return members.includes(userId);
      });

      if (existingChat) {
        onSelectUser(existingChat.id);
      } else {
        // Create new DM
        const otherUser = users.find(u => u.id === userId);
        const chatData = {
          isGroup: false,
          members: [currentUser.uid, userId],
          name: otherUser?.displayName || 'Anonymous',
          avatar: otherUser?.photoURL || '/default-avatar.png',
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        onSelectUser(chatRef.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating DM:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">New Message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none mb-4"
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="relative">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{user.displayName || 'Anonymous'}</p>
                  <p className="text-gray-400 text-sm">{user.title || 'Quest Explorer'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// CHAT MESSAGE COMPONENT
// =================================================================
interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const ChatMessage = ({ message, isOwn, showAvatar }: ChatMessageProps) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && !isOwn && (
        <img
          src={message.senderAvatar || '/default-avatar.png'}
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      
      {!showAvatar && !isOwn && <div className="w-8"></div>}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-400 mb-1 px-3">{message.senderName}</p>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-[#F7CEB0] text-black rounded-br-sm'
              : 'bg-gray-800 text-white rounded-bl-sm'
          }`}
        >
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90"
              onClick={() => window.open(message.imageUrl, '_blank')}
            />
          )}
          
          {message.text && <p className="text-sm break-words">{message.text}</p>}
          
          <div className={`flex items-center gap-1 justify-end mt-1 text-xs ${
            isOwn ? 'text-black/70' : 'text-gray-400'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isOwn && (
              message.read ? <CheckCheck size={14} /> : <Check size={14} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// MAIN CHATS PAGE
// =================================================================
export default function ChatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useResponsive(768);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = await getCurrentUserData();
        setUser(userData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load chats
  useEffect(() => {
    if (!user?.uid) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chatsData: Chat[] = [];

      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data();
        let chatName = data.name;
        let chatAvatar = data.avatar;

        // For DMs, get other user's info
        if (!data.isGroup) {
          const otherUserId = data.members.find((id: string) => id !== user.uid);
          if (otherUserId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                chatName = userData.displayName || 'Anonymous';
                chatAvatar = userData.photoURL || '/default-avatar.png';
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
        }

        chatsData.push({
          id: chatDoc.id,
          name: chatName,
          avatar: chatAvatar || '/default-avatar.png',
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime,
          isGroup: data.isGroup || false,
          members: data.members || [],
          unreadCount: 0,
          questId: data.questId
        });
      }

      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat?.id) return;

    const messagesQuery = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));

      setMessages(messagesData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageText.trim() && !uploadingImage) || !selectedChat || !user) return;

    try {
      const messageData = {
        text: messageText.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '/default-avatar.png',
        timestamp: serverTimestamp(),
        read: false,
        type: 'text'
      };

      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), messageData);

      // Update last message
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: messageText.trim() || '📷 Photo',
        lastMessageTime: serverTimestamp()
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !user) return;

    setUploadingImage(true);
    try {
      // Compress image
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `chats/${selectedChat.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, compressedFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Send message with image
      const messageData = {
        text: messageText.trim(),
        imageUrl,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '/default-avatar.png',
        timestamp: serverTimestamp(),
        read: false,
        type: 'image'
      };

      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), messageData);

      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: '📷 Photo',
        lastMessageTime: serverTimestamp()
      });

      setMessageText('');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please sign in to view chats</h2>
        </div>
      </div>
    );
  }

  // Mobile view - show chat list or conversation
  if (!isDesktop) {
    if (selectedChat) {
      return (
        <div className="h-screen bg-black flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center gap-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="text-white"
            >
              <ArrowLeft size={24} />
            </button>
            
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="text-white font-medium">{selectedChat.name}</h3>
              <p className="text-xs text-gray-400">
                {selectedChat.isGroup ? `${selectedChat.members.length} members` : 'Online'}
              </p>
            </div>

            <button className="text-gray-400">
              <Phone size={20} />
            </button>
            <button className="text-gray-400">
              <Video size={20} />
            </button>
            <button className="text-gray-400">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-black">
            {messages.map((message, index) => {
              const isOwn = message.senderId === user.uid;
              const prevMessage = messages[index - 1];
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-gray-900 border-t border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Paperclip size={24} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-full border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !uploadingImage}
                className={`p-3 rounded-full transition-colors ${
                  messageText.trim() || uploadingImage
                    ? 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Chat list view
    return (
      <div className="h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Chats</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewDM(true)}
              className="flex-1 bg-[#F7CEB0] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              New Chat
            </button>
            
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={20} />
              New Group
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-900 transition-colors border-b border-gray-800"
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {!chat.isGroup && chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="bg-[#F7CEB0] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {chat.unreadCount}
                </div>
              )}
            </button>
          ))}

          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users size={48} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No chats yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start a new conversation or create a group
              </p>
            </div>
          )}
        </div>

        {showCreateGroup && (
          <CreateGroupModal
            onClose={() => setShowCreateGroup(false)}
            currentUser={user}
          />
        )}

        {showNewDM && (
          <NewDMModal
            onClose={() => setShowNewDM(false)}
            currentUser={user}
            onSelectUser={(chatId) => {
              const chat = chats.find(c => c.id === chatId);
              if (chat) setSelectedChat(chat);
            }}
          />
        )}
      </div>
    );
  }

  // Desktop view - split screen
  return (
    <div className="h-screen bg-black flex">
      {/* Left Sidebar - Chat List */}
      <div className="w-96 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-4">Chats</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewDM(true)}
              className="flex-1 bg-[#F7CEB0] text-black px-3 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={18} />
              New Chat
            </button>
            
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Users size={18} />
              Group
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-gray-800 ${
                selectedChat?.id === chat.id ? 'bg-gray-800' : 'hover:bg-gray-850'
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {!chat.isGroup && chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-medium truncate text-sm">{chat.name}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="bg-[#F7CEB0] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {chat.unreadCount}
                </div>
              )}
            </button>
          ))}

          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users size={48} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No chats yet</h3>
              <p className="text-gray-400 text-sm">Start a new conversation or create a group</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center gap-4">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="text-white font-medium text-lg">{selectedChat.name}</h3>
              <p className="text-sm text-gray-400">
                {selectedChat.isGroup 
                  ? `${selectedChat.members.length} members` 
                  : selectedChat.isOnline ? 'Online' : 'Offline'
                }
              </p>
            </div>

            <button className="text-gray-400 hover:text-white transition-colors">
              <Phone size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Video size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users size={40} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                <p className="text-gray-400 text-sm">
                  Start the conversation by sending a message
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.uid;
                  const prevMessage = messages[index - 1];
                  const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="bg-gray-900 border-t border-gray-700 p-4">
            {uploadingImage && (
              <div className="mb-2 text-sm text-gray-400">
                Uploading image...
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Paperclip size={24} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-full border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
              />

              <button
                type="submit"
                disabled={(!messageText.trim() && !uploadingImage) || uploadingImage}
                className={`p-3 rounded-full transition-colors ${
                  messageText.trim() && !uploadingImage
                    ? 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={64} className="text-gray-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Select a chat</h2>
            <p className="text-gray-400 mb-6">
              Choose a conversation from the left sidebar to start messaging
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowNewDM(true)}
                className="bg-[#F7CEB0] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#f5c094] transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                New Message
              </button>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Users size={20} />
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          currentUser={user}
        />
      )}

      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          currentUser={user}
          onSelectUser={(chatId) => {
            const chat = chats.find(c => c.id === chatId);
            if (chat) setSelectedChat(chat);
          }}
        />
      )}
    </div>
  );
}