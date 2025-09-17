using SkillSwap.Core.Entities;

namespace SkillSwap.Core.DTOs;

public class SkillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserSkillDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int SkillId { get; set; }
    public SkillType Type { get; set; }
    public SkillLevel Level { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public decimal CreditsPerHour { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public SkillDto Skill { get; set; } = null!;
    public UserDto User { get; set; } = null!;
}

public class CreateSkillDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
}

public class UpdateSkillDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? SubCategory { get; set; }
    public bool? IsActive { get; set; }
}

public class CreateUserSkillDto
{
    public int SkillId { get; set; }
    public SkillType Type { get; set; }
    public SkillLevel Level { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public decimal CreditsPerHour { get; set; } = 1.0m;
}

public class UpdateUserSkillDto
{
    public SkillLevel? Level { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public decimal? CreditsPerHour { get; set; }
    public bool? IsAvailable { get; set; }
}