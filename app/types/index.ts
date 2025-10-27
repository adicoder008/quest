export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  about?:string;
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
  savedPosts?: string[]; // Array of post IDs
  badges?: number[];
  quests?: string[]; // Array of quest IDs

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

export interface Quest {
  coverImageUrl: Quest;
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
  text: string; // Changed from 'content' to 'text' to match component usage
  caption?: string; // Added optional caption
  userName: string; // Added userName
  userProfilePic: string; // Added userProfilePic
  createdAt: string; // Should be a string (ISO) from Firestore
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
  
  // Event-specific fields
  eventTitle?: string;
  eventSubtitle?: string;
  eventPrice?: string | null;
  eventDate?: string | null;
  eventLocation?: string;
  eventCapacity?: number | null;
  attendeesCount?: number;
  
  // Quest completion fields
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
  
  // Event-specific
  eventTitle?: string;
  eventSubtitle?: string;
  eventPrice?: string;
  eventDate?: Date;
  eventLocation?: string;
  eventCapacity?: number;
  
  // Quest-specific
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

