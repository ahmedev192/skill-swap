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
  id: number;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserSkill {
  id: number;
  userId: string;
  skillId: number;
  type: number; // 1=Offered, 2=Requested
  level: number; // 1=Beginner, 2=Intermediate, 3=Expert
  description?: string;
  requirements?: string;
  creditsPerHour: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  skill: Skill;
  user: User;
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
  id: number;
  teacherId: string;
  studentId: string;
  userSkillId: number;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  creditsCost: number;
  status: number; // 1=Pending, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled, 6=Disputed
  notes?: string;
  meetingLink?: string;
  isOnline: boolean;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  teacherConfirmed: boolean;
  studentConfirmed: boolean;
  confirmedAt?: string;
  teacher: User;
  student: User;
  userSkill: UserSkill;
}

export interface Review {
  id: number;
  reviewerId: string;
  revieweeId: string;
  sessionId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  isVisible: boolean;
  reviewer: User;
  reviewee: User;
  session: Session;
}

export interface Match {
  id: number;
  userId1: string;
  userId2: string;
  skill1Id: number;
  skill2Id: number;
  compatibilityScore: number;
  createdAt: string;
  isViewed: boolean;
}

export interface NotificationData {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: number; // 1=SessionRequest, 2=SessionConfirmed, 3=SessionReminder, 4=SessionCompleted, 5=NewMessage, 6=NewReview, 7=CreditEarned, 8=CreditSpent, 9=System, 10=MatchFound, 11=GroupEvent
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  actionUrl?: string;
  user: User;
}