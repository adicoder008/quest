import { useState, useEffect } from 'react';
import { getUserProfile } from '../lib/profileService';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  photoURL?: string;
  backgroundURL?: string;
  level: string;
  levelDescription: string;
  currentQP: number;
  targetQP: number;
  nextLevel: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  badge: string;
  badgeIcon: string;
  profession?: string;
}

export const useUserProfile = (uid: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile(uid);
        if (userData) {
          setProfile(userData as UserProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchProfile();
    }
  }, [uid]);

  return { profile, loading, error, setProfile };
};
