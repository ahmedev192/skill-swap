using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<AuditService> _logger;

    public AuditService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<AuditService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task LogUserActionAsync(string userId, string action, string details, string? entityType = null, int? entityId = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                Details = details,
                EntityType = entityType,
                EntityId = entityId,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User action logged: {Action} by user {UserId}", action, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging user action: {Action} by user {UserId}", action, userId);
        }
    }

    public async Task LogSystemEventAsync(string eventType, string details, string? userId = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = $"SYSTEM_{eventType}",
                Details = details,
                EntityType = "System",
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("System event logged: {EventType} - {Details}", eventType, details);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging system event: {EventType}", eventType);
        }
    }

    public async Task LogErrorAsync(string error, string? userId = null, string? details = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = "ERROR",
                Details = $"Error: {error}. Details: {details ?? "No additional details"}",
                EntityType = "Error",
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogError("Error logged: {Error} for user {UserId}", error, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging error: {Error}", error);
        }
    }

    public async Task LogSecurityEventAsync(string eventType, string details, string? userId = null, string? ipAddress = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = $"SECURITY_{eventType}",
                Details = details,
                EntityType = "Security",
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AuditLogs.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogWarning("Security event logged: {EventType} - {Details} from IP {IpAddress}", eventType, details, ipAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security event: {EventType}", eventType);
        }
    }

    public async Task<IEnumerable<AuditLogDto>> GetUserAuditLogsAsync(string userId, int page = 1, int pageSize = 50)
    {
        var auditLogs = await _unitOfWork.AuditLogs.FindAsync(al => al.UserId == userId);
        
        var paginatedLogs = auditLogs
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        return _mapper.Map<IEnumerable<AuditLogDto>>(paginatedLogs);
    }

    public async Task<IEnumerable<AuditLogDto>> GetSystemAuditLogsAsync(int page = 1, int pageSize = 50)
    {
        var auditLogs = await _unitOfWork.AuditLogs.FindAsync(al => al.EntityType == "System");
        
        var paginatedLogs = auditLogs
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        return _mapper.Map<IEnumerable<AuditLogDto>>(paginatedLogs);
    }

    public async Task<IEnumerable<AuditLogDto>> GetSecurityAuditLogsAsync(int page = 1, int pageSize = 50)
    {
        var auditLogs = await _unitOfWork.AuditLogs.FindAsync(al => al.EntityType == "Security");
        
        var paginatedLogs = auditLogs
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        return _mapper.Map<IEnumerable<AuditLogDto>>(paginatedLogs);
    }
}
