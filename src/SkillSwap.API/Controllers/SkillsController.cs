using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : BaseController
{
    private readonly ISkillService _skillService;

    public SkillsController(ISkillService skillService, ILogger<SkillsController> logger) : base(logger)
    {
        _skillService = skillService;
    }

    /// <summary>
    /// Get all available skills
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetSkills()
    {
        try
        {
            var skills = await _skillService.GetAllSkillsAsync();
            return Ok(skills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get skills");
        }
    }

    /// <summary>
    /// Get skill by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetSkill(int id)
    {
        try
        {
            var skill = await _skillService.GetSkillByIdAsync(id);
            if (skill == null)
            {
                return NotFound("Skill not found", "SKILL_NOT_FOUND");
            }
            return Ok(skill);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get skill", new { skillId = id });
        }
    }

    /// <summary>
    /// Get skills by category
    /// </summary>
    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetSkillsByCategory(string category)
    {
        try
        {
            if (string.IsNullOrEmpty(category))
            {
                return BadRequest("Category is required", "INVALID_CATEGORY");
            }
            
            var skills = await _skillService.GetSkillsByCategoryAsync(category);
            return Ok(skills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get skills by category", new { category });
        }
    }

    /// <summary>
    /// Create a new skill (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
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
            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "create skill");
        }
    }

    /// <summary>
    /// Update skill (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SkillDto>> UpdateSkill(int id, [FromBody] UpdateSkillDto updateSkillDto)
    {
        try
        {
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
    /// Delete skill (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteSkill(int id)
    {
        try
        {
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
    /// Get user's skills
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetUserSkills(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var currentUserId = GetCurrentUserId();
            
            // Users can only view their own skills unless they're admin
            if (currentUserId != userId && !HasRole("Admin"))
            {
                return Forbidden("Access denied", "ACCESS_DENIED");
            }

            var userSkills = await _skillService.GetUserSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user skills", new { userId });
        }
    }

    /// <summary>
    /// Get user's offered skills
    /// </summary>
    [HttpGet("user/{userId}/offered")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetUserOfferedSkills(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var userSkills = await _skillService.GetOfferedSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get offered skills", new { userId });
        }
    }

    /// <summary>
    /// Get user's requested skills
    /// </summary>
    [HttpGet("user/{userId}/requested")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetUserRequestedSkills(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var userSkills = await _skillService.GetRequestedSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get requested skills", new { userId });
        }
    }

    /// <summary>
    /// Get user skill by ID
    /// </summary>
    [HttpGet("user-skill/{userSkillId}")]
    public async Task<ActionResult<UserSkillDto>> GetUserSkillById(int userSkillId)
    {
        try
        {
            var userSkill = await _skillService.GetUserSkillByIdAsync(userSkillId);
            if (userSkill == null)
            {
                return NotFound("User skill not found", "USER_SKILL_NOT_FOUND");
            }
            return Ok(userSkill);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user skill", new { userSkillId });
        }
    }

    /// <summary>
    /// Create a new user skill
    /// </summary>
    [HttpPost("user")]
    [Authorize]
    public async Task<ActionResult<UserSkillDto>> CreateUserSkill([FromBody] CreateUserSkillDto createUserSkillDto)
    {
        try
        {
            if (createUserSkillDto == null)
            {
                return BadRequest("Invalid user skill data", "INVALID_REQUEST_DATA");
            }

            // Debug: Log the received data
            _logger.LogInformation("Received CreateUserSkill request: SkillId={SkillId}, Type={Type}, Level={Level}, CreditsPerHour={CreditsPerHour}", 
                createUserSkillDto.SkillId, createUserSkillDto.Type, createUserSkillDto.Level, createUserSkillDto.CreditsPerHour);

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

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated", "UNAUTHORIZED");
            }

            var userSkill = await _skillService.CreateUserSkillAsync(userId, createUserSkillDto);
            return CreatedAtAction(nameof(GetUserSkills), new { userId }, userSkill);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "create user skill");
        }
    }

    /// <summary>
    /// Update user skill
    /// </summary>
    [HttpPut("user/{userSkillId}")]
    [Authorize]
    public async Task<ActionResult<UserSkillDto>> UpdateUserSkill(int userSkillId, [FromBody] UpdateUserSkillDto updateUserSkillDto)
    {
        try
        {
            if (updateUserSkillDto == null)
            {
                return BadRequest("Invalid user skill data", "INVALID_REQUEST_DATA");
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

            var userSkill = await _skillService.UpdateUserSkillAsync(userSkillId, updateUserSkillDto);
            return Ok(userSkill);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message, "USER_SKILL_NOT_FOUND");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "update user skill", new { userSkillId });
        }
    }

    /// <summary>
    /// Delete user skill
    /// </summary>
    [HttpDelete("user/{userSkillId}")]
    [Authorize]
    public async Task<ActionResult> DeleteUserSkill(int userSkillId)
    {
        try
        {
            var result = await _skillService.DeleteUserSkillAsync(userSkillId);
            if (result)
            {
                return Ok(new { message = "User skill deleted successfully" });
            }
            return NotFound("User skill not found", "USER_SKILL_NOT_FOUND");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "delete user skill", new { userSkillId });
        }
    }

    /// <summary>
    /// Get all offered skills from all users (excluding current user)
    /// </summary>
    [HttpGet("offered")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetAllOfferedSkills()
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var offeredSkills = await _skillService.GetAllOfferedSkillsAsync(currentUserId);
            return Ok(offeredSkills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get all offered skills");
        }
    }

    /// <summary>
    /// Get all available user skills (public endpoint for skills discovery)
    /// </summary>
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetAllAvailableUserSkills()
    {
        try
        {
            var availableSkills = await _skillService.GetAllOfferedSkillsAsync();
            return Ok(availableSkills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get all available user skills");
        }
    }

    /// <summary>
    /// Search skills
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> SearchSkills([FromQuery] string searchTerm, [FromQuery] string? category = null, [FromQuery] string? location = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("Search term is required", "INVALID_SEARCH_TERM");
            }

            if (searchTerm.Length < 2)
            {
                return BadRequest("Search term must be at least 2 characters long", "SEARCH_TERM_TOO_SHORT");
            }

            var skills = await _skillService.SearchSkillsAsync(searchTerm, category, location);
            return Ok(skills);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "search skills", new { searchTerm, category, location });
        }
    }
}
