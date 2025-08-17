import React, { useEffect, useState } from "react";
import { getUserData } from "../../../lib/firebaseSerive";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const auth = getAuth();

interface UserData {
  displayName: string;
  photoURL: string;
  backgroundURL?: string;
  title?: string;
  postsCount?: number;
  followers?: string[];
  following?: string[];
  isVerified?: boolean;
}

const ProfileHeader: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid); // Debug log
      setCurrentUser(user);
      
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      console.log("Fetching user data for UID:", uid); // Debug log
      const data = await getUserData(uid);
      console.log("Fetched data:", data); // Debug log
      
      if (data) {
        // Map the returned data to UserData type
        setUserData({
          displayName: data.displayName ?? currentUser?.displayName ?? "Guest User",
          photoURL: data.photoURL ?? currentUser?.photoURL ?? "https://via.placeholder.com/150",
          backgroundURL: data.backgroundURL,
          title: data.title,
          postsCount: data.postsCount,
          followers: data.followers,
          following: data.following,
          isVerified: data.isVerified,
        });
      } else {
        // Set default data if no document exists
        setUserData({
          displayName: currentUser?.displayName ?? "Guest User",
          photoURL: currentUser?.photoURL ?? "https://via.placeholder.com/150",
          title: "Travel Enthusiast",
          postsCount: 0,
          followers: [],
          following: [],
          isVerified: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Set default data if fetch fails
      setUserData({
        displayName: currentUser?.displayName ?? "Guest User",
        photoURL: currentUser?.photoURL ?? "https://via.placeholder.com/150",
        title: "Travel Enthusiast",
        postsCount: 0,
        followers: [],
        following: [],
        isVerified: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-[rgba(248,249,250,1)] border w-full overflow-hidden pb-[26px] rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
        <div className="animate-pulse">
          {/* Cover photo skeleton */}
          <div className="h-[149px] bg-gray-200 relative">
            <div className="absolute top-4 right-4 w-11 h-11 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Profile section skeleton */}
          <div className="px-[29px] -mt-10 max-md:px-5">
            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="w-11 h-11 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user is authenticated
  if (!currentUser) {
    return (
      <div className="bg-[rgba(248,249,250,1)] border w-full overflow-hidden pb-[26px] rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
        <div className="p-8 text-center">
          <p className="text-gray-500">Please sign in to view profile</p>
        </div>
      </div>
    );
  }

  // Show error state if userData is still null after loading
  if (!userData) {
    return (
      <div className="bg-[rgba(248,249,250,1)] border w-full overflow-hidden pb-[26px] rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
        <div className="p-8 text-center">
          <p className="text-red-500">Failed to load profile data</p>
          <button 
            onClick={() => fetchUserData(currentUser.uid)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(248,249,250,1)] border w-full overflow-hidden pb-[26px] rounded-lg border-[rgba(197,196,199,1)] border-solid max-md:max-w-full">
      <div className="flex flex-col relative min-h-[149px] w-full pt-[25px] pb-20 px-[70px] max-md:max-w-full max-md:px-5">
        <img
          src={userData.backgroundURL || "https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/dc866a18c1875c568a73ee825268f62151451697?placeholderIfAbsent=true"}
          alt="Cover image"
          className="absolute h-full w-full object-cover inset-0"
        />
        <div className="relative flex items-center gap-1 justify-center">
          <button
            aria-label="Edit cover"
            className="items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[rgba(248,111,10,0.10)] self-stretch flex w-11 gap-2.5 h-11 my-auto p-2.5 rounded-[64px] hover:bg-[rgba(248,111,10,0.20)] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="z-10 -mt-10 px-[29px] max-md:max-w-full max-md:px-5">
        <img
          src={userData.photoURL}
          alt="Profile picture"
          className="relative aspect-[1] object-cover w-24 rounded-full border-4 border-white shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
          }}
        />
        <div className="flex w-full flex-col items-stretch mt-2.5 max-md:max-w-full">
          <div className="flex w-full gap-[40px_100px] justify-between flex-wrap max-md:max-w-full">
            <div className="flex min-w-60 gap-3 w-[326px]">
              <div className="min-w-60 w-[326px]">
                <div className="flex w-full items-stretch gap-2">
                  <h1 className="text-black text-xl font-medium my-auto">
                    {userData.displayName}
                  </h1>
                  {userData.isVerified && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2" className="w-6 h-6">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.056-2.13c-.293-.303-.288-.694.018-.985.307-.29.718-.286 1.011.017l1.298 1.342 3.682-5.53c.12-.183.32-.29.526-.29.357 0 .688.291.688.612 0 .124-.065.249-.677.35z"/>
                    </svg>
                  )}
                </div>
                <div className="text-[#8B8A8F] text-sm font-medium">
                  {userData.title || "Travel Enthusiast"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 justify-center w-11">
              <button
                aria-label="Edit profile"
                className="items-center shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] bg-[rgba(248,111,10,0.10)] self-stretch flex w-11 gap-2.5 h-11 my-auto p-2.5 rounded-[64px] hover:bg-[rgba(248,111,10,0.20)] transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
         
          <div className="flex gap-3 text-sm text-[#8B8A8F] font-medium mt-2">
            <div>
              <span className="text-[rgba(51,51,51,1)]">{userData.postsCount || 0}</span>{" "}
              <span className="font-normal">posts</span>
            </div>
            <div>
              <span className="text-[rgba(51,51,51,1)]">{userData.followers?.length || 0}</span>{" "}
              <span className="font-normal">followers</span>
            </div>
            <div>
              <span className="text-[rgba(51,51,51,1)]">{userData.following?.length || 0}</span>{" "}
              <span className="font-normal">following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;