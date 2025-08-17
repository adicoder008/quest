import React, { useEffect, useState } from "react";
import { getUserData } from "../../../lib/firebaseSerive";
import { getAuth } from "firebase/auth";
import { updateBio } from "../../../lib/profileService";

const auth = getAuth();
const currentUser = auth.currentUser;
const uid = currentUser?.uid;

interface UserData {
  bio?: string;
}

const AboutSection: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
  }, []);

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
      <div className="bg-[rgba(248,249,250,1)] border w-full mt-3 pt-4 pb-6 px-8 rounded-lg border-[rgba(197,196,199,1)] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full mt-3 rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 px-8 max-md:px-5">
        <h2 className="text-base text-black font-medium">About</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Edit about section"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-gray-600"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-8 pb-6 max-md:px-5">
        {isEditing ? (
          <div className="mt-4 space-y-3">
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Tell others about yourself, your interests, and what you're passionate about..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={4}
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
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || bioInput.trim() === userData?.bio}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-[#8B8A8F] text-sm font-normal leading-[21px] whitespace-pre-wrap">
              {userData.bio || "No bio available. Click edit to add your bio."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;