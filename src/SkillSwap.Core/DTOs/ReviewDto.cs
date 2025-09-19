using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public string RevieweeId { get; set; } = string.Empty;
    public int SessionId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsVisible { get; set; }
    public UserDto Reviewer { get; set; } = null!;
    public UserDto Reviewee { get; set; } = null!;
    public SessionDto Session { get; set; } = null!;
}

public class CreateReviewDto
{
    [Required(ErrorMessage = "Reviewee ID is required")]
    public string RevieweeId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Session ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Session ID must be a positive number")]
    public int SessionId { get; set; }

    [Required(ErrorMessage = "Rating is required")]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int Rating { get; set; }

    [StringLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
    public string? Comment { get; set; }
}

public class UpdateReviewDto
{
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int? Rating { get; set; }

    [StringLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
    public string? Comment { get; set; }
}