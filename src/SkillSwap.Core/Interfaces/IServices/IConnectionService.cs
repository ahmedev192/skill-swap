using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IConnectionService
{
    Task<UserConnectionDto> SendConnectionRequestAsync(string requesterId, CreateConnectionRequestDto request);
    Task<UserConnectionDto> RespondToConnectionRequestAsync(string userId, RespondToConnectionDto response);
    Task<IEnumerable<UserConnectionDto>> GetConnectionRequestsAsync(string userId);
    Task<IEnumerable<UserConnectionDto>> GetSentConnectionRequestsAsync(string userId);
    Task<IEnumerable<UserConnectionDto>> GetConnectionsAsync(string userId);
    Task<ConnectionStatsDto> GetConnectionStatsAsync(string userId);
    Task<bool> RemoveConnectionAsync(string userId, int connectionId);
    Task<bool> BlockUserAsync(string userId, string targetUserId);
    Task<bool> UnblockUserAsync(string userId, string targetUserId);
    Task<bool> IsConnectedAsync(string userId1, string userId2);
    Task<bool> HasPendingRequestAsync(string requesterId, string receiverId);
}
