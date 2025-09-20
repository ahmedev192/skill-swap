using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces.Services;

public interface ISessionService
{
    Task<IEnumerable<SessionDto>> GetUserSessionsAsync(string userId);
    Task<IEnumerable<SessionDto>> GetTeachingSessionsAsync(string userId);
    Task<IEnumerable<SessionDto>> GetLearningSessionsAsync(string userId);
    Task<SessionDto?> GetSessionByIdAsync(int sessionId);
    Task<SessionDto> CreateSessionAsync(string studentId, CreateSessionDto createSessionDto);
    Task<SessionDto> UpdateSessionAsync(int sessionId, UpdateSessionDto updateSessionDto);
    Task<bool> CancelSessionAsync(int sessionId, string cancellationReason);
    Task<bool> ConfirmSessionAsync(int sessionId, string userId, ConfirmSessionDto confirmSessionDto);
    Task<bool> CompleteSessionAsync(int sessionId, string userId);
    Task<IEnumerable<SessionDto>> GetSessionsByStatusAsync(SessionStatus status);
    Task<IEnumerable<SessionDto>> GetUpcomingSessionsAsync(string userId);
    Task<bool> RescheduleSessionAsync(int sessionId, string userId, DateTime newStart, DateTime newEnd);
    Task<bool> CanUserModifySessionAsync(int sessionId, string userId);
}
