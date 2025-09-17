using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetUserReviewsAsync(string userId);
    Task<IEnumerable<ReviewDto>> GetReviewsForUserAsync(string userId);
    Task<ReviewDto?> GetReviewByIdAsync(int reviewId);
    Task<ReviewDto> CreateReviewAsync(string reviewerId, CreateReviewDto createReviewDto);
    Task<ReviewDto> UpdateReviewAsync(int reviewId, UpdateReviewDto updateReviewDto);
    Task<bool> DeleteReviewAsync(int reviewId);
    Task<double> GetUserAverageRatingAsync(string userId);
    Task<int> GetUserReviewCountAsync(string userId);
    Task<IEnumerable<ReviewDto>> GetSessionReviewsAsync(int sessionId);
}
