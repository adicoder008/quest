import React, { useEffect, useState } from "react";
import { getUserData } from "@/lib/firebaseSerive";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateBio } from "@/lib/profileService";
import { Edit2, Save, X } from "lucide-react";

interface UserData {
  bio?: string;
}

const AboutSection: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchUserData = async () => {
      try {
        const data = await getUserData(uid);
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserData({
          bio: "This user has not set a bio yet. Share your adventures and experiences to inspire others!"
        });
      }
    };

    fetchUserData();
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return;
    
    setIsLoading(true);
    try {
      await updateBio(uid, bioInput.trim());
      setUserData({ ...userData, bio: bioInput.trim() });
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update bio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBioInput(userData?.bio || "");
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setBioInput(userData?.bio || "");
  };

  if (!userData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-20 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">About</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            aria-label="Edit about section"
          >
            <Edit2 size={16} className="text-gray-600 group-hover:text-[#EA6100]" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Tell others about yourself, your interests, and what you're passionate about..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#EA6100] focus:border-transparent text-sm"
              rows={6}
              maxLength={300}
            />
            
            {/* Character count */}
            <div className="text-xs text-gray-500 text-right">
              {bioInput.length}/300 characters
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || bioInput.trim() === userData?.bio}
                className="px-4 py-2 text-sm bg-[#EA6100] text-white rounded-lg hover:bg-[#d55600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {userData.bio || "No bio available. Click edit to add your bio."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;