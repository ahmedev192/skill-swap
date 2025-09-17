using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces.Services;

public interface IMessageService
{
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(string userId);
    Task<IEnumerable<MessageDto>> GetConversationAsync(string userId, string otherUserId, int page = 1, int pageSize = 50);
    Task<MessageDto> SendMessageAsync(string senderId, CreateMessageDto createMessageDto);
    Task MarkMessagesAsReadAsync(string userId, string senderId);
    Task<int> GetUnreadMessageCountAsync(string userId);
    Task<IEnumerable<MessageDto>> GetSessionMessagesAsync(int sessionId);
    Task<SessionMessageDto> SendSessionMessageAsync(string senderId, CreateSessionMessageDto createSessionMessageDto);
}
