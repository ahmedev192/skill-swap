using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SessionsController : BaseController
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService, ILogger<SessionsController> logger) : base(logger)
    {
        _sessionService = sessionService;
    }

    /// <summary>
    /// Get current user's sessions
    /// </summary>
    [HttpGet("my-sessions")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetMySessions()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var sessions = await _sessionService.GetUserSessionsAsync(userId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user sessions");
        }
    }

    /// <summary>
    /// Get current user's teaching sessions
    /// </summary>
    [HttpGet("teaching")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetTeachingSessions()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var sessions = await _sessionService.GetTeachingSessionsAsync(userId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get teaching sessions");
        }
    }

    /// <summary>
    /// Get current user's learning sessions
    /// </summary>
    [HttpGet("learning")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetLearningSessions()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var sessions = await _sessionService.GetLearningSessionsAsync(userId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get learning sessions");
        }
    }

    /// <summary>
    /// Get session by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<SessionDto>> GetSession(int id)
    {
        try
        {
            var session = await _sessionService.GetSessionByIdAsync(id);
            if (session == null)
            {
                return NotFound();
            }

            var userId = GetCurrentUserId();
            if (session.TeacherId != userId && session.StudentId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Create a new session booking
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SessionDto>> CreateSession([FromBody] CreateSessionDto createSessionDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var session = await _sessionService.CreateSessionAsync(userId, createSessionDto);
            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "create session", new { teacherId = createSessionDto.TeacherId });
        }
    }

    /// <summary>
    /// Update session
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<SessionDto>> UpdateSession(int id, [FromBody] UpdateSessionDto updateSessionDto)
    {
        try
        {
            var session = await _sessionService.UpdateSessionAsync(id, updateSessionDto);
            return Ok(session);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Session not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Session update failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Cancel session
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelSession(int id, [FromBody] CancelSessionDto cancelSessionDto)
    {
        try
        {
            var result = await _sessionService.CancelSessionAsync(id, cancelSessionDto.Reason);
            if (result)
            {
                return Ok(new { message = "Session cancelled successfully" });
            }
            return NotFound(new { message = "Session not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Session cancellation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Confirm session
    /// </summary>
    [HttpPost("{id}/confirm")]
    public async Task<ActionResult> ConfirmSession(int id, [FromBody] ConfirmSessionDto confirmSessionDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _sessionService.ConfirmSessionAsync(id, userId, confirmSessionDto);
            if (result)
            {
                return Ok(new { message = "Session confirmed successfully" });
            }
            return NotFound(new { message = "Session not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized session confirmation: {Message}", ex.Message);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Session confirmation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Complete session
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<ActionResult> CompleteSession(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _sessionService.CompleteSessionAsync(id, userId);
            if (result)
            {
                return Ok(new { message = "Session completed successfully" });
            }
            return NotFound(new { message = "Session not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized session completion: {Message}", ex.Message);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Session completion failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get sessions by status (Admin only)
    /// </summary>
    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetSessionsByStatus(SessionStatus status)
    {
        try
        {
            var sessions = await _sessionService.GetSessionsByStatusAsync(status);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sessions by status {Status}", status);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get upcoming sessions
    /// </summary>
    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetUpcomingSessions()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var sessions = await _sessionService.GetUpcomingSessionsAsync(userId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get upcoming sessions");
        }
    }

    /// <summary>
    /// Reschedule session
    /// </summary>
    [HttpPost("{id}/reschedule")]
    public async Task<ActionResult> RescheduleSession(int id, [FromBody] RescheduleSessionDto rescheduleSessionDto)
    {
        try
        {
            var result = await _sessionService.RescheduleSessionAsync(id, rescheduleSessionDto.NewStart, rescheduleSessionDto.NewEnd);
            if (result)
            {
                return Ok(new { message = "Session rescheduled successfully" });
            }
            return NotFound(new { message = "Session not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Session reschedule failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rescheduling session {SessionId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}

public class CancelSessionDto
{
    public string Reason { get; set; } = string.Empty;
}

public class RescheduleSessionDto
{
    public DateTime NewStart { get; set; }
    public DateTime NewEnd { get; set; }
}
