using SkillSwap.Core.Entities;

namespace SkillSwap.Core.DTOs;

public class BadgeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public BadgeType Type { get; set; }
    public int RequiredValue { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserBadgeDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int BadgeId { get; set; }
    public DateTime EarnedAt { get; set; }
    public UserDto User { get; set; } = null!;
    public BadgeDto Badge { get; set; } = null!;
}
