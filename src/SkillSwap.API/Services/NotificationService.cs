using Microsoft.AspNetCore.SignalR;
using SkillSwap.Core.DTOs;
using SkillSwap.Infrastructure.Hubs;

namespace SkillSwap.API.Services;

public interface ISignalRNotificationService
{
    Task NotifyMessageReceived(MessageDto message);
    Task NotifyConversationUpdated(ConversationDto conversation, string userId);
    Task NotifyMessageRead(int messageId, string readAt, string senderId);
    Task NotifyUserOnline(string userId, string email, string firstName, string lastName);
    Task NotifyUserOffline(string userId, string email, string firstName, string lastName);
    Task NotifyOnlineUsersList(string userId);
}

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyMessageReceived(MessageDto message)
    {
        await _hubContext.Clients.Group($"User_{message.ReceiverId}")
            .SendAsync("MessageReceived", message);
    }

    public async Task NotifyConversationUpdated(ConversationDto conversation, string userId)
    {
        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("ConversationUpdated", conversation);
    }

    public async Task NotifyMessageRead(int messageId, string readAt, string senderId)
    {
        await _hubContext.Clients.Group($"User_{senderId}")
            .SendAsync("MessageRead", messageId, readAt);
    }

    public async Task NotifyUserOnline(string userId, string email, string firstName, string lastName)
    {
        await _hubContext.Clients.All.SendAsync("UserOnline", new
        {
            userId,
            email,
            firstName,
            lastName,
            connectedAt = DateTime.UtcNow
        });
    }

    public async Task NotifyUserOffline(string userId, string email, string firstName, string lastName)
    {
        await _hubContext.Clients.All.SendAsync("UserOffline", new
        {
            userId,
            email,
            firstName,
            lastName,
            disconnectedAt = DateTime.UtcNow
        });
    }

    public async Task NotifyOnlineUsersList(string userId)
    {
        var onlineUsers = NotificationHub.GetAllOnlineUsers()
            .Where(u => u.UserId != userId) // Exclude current user
            .Select(u => new
            {
                userId = u.UserId,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                connectedAt = u.ConnectedAt,
                lastSeen = u.LastSeen
            })
            .ToList();

        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("OnlineUsersList", onlineUsers);
    }
}
