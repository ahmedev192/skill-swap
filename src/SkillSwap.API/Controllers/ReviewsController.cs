using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : BaseController
{
    private readonly IReviewService _reviewService;
    private readonly INotificationService _notificationService;

    public ReviewsController(IReviewService reviewService, INotificationService notificationService, ILogger<ReviewsController> logger) : base(logger)
    {
        _reviewService = reviewService;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Get reviews given by current user
    /// </summary>
    [HttpGet("my-reviews")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetMyReviews()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated", "USER_NOT_AUTHENTICATED");
            }

            var reviews = await _reviewService.GetUserReviewsAsync(userId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user reviews");
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var reviews = await _reviewService.GetReviewsForUserAsync(userId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get reviews for user", new { userId });
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
            if (id <= 0)
            {
                return BadRequest("Invalid review ID", "INVALID_REVIEW_ID");
            }

            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound("Review not found", "REVIEW_NOT_FOUND");
            }

            return Ok(review);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get review", new { reviewId = id });
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
            if (createReviewDto == null)
            {
                return BadRequest("Review data is required", "INVALID_REQUEST_DATA");
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

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated", "USER_NOT_AUTHENTICATED");
            }

            var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);
            
            // Send notification to the reviewee about the new review
            var reviewerName = $"{User.FindFirst("firstName")?.Value} {User.FindFirst("lastName")?.Value}";
            await _notificationService.SendNewReviewNotificationAsync(createReviewDto.RevieweeId, reviewerName, createReviewDto.Rating, createReviewDto.SessionId);
            
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message, "INVALID_REVIEW_DATA");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message, "REVIEW_OPERATION_FAILED");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex.Message, "UNAUTHORIZED_REVIEW_ACCESS");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "create review", createReviewDto);
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
            if (id <= 0)
            {
                return BadRequest("Invalid review ID", "INVALID_REVIEW_ID");
            }

            if (updateReviewDto == null)
            {
                return BadRequest("Update data is required", "INVALID_REQUEST_DATA");
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

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated", "USER_NOT_AUTHENTICATED");
            }

            // Check if user owns the review
            var existingReview = await _reviewService.GetReviewByIdAsync(id);
            if (existingReview == null)
            {
                return NotFound("Review not found", "REVIEW_NOT_FOUND");
            }

            if (existingReview.ReviewerId != userId)
            {
                return Forbidden("You can only update your own reviews", "UNAUTHORIZED_REVIEW_UPDATE");
            }

            var review = await _reviewService.UpdateReviewAsync(id, updateReviewDto);
            return Ok(review);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message, "REVIEW_NOT_FOUND");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex.Message, "UNAUTHORIZED_REVIEW_UPDATE");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "update review", new { reviewId = id, updateData = updateReviewDto });
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
            if (id <= 0)
            {
                return BadRequest("Invalid review ID", "INVALID_REVIEW_ID");
            }

            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated", "USER_NOT_AUTHENTICATED");
            }

            // Check if user owns the review
            var existingReview = await _reviewService.GetReviewByIdAsync(id);
            if (existingReview == null)
            {
                return NotFound("Review not found", "REVIEW_NOT_FOUND");
            }

            if (existingReview.ReviewerId != userId)
            {
                return Forbidden("You can only delete your own reviews", "UNAUTHORIZED_REVIEW_DELETE");
            }

            var result = await _reviewService.DeleteReviewAsync(id);
            if (result)
            {
                return Ok(new { message = "Review deleted successfully" });
            }
            return NotFound("Review not found", "REVIEW_NOT_FOUND");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex.Message, "UNAUTHORIZED_REVIEW_DELETE");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "delete review", new { reviewId = id });
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
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required", "INVALID_USER_ID");
            }

            var averageRating = await _reviewService.GetUserAverageRatingAsync(userId);
            var reviewCount = await _reviewService.GetUserReviewCountAsync(userId);

            return Ok(new { averageRating, reviewCount });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get user rating", new { userId });
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
            if (sessionId <= 0)
            {
                return BadRequest("Invalid session ID", "INVALID_SESSION_ID");
            }

            var reviews = await _reviewService.GetSessionReviewsAsync(sessionId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get session reviews", new { sessionId });
        }
    }
}
