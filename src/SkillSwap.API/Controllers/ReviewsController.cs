using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly ILogger<ReviewsController> _logger;

    public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
    {
        _reviewService = reviewService;
        _logger = logger;
    }

    /// <summary>
    /// Get reviews given by current user
    /// </summary>
    [HttpGet("my-reviews")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetMyReviews()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var reviews = await _reviewService.GetUserReviewsAsync(userId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user reviews");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get reviews for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews(string userId)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsForUserAsync(userId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reviews for user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get review by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDto>> GetReview(int id)
    {
        try
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            return Ok(review);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting review {ReviewId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Create a new review
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewDto createReviewDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Review creation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Review creation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized review creation: {Message}", ex.Message);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating review");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update review
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ReviewDto>> UpdateReview(int id, [FromBody] UpdateReviewDto updateReviewDto)
    {
        try
        {
            var review = await _reviewService.UpdateReviewAsync(id, updateReviewDto);
            return Ok(review);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Review not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating review {ReviewId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Delete review
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(int id)
    {
        try
        {
            var result = await _reviewService.DeleteReviewAsync(id);
            if (result)
            {
                return Ok(new { message = "Review deleted successfully" });
            }
            return NotFound(new { message = "Review not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting review {ReviewId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user's average rating
    /// </summary>
    [HttpGet("user/{userId}/rating")]
    public async Task<ActionResult<object>> GetUserRating(string userId)
    {
        try
        {
            var averageRating = await _reviewService.GetUserAverageRatingAsync(userId);
            var reviewCount = await _reviewService.GetUserReviewCountAsync(userId);

            return Ok(new { averageRating, reviewCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user rating for {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get reviews for a session
    /// </summary>
    [HttpGet("session/{sessionId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetSessionReviews(int sessionId)
    {
        try
        {
            var reviews = await _reviewService.GetSessionReviewsAsync(sessionId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session reviews for {SessionId}", sessionId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
