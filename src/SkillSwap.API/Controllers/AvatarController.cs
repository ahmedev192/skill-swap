using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Services;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvatarController : BaseController
{
    private readonly IAvatarService _avatarService;

    public AvatarController(IAvatarService avatarService, ILogger<AvatarController> logger) : base(logger)
    {
        _avatarService = avatarService;
    }

    /// <summary>
    /// Get available avatar options for the user to choose from
    /// </summary>
    [HttpGet("options")]
    public async Task<ActionResult<List<AvatarOption>>> GetAvatarOptions()
    {
        try
        {
            var options = _avatarService.GetAvailableAvatarOptions();
            return Ok(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting avatar options");
            return StatusCode(500, "An error occurred while getting avatar options");
        }
    }

    /// <summary>
    /// Generate a random avatar URL for a given seed
    /// </summary>
    [HttpGet("generate")]
    public async Task<ActionResult<string>> GenerateAvatar([FromQuery] string? seed = null)
    {
        try
        {
            var avatarUrl = _avatarService.GenerateRandomAvatarUrl(seed);
            return Ok(new { avatarUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating avatar");
            return StatusCode(500, "An error occurred while generating avatar");
        }
    }

    /// <summary>
    /// Get avatar URL for a user (with custom URL support)
    /// </summary>
    [HttpGet("url")]
    public async Task<ActionResult<string>> GetAvatarUrl([FromQuery] string? seed = null, [FromQuery] string? customUrl = null)
    {
        try
        {
            var avatarUrl = _avatarService.GetAvatarUrl(seed, customUrl);
            return Ok(new { avatarUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting avatar URL");
            return StatusCode(500, "An error occurred while getting avatar URL");
        }
    }
}
