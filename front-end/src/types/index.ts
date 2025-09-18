export enum SessionStatus {
  Pending = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6
}

export enum SkillType {
  Offered = 1,
  Requested = 2
}

export enum SkillLevel {
  Beginner = 1,
  Intermediate = 2,
  Expert = 3
}

export enum MessageType {
  Text = 1,
  Image = 2,
  File = 3,
  System = 4
}

export enum NotificationType {
  SessionRequest = 1,
  SessionConfirmed = 2,
  SessionReminder = 3,
  SessionCompleted = 4,
  NewMessage = 5,
  NewReview = 6,
  CreditEarned = 7,
  CreditSpent = 8,
  System = 9,
  MatchFound = 10,
  GroupEvent = 11
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  isEmailVerified: boolean;
  isIdVerified: boolean;
  createdAt: string;
  lastActiveAt?: string;
  profileImageUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
  creditBalance: number;
  averageRating: number;
  totalReviews: number;
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
  type: SkillType;
  level: SkillLevel;
  description?: string;
  requirements?: string;
  creditsPerHour: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  skill: Skill;
  user: User;
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
  status: SessionStatus;
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

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  sessionId?: number;
  type: MessageType;
  attachmentUrl?: string;
  sender: User;
  receiver: User;
  session?: Session;
}

export interface Review {
  id: number;
  reviewerId: string;
  revieweeId: string;
  sessionId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  isVisible: boolean;
  reviewer: User;
  reviewee: User;
  session: Session;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  actionUrl?: string;
  user: User;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserProfileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}