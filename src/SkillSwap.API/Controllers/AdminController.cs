using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ISkillService _skillService;
    private readonly ISessionService _sessionService;
    private readonly ICreditService _creditService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IUserService userService,
        ISkillService skillService,
        ISessionService sessionService,
        ICreditService creditService,
        ILogger<AdminController> logger)
    {
        _userService = userService;
        _skillService = skillService;
        _sessionService = sessionService;
        _creditService = creditService;
        _logger = logger;
    }

    /// <summary>
    /// Get system statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetSystemStats()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            var skills = await _skillService.GetAllSkillsAsync();
            var sessions = await _sessionService.GetSessionsByStatusAsync(SessionStatus.Completed);

            return Ok(new
            {
                totalUsers = users.Count(),
                totalSkills = skills.Count(),
                completedSessions = sessions.Count(),
                activeUsers = users.Count(u => u.LastActiveAt > DateTime.UtcNow.AddDays(-30))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system stats");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get all users with pagination
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<object>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            var paginatedUsers = users.Skip((page - 1) * pageSize).Take(pageSize);

            return Ok(new
            {
                data = paginatedUsers,
                page,
                pageSize,
                totalCount = users.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users for admin");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user details by ID
    /// </summary>
    [HttpGet("users/{userId}")]
    public async Task<ActionResult<UserDto>> GetUser(string userId)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId} for admin", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update user (Admin only)
    /// </summary>
    [HttpPut("users/{userId}")]
    public async Task<ActionResult<UserDto>> UpdateUser(string userId, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            var user = await _userService.UpdateUserAsync(userId, updateUserDto);
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Update failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Delete user (Admin only)
    /// </summary>
    [HttpDelete("users/{userId}")]
    public async Task<ActionResult> DeleteUser(string userId)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(userId);
            if (result)
            {
                return Ok(new { message = "User deleted successfully" });
            }
            return NotFound(new { message = "User not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Adjust user credits
    /// </summary>
    [HttpPost("users/{userId}/credits/adjust")]
    public async Task<ActionResult> AdjustUserCredits(string userId, [FromBody] AdjustCreditsDto adjustCreditsDto)
    {
        try
        {
            var result = await _creditService.AdjustCreditsAsync(userId, adjustCreditsDto.Amount, adjustCreditsDto.Description);
            if (result)
            {
                return Ok(new { message = "Credits adjusted successfully" });
            }
            return BadRequest(new { message = "Insufficient credits for adjustment" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adjusting credits for user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user transaction history
    /// </summary>
    [HttpGet("users/{userId}/transactions")]
    public async Task<ActionResult<IEnumerable<CreditTransactionDto>>> GetUserTransactions(string userId)
    {
        try
        {
            var transactions = await _creditService.GetUserTransactionHistoryAsync(userId);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transactions for user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get all skills
    /// </summary>
    [HttpGet("skills")]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetSkills()
    {
        try
        {
            var skills = await _skillService.GetAllSkillsAsync();
            return Ok(skills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting skills for admin");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Create skill
    /// </summary>
    [HttpPost("skills")]
    public async Task<ActionResult<SkillDto>> CreateSkill([FromBody] CreateSkillDto createSkillDto)
    {
        try
        {
            var skill = await _skillService.CreateSkillAsync(createSkillDto);
            return CreatedAtAction(nameof(GetSkills), skill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating skill");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update skill
    /// </summary>
    [HttpPut("skills/{id}")]
    public async Task<ActionResult<SkillDto>> UpdateSkill(int id, [FromBody] UpdateSkillDto updateSkillDto)
    {
        try
        {
            var skill = await _skillService.UpdateSkillAsync(id, updateSkillDto);
            return Ok(skill);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Skill not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating skill {SkillId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Delete skill
    /// </summary>
    [HttpDelete("skills/{id}")]
    public async Task<ActionResult> DeleteSkill(int id)
    {
        try
        {
            var result = await _skillService.DeleteSkillAsync(id);
            if (result)
            {
                return Ok(new { message = "Skill deleted successfully" });
            }
            return NotFound(new { message = "Skill not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting skill {SkillId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get sessions by status
    /// </summary>
    [HttpGet("sessions/status/{status}")]
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
}

public class AdjustCreditsDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}
