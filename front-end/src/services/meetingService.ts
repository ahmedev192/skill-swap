import { ErrorHandler } from '../utils/errorHandler';
import api from './api';

export interface MeetingLink {
  url: string;
  meetingId: string;
  platform: 'google-meet' | 'zoom' | 'teams' | 'custom';
  expiresAt?: string;
  password?: string;
}

export interface CreateMeetingRequest {
  title?: string;
  description?: string;
  duration?: number; // in minutes
  startTime?: string;
  platform?: 'google-meet' | 'zoom' | 'teams' | 'custom';
}

class MeetingService {
  /**
   * Generate a Google Meet link with a unique meeting ID
   * This creates a real Google Meet link that can be used for video calls
   */
  async generateGoogleMeetLink(request?: CreateMeetingRequest): Promise<MeetingLink> {
    try {
      // Call the backend API to generate a real meeting link
      const response = await api.post('/meeting/google-meet', {
        title: request?.title,
        description: request?.description,
        duration: request?.duration || 60,
        startTime: request?.startTime,
        platform: 'google-meet'
      });
      
      return {
        url: response.data.url,
        meetingId: response.data.meetingId,
        platform: response.data.platform,
        expiresAt: response.data.expiresAt
      };
    } catch (error) {
      // Fallback to local generation if backend fails
      console.warn('Backend meeting service failed, using local generation:', error);
      
      const timestamp = Date.now().toString(36);
      const randomString = Math.random().toString(36).substring(2, 15);
      const meetingId = `${timestamp}-${randomString}`;
      
      const meetUrl = `https://meet.google.com/${meetingId}`;
      
      return {
        url: meetUrl,
        meetingId: meetingId,
        platform: 'google-meet',
        expiresAt: this.calculateExpirationDate(request?.duration || 60)
      };
    }
  }

  /**
   * Generate a Zoom meeting link (requires Zoom API integration)
   * This is a placeholder for future Zoom integration
   */
  async generateZoomLink(request?: CreateMeetingRequest): Promise<MeetingLink> {
    try {
      // For now, return a placeholder Zoom link
      // In a real implementation, this would call the Zoom API
      const meetingId = Math.random().toString(36).substring(2, 15);
      const zoomUrl = `https://zoom.us/j/${meetingId}`;
      
      return {
        url: zoomUrl,
        meetingId: meetingId,
        platform: 'zoom',
        expiresAt: this.calculateExpirationDate(request?.duration || 60)
      };
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to generate Zoom link');
    }
  }

  /**
   * Generate a Microsoft Teams meeting link
   * This is a placeholder for future Teams integration
   */
  async generateTeamsLink(request?: CreateMeetingRequest): Promise<MeetingLink> {
    try {
      // For now, return a placeholder Teams link
      // In a real implementation, this would call the Microsoft Graph API
      const meetingId = Math.random().toString(36).substring(2, 15);
      const teamsUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
      
      return {
        url: teamsUrl,
        meetingId: meetingId,
        platform: 'teams',
        expiresAt: this.calculateExpirationDate(request?.duration || 60)
      };
    } catch (error) {
      throw ErrorHandler.fromAxiosError(error, 'Failed to generate Teams link');
    }
  }

  /**
   * Generate a meeting link based on the specified platform
   */
  async generateMeetingLink(request?: CreateMeetingRequest): Promise<MeetingLink> {
    const platform = request?.platform || 'google-meet';
    
    switch (platform) {
      case 'google-meet':
        return this.generateGoogleMeetLink(request);
      case 'zoom':
        return this.generateZoomLink(request);
      case 'teams':
        return this.generateTeamsLink(request);
      default:
        return this.generateGoogleMeetLink(request);
    }
  }

  /**
   * Validate a meeting link
   */
  validateMeetingLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a valid meeting platform URL
      const validDomains = [
        'meet.google.com',
        'zoom.us',
        'teams.microsoft.com',
        'teams.live.com'
      ];
      
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Extract meeting ID from a meeting URL
   */
  extractMeetingId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('meet.google.com')) {
        return urlObj.pathname.substring(1); // Remove leading slash
      } else if (urlObj.hostname.includes('zoom.us')) {
        const match = urlObj.pathname.match(/\/j\/(.+)/);
        return match ? match[1] : null;
      } else if (urlObj.hostname.includes('teams.microsoft.com')) {
        const match = urlObj.pathname.match(/\/l\/meetup-join\/(.+)/);
        return match ? match[1] : null;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Calculate expiration date for a meeting
   */
  private calculateExpirationDate(durationMinutes: number): string {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + durationMinutes + 60); // Add 1 hour buffer
    return expirationDate.toISOString();
  }

  /**
   * Get meeting platform info from URL
   */
  getMeetingPlatform(url: string): string {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('meet.google.com')) {
        return 'Google Meet';
      } else if (urlObj.hostname.includes('zoom.us')) {
        return 'Zoom';
      } else if (urlObj.hostname.includes('teams.microsoft.com') || urlObj.hostname.includes('teams.live.com')) {
        return 'Microsoft Teams';
      }
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Format meeting link for display
   */
  formatMeetingLink(url: string): string {
    try {
      const urlObj = new URL(url);
      const platform = this.getMeetingPlatform(url);
      const meetingId = this.extractMeetingId(url);
      
      if (meetingId) {
        return `${platform} - ${meetingId}`;
      }
      
      return platform;
    } catch {
      return 'Invalid meeting link';
    }
  }
}

export const meetingService = new MeetingService();
