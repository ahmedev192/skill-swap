using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces.Services;

public interface IAuditService
{
    Task LogUserActionAsync(string userId, string action, string details, string? entityType = null, int? entityId = null);
    Task LogSystemEventAsync(string eventType, string details, string? userId = null);
    Task LogErrorAsync(string error, string? userId = null, string? details = null);
    Task LogSecurityEventAsync(string eventType, string details, string? userId = null, string? ipAddress = null);
    Task<IEnumerable<AuditLogDto>> GetUserAuditLogsAsync(string userId, int page = 1, int pageSize = 50);
    Task<IEnumerable<AuditLogDto>> GetSystemAuditLogsAsync(int page = 1, int pageSize = 50);
    Task<IEnumerable<AuditLogDto>> GetSecurityAuditLogsAsync(int page = 1, int pageSize = 50);
}
