using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminAuditController : BaseController
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AdminAuditController> _logger;

    public AdminAuditController(IAuditService auditService, ILogger<AdminAuditController> logger) : base(logger)
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0", "INVALID_PAGE_NUMBER");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100", "INVALID_PAGE_SIZE");
            }

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
            return HandleException(ex, "get user audit logs", new { userId, page, pageSize });
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
            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0", "INVALID_PAGE_NUMBER");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100", "INVALID_PAGE_SIZE");
            }

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
            return HandleException(ex, "get system audit logs", new { page, pageSize });
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
            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0", "INVALID_PAGE_NUMBER");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100", "INVALID_PAGE_SIZE");
            }

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
            return HandleException(ex, "get security audit logs", new { page, pageSize });
        }
    }
}
