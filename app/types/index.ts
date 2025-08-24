// types/index.ts
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
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
  id: string;
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
  photoUrl: string;
  postType: 'regular' | 'event' | 'sponsored' | 'quest_completion';
  contentType?: 'text_only' | 'photo_only' | 'photo_with_text';
  location?: string | null;
  topics: string[];
  taggedUsers: string[];
  caption: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isDeleted: boolean;
  visibility: 'public' | 'friends' | 'private';
  
  // Event-specific fields
  eventTitle?: string;
  eventSubtitle?: string;
  eventPrice?: string | null;
  eventDate?: Date | null;
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
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
  postType: string;
  location?: string | null;
  topics: string[];
  imageFile?: File;
  caption: string;
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