using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class UserSkill
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int SkillId { get; set; }

    [Required]
    public SkillType Type { get; set; } // Offered or Requested

    [Required]
    public SkillLevel Level { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Requirements { get; set; }

    public decimal CreditsPerHour { get; set; } = 1.0m;

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}

public enum SkillType
{
    Offered = 1,
    Requested = 2
}

public enum SkillLevel
{
    Beginner = 1,
    Intermediate = 2,
    Expert = 3
}
