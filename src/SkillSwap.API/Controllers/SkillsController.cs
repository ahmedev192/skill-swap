using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _skillService;
    private readonly ILogger<SkillsController> _logger;

    public SkillsController(ISkillService skillService, ILogger<SkillsController> logger)
    {
        _skillService = skillService;
        _logger = logger;
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
            _logger.LogError(ex, "Error getting skills");
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
                return NotFound();
            }
            return Ok(skill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting skill {SkillId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var skills = await _skillService.GetSkillsByCategoryAsync(category);
            return Ok(skills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting skills by category {Category}", category);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var skill = await _skillService.CreateSkillAsync(createSkillDto);
            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating skill");
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            return NotFound(new { message = "Skill not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting skill {SkillId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Users can only view their own skills unless they're admin
            if (currentUserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var userSkills = await _skillService.GetUserSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user skills for {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var userSkills = await _skillService.GetOfferedSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting offered skills for {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var userSkills = await _skillService.GetRequestedSkillsAsync(userId);
            return Ok(userSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting requested skills for {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
                return NotFound();
            }
            return Ok(userSkill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user skill {UserSkillId}", userSkillId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var userSkill = await _skillService.CreateUserSkillAsync(userId, createUserSkillDto);
            return CreatedAtAction(nameof(GetUserSkills), new { userId }, userSkill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user skill");
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var userSkill = await _skillService.UpdateUserSkillAsync(userSkillId, updateUserSkillDto);
            return Ok(userSkill);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("User skill not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user skill {UserSkillId}", userSkillId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            return NotFound(new { message = "User skill not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user skill {UserSkillId}", userSkillId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var offeredSkills = await _skillService.GetAllOfferedSkillsAsync(currentUserId);
            return Ok(offeredSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all offered skills");
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            if (string.IsNullOrEmpty(searchTerm))
            {
                return BadRequest(new { message = "Search term is required" });
            }

            var skills = await _skillService.SearchSkillsAsync(searchTerm, category, location);
            return Ok(skills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching skills");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
