'use client';

import { useState } from 'react';
import { Users, X, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { notifyGroupAdd } from '@/lib/notificationService';
import { useAuth } from '@/hooks/useAuth'; 


interface CreateGroupFromQuestProps {
  questId: string;
  questTitle: string;
  questMembers: string[]; // Array of user IDs
  currentUserId: string;
}

export const CreateGroupFromQuest = ({ 
  questId, 
  questTitle, 
  questMembers, 
  currentUserId 
}: CreateGroupFromQuestProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(questMembers);
  const [groupName, setGroupName] = useState(`${questTitle} - Chat`);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();
  const { user: currentUser } = useAuth(); // <-- 2. Get the current user from the hook

  const loadUsers = async () => {
    try {
      const usersData = [];
      for (const memberId of questMembers) {
        const userQuery = query(collection(db, 'users'), where('__name__', '==', memberId));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          usersData.push({
            id: memberId,
            displayName: userData.displayName || 'Anonymous',
            photoURL: userData.photoURL || '/default-avatar.png',
            email: userData.email
          });
        }
      }
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    loadUsers();
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      // Note: alert() can have issues in sandboxed environments.
      // Consider a custom UI modal for messages.
      console.log('Validation failed: Group name and members are required.');
      return;
    }

    // <-- 3. Add a check to ensure the user object is available
    if (!currentUser) {
      console.error('Authentication error. Please make sure you are logged in.');
      setLoading(false);
      return;
    }


    setLoading(true);
    try {
      // Check if group for this quest already exists
      const existingGroupQuery = query(
        collection(db, 'chats'),
        where('questId', '==', questId),
        where('isGroup', '==', true)
      );
      
      const existingGroups = await getDocs(existingGroupQuery);

      
      if (!existingGroups.empty) {
        // Note: confirm() can have issues in sandboxed environments.
        // A custom UI modal is recommended for confirmations.
        const confirmed = confirm('A group for this quest already exists. Do you want to create another one?');
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      // Create the group
      const groupData = {
        name: groupName.trim(),
        isGroup: true,
        members: selectedMembers,
        createdBy: currentUserId,
        createdAt: serverTimestamp(),
        lastMessage: 'Group created for quest',
        lastMessageTime: serverTimestamp(),
        questId: questId,
        questTitle: questTitle
      };

      const chatRef = await addDoc(collection(db, 'chats'), groupData);

      // <-- 4. The error is now fixed. 'currentUser' is defined from the hook.
      await notifyGroupAdd(
        chatRef.id,
        groupName,
        currentUserId,
        currentUser.displayName || 'Someone',
        currentUser.photoURL || '',
        selectedMembers
      );

      // Send initial message
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        text: `🎯 Group created for quest: ${questTitle}`,
        senderId: 'system',
        senderName: 'Quest System',
        senderAvatar: '/quest-icon.png',
        timestamp: serverTimestamp(),
        read: false,
        type: 'quest_invite'
      });

      setShowModal(false);
      
      // Navigate to chats page
      router.push(`/chats?chatId=${chatRef.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 bg-[#F7CEB0] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors"
      >
        <Users size={20} />
        Create Group Chat
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Create Quest Group</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Quest Info */}
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Quest</p>
                <p className="text-white font-medium">{questTitle}</p>
              </div>

              {/* Group Name */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
                  maxLength={50}
                />
              </div>

              {/* Members Selection */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Select Members ({selectedMembers.length} selected)
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-800 rounded-lg p-2">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      disabled={user.id === currentUserId}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        user.id === currentUserId
                          ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                          : selectedMembers.includes(user.id)
                          ? 'bg-[#F7CEB0]/20 border-2 border-[#F7CEB0]'
                          : 'bg-gray-750 hover:bg-gray-700'
                      }`}
                    >
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium text-sm">
                          {user.displayName}
                          {user.id === currentUserId && ' (You)'}
                        </p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                      {selectedMembers.includes(user.id) && (
                        <Check size={20} className="text-[#F7CEB0] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={loading || !groupName.trim() || selectedMembers.length === 0}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    loading || !groupName.trim() || selectedMembers.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
