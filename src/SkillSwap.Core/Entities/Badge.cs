using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Badge
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? IconUrl { get; set; }

    [Required]
    public BadgeType Type { get; set; }

    [Required]
    public int RequiredValue { get; set; } // Hours taught, sessions completed, etc.

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}

public class UserBadge
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int BadgeId { get; set; }

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Badge Badge { get; set; } = null!;
}

public enum BadgeType
{
    TeachingHours = 1,
    LearningHours = 2,
    SessionsCompleted = 3,
    ReviewsReceived = 4,
    SkillsOffered = 5,
    SkillsLearned = 6,
    Streak = 7,
    CommunityHelper = 8
}
