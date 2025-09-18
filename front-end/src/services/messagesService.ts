import api from './api';

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  sessionId?: number;
  type: number; // MessageType enum: Text=1, Image=2, File=3, System=4
  attachmentUrl?: string;
  sender: {
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
  };
  receiver: {
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
  };
  session?: {
    id: number;
    teacherId: string;
    studentId: string;
    userSkillId: number;
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    creditsCost: number;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
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
  };
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserProfileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface CreateMessageRequest {
  receiverId: string;
  content: string;
  sessionId?: number;
  type?: number; // MessageType enum: Text=1, Image=2, File=3, System=4
  attachmentUrl?: string;
}

export interface MarkMessagesReadRequest {
  senderId: string;
}

class MessagesService {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  }

  async getConversation(otherUserId: string, page: number = 1, pageSize: number = 50): Promise<Message[]> {
    const response = await api.get<Message[]>(`/messages/conversation/${otherUserId}`, {
      params: { page, pageSize }
    });
    return response.data;
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<Message> {
    const response = await api.post<Message>('/messages', messageData);
    return response.data;
  }

  async markMessagesAsRead(markReadData: MarkMessagesReadRequest): Promise<void> {
    await api.post('/messages/mark-read', markReadData);
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<{ unreadCount: number }>('/messages/unread-count');
    return response.data;
  }
}

export const messagesService = new MessagesService();
