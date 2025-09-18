export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePhoto?: string;
  location?: string;
  languages: string[];
  timeZone?: string;
  isEmailVerified: boolean;
  isIdVerified?: boolean;
  peerEndorsements: number;
  rating: number;
  totalSessions: number;
  joinedAt: string;
  isOnline?: boolean;
  lastActive?: string;
  lastActiveAt?: string;
  role?: string;
}

export interface Skill {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  type: 'offering' | 'requesting';
  duration: number; // in minutes
  isOnline: boolean;
  isInPerson: boolean;
  availability: string[];
  creditsPerHour: number;
  tags: string[];
  createdAt: string;
  isActive: boolean;
}

export interface TimeCredit {
  balance: number;
  earned: number;
  spent: number;
  pending: number;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'earned' | 'spent' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  sessionId: string;
  description: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'file' | 'system';
}

export interface Session {
  id: string;
  skillId: string;
  studentId: string;
  teacherId: string;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  meetingUrl?: string;
  notes?: string;
  rating?: number;
  review?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  skill1Id: string;
  skill2Id: string;
  compatibilityScore: number;
  createdAt: string;
  isViewed: boolean;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'match' | 'booking' | 'message' | 'review' | 'credit';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}