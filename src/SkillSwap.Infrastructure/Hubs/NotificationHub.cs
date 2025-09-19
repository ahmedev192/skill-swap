using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace SkillSwap.Infrastructure.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    // Static dictionary to track online users
    private static readonly ConcurrentDictionary<string, OnlineUserInfo> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        var firstName = Context.User?.FindFirst(ClaimTypes.GivenName)?.Value;
        var lastName = Context.User?.FindFirst(ClaimTypes.Surname)?.Value;
        
        if (!string.IsNullOrEmpty(userId))
        {
            // Add user to their personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            
            // Add user to online users list
            var userInfo = new OnlineUserInfo
            {
                UserId = userId,
                ConnectionId = Context.ConnectionId,
                Email = userEmail ?? "",
                FirstName = firstName ?? "",
                LastName = lastName ?? "",
                ConnectedAt = DateTime.UtcNow,
                LastSeen = DateTime.UtcNow
            };
            
            OnlineUsers.AddOrUpdate(userId, userInfo, (key, existing) => userInfo);
            
            // Notify all clients about user coming online
            await Clients.All.SendAsync("UserOnline", new
            {
                userId = userInfo.UserId,
                email = userInfo.Email,
                firstName = userInfo.FirstName,
                lastName = userInfo.LastName,
                connectedAt = userInfo.ConnectedAt
            });
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            // Remove user from their personal group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            
            // Remove user from online users list
            if (OnlineUsers.TryRemove(userId, out var userInfo))
            {
                // Notify all clients about user going offline
                await Clients.All.SendAsync("UserOffline", new
                {
                    userId = userInfo.UserId,
                    email = userInfo.Email,
                    firstName = userInfo.FirstName,
                    lastName = userInfo.LastName,
                    disconnectedAt = DateTime.UtcNow
                });
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    // Method to get list of online users
    public async Task GetOnlineUsers()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var onlineUsersList = OnlineUsers.Values
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

            await Clients.Caller.SendAsync("OnlineUsersList", onlineUsersList);
        }
    }

    // Method to update user's last seen timestamp
    public async Task UpdateLastSeen()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId) && OnlineUsers.TryGetValue(userId, out var userInfo))
        {
            userInfo.LastSeen = DateTime.UtcNow;
            OnlineUsers.AddOrUpdate(userId, userInfo, (key, existing) => userInfo);
        }
    }

    // Static method to get online users count (for external use)
    public static int GetOnlineUsersCount()
    {
        return OnlineUsers.Count;
    }

    // Static method to get online users list (for external use)
    public static IEnumerable<OnlineUserInfo> GetAllOnlineUsers()
    {
        return OnlineUsers.Values.ToList();
    }
}

public class OnlineUserInfo
{
    public string UserId { get; set; } = string.Empty;
    public string ConnectionId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime ConnectedAt { get; set; }
    public DateTime LastSeen { get; set; }
}
