using AutoMapper;
using Microsoft.Extensions.Logging;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;
    private readonly ISignalRNotificationService _signalRNotificationService;

    public NotificationService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IEmailService emailService,
        ISignalRNotificationService signalRNotificationService,
        ILogger<NotificationService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
        _signalRNotificationService = signalRNotificationService;
        _logger = logger;
    }

    public async Task<NotificationDto> CreateNotificationAsync(string userId, NotificationType type, string title, string message, int? relatedEntityId = null, string? relatedEntityType = null, string? actionUrl = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        var notificationDto = _mapper.Map<NotificationDto>(notification);
        
        // Send real-time notification via SignalR
        try
        {
            await _signalRNotificationService.NotifyNewNotification(notificationDto);
            
            // Also update the unread count
            var unreadCount = await GetUnreadNotificationCountAsync(userId);
            await _signalRNotificationService.NotifyUnreadCountUpdated(userId, 0, unreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification for user {UserId}", userId);
        }

        return notificationDto;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
    {
        var notifications = await _unitOfWork.Notifications.FindAsync(n => 
            n.UserId == userId && (!unreadOnly || !n.IsRead));

        return _mapper.Map<IEnumerable<NotificationDto>>(notifications.OrderByDescending(n => n.CreatedAt));
    }

    public async Task<bool> MarkNotificationAsReadAsync(int notificationId)
    {
        var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
        if (notification == null)
        {
            return false;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        await _unitOfWork.Notifications.UpdateAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        // Send real-time update via SignalR
        try
        {
            var unreadCount = await GetUnreadNotificationCountAsync(notification.UserId);
            await _signalRNotificationService.NotifyUnreadCountUpdated(notification.UserId, 0, unreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR unread count update for user {UserId}", notification.UserId);
        }

        return true;
    }

    public async Task<bool> MarkAllNotificationsAsReadAsync(string userId)
    {
        var unreadNotifications = await _unitOfWork.Notifications.FindAsync(n => 
            n.UserId == userId && !n.IsRead);

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _unitOfWork.Notifications.UpdateAsync(notification);
        }

        await _unitOfWork.SaveChangesAsync();
        
        // Send real-time update via SignalR
        try
        {
            var unreadCount = await GetUnreadNotificationCountAsync(userId);
            await _signalRNotificationService.NotifyUnreadCountUpdated(userId, 0, unreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR unread count update for user {UserId}", userId);
        }
        
        return true;
    }

    public async Task<int> GetUnreadNotificationCountAsync(string userId)
    {
        return await _unitOfWork.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> SendSessionRequestNotificationAsync(string teacherId, string studentName, string skillName, int sessionId)
    {
        try
        {
            var teacher = await _unitOfWork.Users.GetByIdAsync(teacherId);
            if (teacher == null) return false;

            var title = "New Session Request";
            var message = $"{studentName} wants to learn {skillName} from you";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(teacherId, NotificationType.SessionRequest, title, message, sessionId, "Session", actionUrl);

            // Send email notification
            await _emailService.SendSessionRequestEmailAsync(teacher.Email!, teacher.FirstName, studentName, skillName, DateTime.UtcNow);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session request notification");
            return false;
        }
    }

    public async Task<bool> SendSessionConfirmedNotificationAsync(string studentId, string teacherName, string skillName, int sessionId)
    {
        try
        {
            var student = await _unitOfWork.Users.GetByIdAsync(studentId);
            if (student == null) return false;

            var title = "Session Confirmed";
            var message = $"Your session with {teacherName} for {skillName} has been confirmed";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(studentId, NotificationType.SessionConfirmed, title, message, sessionId, "Session", actionUrl);

            // Send email notification
            await _emailService.SendSessionConfirmedEmailAsync(student.Email!, student.FirstName, teacherName, skillName, DateTime.UtcNow);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session confirmed notification");
            return false;
        }
    }

    public async Task<bool> SendSessionReminderNotificationAsync(string userId, string teacherName, string skillName, int sessionId)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Session Reminder";
            var message = $"Your session with {teacherName} for {skillName} is starting soon";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(userId, NotificationType.SessionReminder, title, message, sessionId, "Session", actionUrl);

            // Send email notification
            await _emailService.SendSessionReminderEmailAsync(user.Email!, user.FirstName, teacherName, skillName, DateTime.UtcNow);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session reminder notification");
            return false;
        }
    }

    public async Task<bool> SendNewMessageNotificationAsync(string receiverId, string senderName, string messagePreview, int? sessionId = null)
    {
        try
        {
            var receiver = await _unitOfWork.Users.GetByIdAsync(receiverId);
            if (receiver == null) return false;

            var title = "New Message";
            var message = $"New message from {senderName}: {messagePreview}";
            var actionUrl = sessionId.HasValue ? $"/sessions/{sessionId}/messages" : "/messages";

            await CreateNotificationAsync(receiverId, NotificationType.NewMessage, title, message, sessionId, "Message", actionUrl);

            // Send email notification
            await _emailService.SendNewMessageEmailAsync(receiver.Email!, receiver.FirstName, senderName, messagePreview);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending new message notification");
            return false;
        }
    }

    public async Task<bool> SendNewReviewNotificationAsync(string revieweeId, string reviewerName, int rating, int sessionId)
    {
        try
        {
            var reviewee = await _unitOfWork.Users.GetByIdAsync(revieweeId);
            if (reviewee == null) return false;

            var title = "New Review";
            var message = $"You received a {rating}-star review from {reviewerName}";
            var actionUrl = $"/reviews/session/{sessionId}";

            await CreateNotificationAsync(revieweeId, NotificationType.NewReview, title, message, sessionId, "Review", actionUrl);

            // Send email notification
            await _emailService.SendNewReviewEmailAsync(reviewee.Email!, reviewee.FirstName, reviewerName, rating);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending new review notification");
            return false;
        }
    }

    public async Task<bool> SendCreditEarnedNotificationAsync(string userId, decimal amount, string description)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Credits Earned";
            var message = $"You earned {amount} credits: {description}";
            var actionUrl = "/credits/transactions";

            await CreateNotificationAsync(userId, NotificationType.CreditEarned, title, message, null, "CreditTransaction", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending credit earned notification");
            return false;
        }
    }

    public async Task<bool> SendCreditSpentNotificationAsync(string userId, decimal amount, string description)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Credits Spent";
            var message = $"You spent {amount} credits: {description}";
            var actionUrl = "/credits/transactions";

            await CreateNotificationAsync(userId, NotificationType.CreditSpent, title, message, null, "CreditTransaction", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending credit spent notification");
            return false;
        }
    }

    public async Task<bool> SendConnectionRequestNotificationAsync(string receiverId, string senderName)
    {
        try
        {
            var receiver = await _unitOfWork.Users.GetByIdAsync(receiverId);
            if (receiver == null) return false;

            var title = "New Connection Request";
            var message = $"{senderName} wants to connect with you";
            var actionUrl = "/connections/requests";

            await CreateNotificationAsync(receiverId, NotificationType.ConnectionRequest, title, message, null, "Connection", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending connection request notification");
            return false;
        }
    }

    public async Task<bool> SendConnectionAcceptedNotificationAsync(string senderId, string accepterName)
    {
        try
        {
            var sender = await _unitOfWork.Users.GetByIdAsync(senderId);
            if (sender == null) return false;

            var title = "Connection Request Accepted";
            var message = $"{accepterName} accepted your connection request";
            var actionUrl = "/connections";

            await CreateNotificationAsync(senderId, NotificationType.ConnectionAccepted, title, message, null, "Connection", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending connection accepted notification");
            return false;
        }
    }

    public async Task<bool> SendSessionCancelledNotificationAsync(string userId, string otherUserName, string skillName, int sessionId)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Session Cancelled";
            var message = $"Your session with {otherUserName} for {skillName} has been cancelled";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(userId, NotificationType.SessionCancelled, title, message, sessionId, "Session", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session cancelled notification");
            return false;
        }
    }

    public async Task<bool> SendSessionRescheduledNotificationAsync(string userId, string otherUserName, string skillName, int sessionId)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Session Rescheduled";
            var message = $"Your session with {otherUserName} for {skillName} has been rescheduled";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(userId, NotificationType.SessionRescheduled, title, message, sessionId, "Session", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session rescheduled notification");
            return false;
        }
    }

    public async Task<bool> SendSessionCompletedNotificationAsync(string userId, string otherUserName, string skillName, int sessionId)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "Session Completed";
            var message = $"Your session with {otherUserName} for {skillName} has been completed";
            var actionUrl = $"/sessions/{sessionId}";

            await CreateNotificationAsync(userId, NotificationType.SessionCompleted, title, message, sessionId, "Session", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending session completed notification");
            return false;
        }
    }

    public async Task<bool> SendMatchFoundNotificationAsync(string userId, string matchedUserName, string skillName)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            var title = "New Match Found";
            var message = $"You have a new match with {matchedUserName} for {skillName}";
            var actionUrl = "/matching";

            await CreateNotificationAsync(userId, NotificationType.MatchFound, title, message, null, "Match", actionUrl);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending match found notification");
            return false;
        }
    }
}
