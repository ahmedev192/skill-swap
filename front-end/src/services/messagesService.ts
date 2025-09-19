import api from './api';
import { messageErrorHandler } from '../utils/messageErrorHandler';

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
    try {
      const response = await api.get<Conversation[]>('/messages/conversations');
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getConversations', 'message');
      throw error;
    }
  }

  async getConversation(otherUserId: string, page: number = 1, pageSize: number = 50, markAsRead: boolean = true): Promise<Message[]> {
    try {
      if (!otherUserId || otherUserId.trim() === '') {
        throw new Error('Other user ID is required');
      }

      const response = await api.get<Message[]>(`/messages/conversation/${otherUserId}`, {
        params: { page, pageSize, markAsRead }
      });
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getConversation', 'message');
      throw error;
    }
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<Message> {
    try {
      if (!messageData.receiverId || messageData.receiverId.trim() === '') {
        throw new Error('Receiver ID is required');
      }

      if (!messageData.content || messageData.content.trim() === '') {
        throw new Error('Message content is required');
      }

      if (messageData.content.length > 1000) {
        throw new Error('Message content cannot exceed 1000 characters');
      }

      const response = await api.post<Message>('/messages', messageData);
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'sendMessage', 'message');
      throw error;
    }
  }

  async markMessagesAsRead(markReadData: MarkMessagesReadRequest): Promise<void> {
    try {
      if (!markReadData.senderId || markReadData.senderId.trim() === '') {
        throw new Error('Sender ID is required');
      }

      await api.post('/messages/mark-read', markReadData);
    } catch (error) {
      messageErrorHandler.handleError(error, 'markMessagesAsRead', 'message');
      throw error;
    }
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      const response = await api.get<{ unreadCount: number }>('/messages/unread-count');
      return response.data;
    } catch (error) {
      messageErrorHandler.handleError(error, 'getUnreadCount', 'message');
      throw error;
    }
  }
}

export const messagesService = new MessagesService();
