using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseController
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
        ILogger<AdminController> logger) : base(logger)
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
            return HandleException(ex, "get system stats");
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
            if (page < 1)
            {
                return BadRequest("Page number must be greater than 0", "INVALID_PAGE_NUMBER");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100", "INVALID_PAGE_SIZE");
            }

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
            return HandleException(ex, "get users for admin", new { page, pageSize });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found", "USER_NOT_FOUND");
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user for admin", new { userId });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            if (updateUserDto == null)
            {
                return BadRequest("Invalid user data", "INVALID_REQUEST_DATA");
            }

            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var user = await _userService.UpdateUserAsync(userId, updateUserDto);
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message, "USER_NOT_FOUND");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message, "INVALID_OPERATION");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "update user", new { userId });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var result = await _userService.DeleteUserAsync(userId);
            if (result)
            {
                return Ok(new { message = "User deleted successfully" });
            }
            return NotFound("User not found", "USER_NOT_FOUND");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "delete user", new { userId });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            if (adjustCreditsDto == null)
            {
                return BadRequest("Invalid credit adjustment data", "INVALID_REQUEST_DATA");
            }

            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var result = await _creditService.AdjustCreditsAsync(userId, adjustCreditsDto.Amount, adjustCreditsDto.Description);
            if (result)
            {
                return Ok(new { message = "Credits adjusted successfully" });
            }
            return BadRequest("Insufficient credits for adjustment", "INSUFFICIENT_CREDITS");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "adjust user credits", new { userId, amount = adjustCreditsDto?.Amount });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var transactions = await _creditService.GetUserTransactionHistoryAsync(userId);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user transactions", new { userId });
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
            return HandleException(ex, "get skills for admin");
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
            if (createSkillDto == null)
            {
                return BadRequest("Invalid skill data", "INVALID_REQUEST_DATA");
            }

            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var skill = await _skillService.CreateSkillAsync(createSkillDto);
            return CreatedAtAction(nameof(GetSkills), skill);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "create skill");
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
            if (id <= 0)
            {
                return BadRequest("Invalid skill ID", "INVALID_SKILL_ID");
            }

            if (updateSkillDto == null)
            {
                return BadRequest("Invalid skill data", "INVALID_REQUEST_DATA");
            }

            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var skill = await _skillService.UpdateSkillAsync(id, updateSkillDto);
            return Ok(skill);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message, "SKILL_NOT_FOUND");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "update skill", new { skillId = id });
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
            if (id <= 0)
            {
                return BadRequest("Invalid skill ID", "INVALID_SKILL_ID");
            }

            var result = await _skillService.DeleteSkillAsync(id);
            if (result)
            {
                return Ok(new { message = "Skill deleted successfully" });
            }
            return NotFound("Skill not found", "SKILL_NOT_FOUND");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "delete skill", new { skillId = id });
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
            if (!Enum.IsDefined(typeof(SessionStatus), status))
            {
                return BadRequest("Invalid session status", "INVALID_SESSION_STATUS");
            }

            var sessions = await _sessionService.GetSessionsByStatusAsync(status);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get sessions by status", new { status });
        }
    }
}

public class AdjustCreditsDto
{
    [Required(ErrorMessage = "Amount is required")]
    [Range(-10000, 10000, ErrorMessage = "Amount must be between -10000 and 10000")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Description is required")]
    [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
    public string Description { get; set; } = string.Empty;
}
