// app/types/index.ts - UPDATED Quest interface

export interface Quest {
  id: string;
  uid: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: { [key: string]: 'owner' | 'editor' | 'viewer' };
  isPublic: boolean;
  itinerary: QuestItinerary;
  createdAt: string;
  updatedAt: string;
  source?: string;
  transportMode?: string[];
  tripType?: string;
  preferences?: string[];
  budget?: number;
  copiedFrom?: string;
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isPostedToFeed?: boolean;
  associatedPostId?: string | null;
  
  // FIXED: Single cover image URL (same format as posts)
  coverImageUrl?: string; // Compressed image URL (same as post photoUrl)
}

// Rest of your types remain the same...
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  about?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  questsCompleted?: number;
  eventsCreated?: number;
  totalXP?: number;
  currentLevel?: number;
  isPrivate?: boolean;
  allowMessages?: boolean;
  showOnlineStatus?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  followers?: string[]; 
  following?: string[];
  savedPosts?: string[];
  badges?: number[];
  quests?: string[];
}

export interface QuestActivity {
  time: string;
  title: string;
  description: string;
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  media?: { url: string; type: 'image' | 'video' }[];
  tags?: string[];
  type?: 'activity' | 'travel';
  collapsed?: boolean;
}

export interface QuestDay {
  day: number;
  date: string;
  title: string;
  activities: QuestActivity[];
}

export interface QuestItinerary {
  days: QuestDay[];
}

export interface QuestContext {
  questId: string;
  questTitle: string;
  description: string;
  category?: string;
  xpEarned?: number;
  difficulty?: 'easy' | 'normal' | 'hard';
}

export interface Post {
  imageUrls?: any;
  likedBy: any;
  id: string;
  authorId: string;
  text: string;
  caption?: string;
  userName: string;
  userProfilePic: string;
  createdAt: string;
  questId?: string;
  questTitle?: string;
  questImage?: string;
  photoUrl?: string;
  postType?: 'regular' | 'event' | 'sponsored' | 'quest_completion';
  contentType?: 'text_only' | 'photo_only' | 'photo_with_text';
  location?: string | null;
  topics?: string[];
  taggedUsers?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  isDeleted?: boolean;
  visibility?: 'public' | 'friends' | 'private';
  isSaved?: boolean;
  eventTitle?: string;
  eventSubtitle?: string;
  eventPrice?: string | null;
  eventDate?: string | null;
  eventLocation?: string;
  eventCapacity?: number | null;
  attendeesCount?: number;
  questContext?: QuestContext;
}

export interface Comment {
  id: string;
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  likeCount: number;
  replyCount: number;
}

export interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: (text: string) => void;
  currentUser: User | null;
}

export interface CreatePostModalProps {
  onClose: () => void;
  user: User | null;
}

export interface CommentModalProps {
  post: Post;
  onClose: () => void;
  onAddComment: (text: string) => void;
  currentUser: User | null;
}

export interface CreatePostData {
  authorId: string;
  content: string;
  questId?: string;
  questTitle?: string;
  questImage?: string;
  createdAt: string;
  userName?: string;
  userProfilePic?: string;
  postType?: string;
  location?: string | null;
  topics?: string[];
  imageFile?: File;
  visibility?: string;
  eventTitle?: string;
  eventSubtitle?: string;
  eventPrice?: string;
  eventDate?: Date;
  eventLocation?: string;
  eventCapacity?: number;
  questContext?: {
    questId: string;
    questTitle: string;
    description: string;
    category?: string;
    xpEarned?: number;
    difficulty?: string;
  };
}

export interface CommentData {
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
}