using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _matchingService;
    private readonly ILogger<MatchingController> _logger;

    public MatchingController(IMatchingService matchingService, ILogger<MatchingController> logger)
    {
        _matchingService = matchingService;
        _logger = logger;
    }

    /// <summary>
    /// Find matches for current user
    /// </summary>
    [HttpGet("my-matches")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetMyMatches()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var matches = await _matchingService.FindMatchesAsync(userId);
            return Ok(matches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting matches for user");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Find offered skills for a requested skill
    /// </summary>
    [HttpGet("offered-for-request/{requestedSkillId}")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetOfferedSkillsForRequest(int requestedSkillId)
    {
        try
        {
            var offeredSkills = await _matchingService.FindOfferedSkillsForRequestAsync(requestedSkillId);
            return Ok(offeredSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting offered skills for request {RequestedSkillId}", requestedSkillId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Find requested skills for an offered skill
    /// </summary>
    [HttpGet("requested-for-offer/{offeredSkillId}")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetRequestedSkillsForOffer(int offeredSkillId)
    {
        try
        {
            var requestedSkills = await _matchingService.FindRequestedSkillsForOfferAsync(offeredSkillId);
            return Ok(requestedSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting requested skills for offer {OfferedSkillId}", offeredSkillId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get recommended skills for current user
    /// </summary>
    [HttpGet("recommended-skills")]
    public async Task<ActionResult<IEnumerable<UserSkillDto>>> GetRecommendedSkills()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var recommendedSkills = await _matchingService.GetRecommendedSkillsAsync(userId);
            return Ok(recommendedSkills);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommended skills");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get recommended users for current user
    /// </summary>
    [HttpGet("recommended-users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetRecommendedUsers()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var recommendedUsers = await _matchingService.GetRecommendedUsersAsync(userId);
            return Ok(recommendedUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommended users");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
