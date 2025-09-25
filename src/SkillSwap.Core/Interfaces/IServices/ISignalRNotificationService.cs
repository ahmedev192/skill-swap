using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface ISignalRNotificationService
{
    Task NotifyMessageReceived(MessageDto message);
    Task NotifyConversationUpdated(ConversationDto conversation, string userId);
    Task NotifyMessageRead(int messageId, string readAt, string senderId);
    Task NotifyUserOnline(string userId, string email, string firstName, string lastName);
    Task NotifyUserOffline(string userId, string email, string firstName, string lastName);
    Task NotifyOnlineUsersList(string userId);
    Task NotifyUnreadCountUpdated(string userId, int unreadMessageCount, int unreadNotificationCount);
    Task NotifyNewNotification(NotificationDto notification);
}

