using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReviewDto>> GetUserReviewsAsync(string userId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.ReviewerId == userId);
        return _mapper.Map<IEnumerable<ReviewDto>>(reviews.OrderByDescending(r => r.CreatedAt));
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsForUserAsync(string userId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.RevieweeId == userId && r.IsVisible);
        return _mapper.Map<IEnumerable<ReviewDto>>(reviews.OrderByDescending(r => r.CreatedAt));
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(int reviewId)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
        return review != null ? _mapper.Map<ReviewDto>(review) : null;
    }

    public async Task<ReviewDto> CreateReviewAsync(string reviewerId, CreateReviewDto createReviewDto)
    {
        // Check if session exists and is completed
        var session = await _unitOfWork.Sessions.GetByIdAsync(createReviewDto.SessionId);
        if (session == null)
        {
            throw new ArgumentException("Session not found");
        }

        if (session.Status != SessionStatus.Completed)
        {
            throw new InvalidOperationException("Can only review completed sessions");
        }

        // Check if user is part of the session
        if (session.TeacherId != reviewerId && session.StudentId != reviewerId)
        {
            throw new UnauthorizedAccessException("Not authorized to review this session");
        }

        // Check if review already exists
        var existingReview = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => 
            r.ReviewerId == reviewerId && r.SessionId == createReviewDto.SessionId);
        
        if (existingReview != null)
        {
            throw new InvalidOperationException("Review already exists for this session");
        }

        // Determine who is being reviewed
        var revieweeId = session.TeacherId == reviewerId ? session.StudentId : session.TeacherId;

        var review = _mapper.Map<Review>(createReviewDto);
        review.ReviewerId = reviewerId;
        review.RevieweeId = revieweeId;
        review.CreatedAt = DateTime.UtcNow;
        review.IsVisible = true;

        await _unitOfWork.Reviews.AddAsync(review);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ReviewDto>(review);
    }

    public async Task<ReviewDto> UpdateReviewAsync(int reviewId, UpdateReviewDto updateReviewDto)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
        if (review == null)
        {
            throw new ArgumentException("Review not found");
        }

        _mapper.Map(updateReviewDto, review);
        review.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Reviews.UpdateAsync(review);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ReviewDto>(review);
    }

    public async Task<bool> DeleteReviewAsync(int reviewId)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
        if (review == null)
        {
            return false;
        }

        review.IsVisible = false;
        review.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Reviews.UpdateAsync(review);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<double> GetUserAverageRatingAsync(string userId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.RevieweeId == userId && r.IsVisible);
        return reviews.Any() ? reviews.Average(r => r.Rating) : 0.0;
    }

    public async Task<int> GetUserReviewCountAsync(string userId)
    {
        return await _unitOfWork.Reviews.CountAsync(r => r.RevieweeId == userId && r.IsVisible);
    }

    public async Task<IEnumerable<ReviewDto>> GetSessionReviewsAsync(int sessionId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.SessionId == sessionId && r.IsVisible);
        return _mapper.Map<IEnumerable<ReviewDto>>(reviews.OrderByDescending(r => r.CreatedAt));
    }
}
