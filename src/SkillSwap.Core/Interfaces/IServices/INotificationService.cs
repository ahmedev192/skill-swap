using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces.Services;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(string userId, NotificationType type, string title, string message, int? relatedEntityId = null, string? relatedEntityType = null, string? actionUrl = null);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, bool unreadOnly = false);
    Task<bool> MarkNotificationAsReadAsync(int notificationId);
    Task<bool> MarkAllNotificationsAsReadAsync(string userId);
    Task<int> GetUnreadNotificationCountAsync(string userId);
    Task<bool> SendSessionRequestNotificationAsync(string teacherId, string studentName, string skillName, int sessionId);
    Task<bool> SendSessionConfirmedNotificationAsync(string studentId, string teacherName, string skillName, int sessionId);
    Task<bool> SendSessionReminderNotificationAsync(string userId, string teacherName, string skillName, int sessionId);
    Task<bool> SendNewMessageNotificationAsync(string receiverId, string senderName, string messagePreview, int? sessionId = null);
    Task<bool> SendNewReviewNotificationAsync(string revieweeId, string reviewerName, int rating, int sessionId);
    Task<bool> SendCreditEarnedNotificationAsync(string userId, decimal amount, string description);
    Task<bool> SendCreditSpentNotificationAsync(string userId, decimal amount, string description);
}
