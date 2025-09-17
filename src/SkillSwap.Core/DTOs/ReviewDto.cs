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
    public string RevieweeId { get; set; } = string.Empty;
    public int SessionId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReviewDto
{
    public int? Rating { get; set; }
    public string? Comment { get; set; }
}