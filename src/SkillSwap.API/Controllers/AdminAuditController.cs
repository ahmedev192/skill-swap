using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminAuditController : ControllerBase
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AdminAuditController> _logger;

    public AdminAuditController(IAuditService auditService, ILogger<AdminAuditController> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Get user audit logs
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<object>> GetUserAuditLogs(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var auditLogs = await _auditService.GetUserAuditLogsAsync(userId, page, pageSize);
            return Ok(new
            {
                data = auditLogs,
                page,
                pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user audit logs for {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get system audit logs
    /// </summary>
    [HttpGet("system")]
    public async Task<ActionResult<object>> GetSystemAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var auditLogs = await _auditService.GetSystemAuditLogsAsync(page, pageSize);
            return Ok(new
            {
                data = auditLogs,
                page,
                pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system audit logs");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get security audit logs
    /// </summary>
    [HttpGet("security")]
    public async Task<ActionResult<object>> GetSecurityAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var auditLogs = await _auditService.GetSecurityAuditLogsAsync(page, pageSize);
            return Ok(new
            {
                data = auditLogs,
                page,
                pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security audit logs");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
