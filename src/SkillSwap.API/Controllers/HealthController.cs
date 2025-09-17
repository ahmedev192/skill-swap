using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Infrastructure.Data;
using System.Diagnostics;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly SkillSwapDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(SkillSwapDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Basic health check
    /// </summary>
    [HttpGet]
    public ActionResult<object> GetHealth()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
        });
    }

    /// <summary>
    /// Detailed health check with database connectivity
    /// </summary>
    [HttpGet("detailed")]
    public async Task<ActionResult<object>> GetDetailedHealth()
    {
        var health = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            checks = new Dictionary<string, object>()
        };

        try
        {
            // Database connectivity check
            var canConnect = await _context.Database.CanConnectAsync();
            health.checks["database"] = new
            {
                status = canConnect ? "Healthy" : "Unhealthy",
                message = canConnect ? "Database connection successful" : "Database connection failed"
            };

            // Memory usage
            var process = Process.GetCurrentProcess();
            health.checks["memory"] = new
            {
                status = "Healthy",
                workingSet = process.WorkingSet64,
                privateMemory = process.PrivateMemorySize64,
                virtualMemory = process.VirtualMemorySize64
            };

            // Disk space (simplified)
            var drive = new DriveInfo(Path.GetPathRoot(Environment.CurrentDirectory)!);
            health.checks["disk"] = new
            {
                status = "Healthy",
                totalSpace = drive.TotalSize,
                freeSpace = drive.AvailableFreeSpace,
                usedSpace = drive.TotalSize - drive.AvailableFreeSpace
            };

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(500, new
            {
                status = "Unhealthy",
                timestamp = DateTime.UtcNow,
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// System metrics (Admin only)
    /// </summary>
    [HttpGet("metrics")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetMetrics()
    {
        try
        {
            var userCount = await _context.Users.CountAsync();
            var skillCount = await _context.Skills.CountAsync();
            var sessionCount = await _context.Sessions.CountAsync();
            var activeSessions = await _context.Sessions.CountAsync(s => s.Status == Core.Entities.SessionStatus.Confirmed || s.Status == Core.Entities.SessionStatus.InProgress);
            var completedSessions = await _context.Sessions.CountAsync(s => s.Status == Core.Entities.SessionStatus.Completed);

            var process = Process.GetCurrentProcess();
            var uptime = DateTime.UtcNow - process.StartTime;

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                users = new
                {
                    total = userCount,
                    active = await _context.Users.CountAsync(u => u.LastActiveAt > DateTime.UtcNow.AddDays(-30))
                },
                skills = new
                {
                    total = skillCount,
                    offered = await _context.UserSkills.CountAsync(us => us.Type == Core.Entities.SkillType.Offered),
                    requested = await _context.UserSkills.CountAsync(us => us.Type == Core.Entities.SkillType.Requested)
                },
                sessions = new
                {
                    total = sessionCount,
                    active = activeSessions,
                    completed = completedSessions,
                    pending = await _context.Sessions.CountAsync(s => s.Status == Core.Entities.SessionStatus.Pending)
                },
                system = new
                {
                    uptime = uptime.TotalSeconds,
                    memoryUsage = process.WorkingSet64,
                    cpuTime = process.TotalProcessorTime.TotalMilliseconds
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system metrics");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
