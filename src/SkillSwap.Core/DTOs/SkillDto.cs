using SkillSwap.Core.Entities;
using System.ComponentModel.DataAnnotations;

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
    [Required(ErrorMessage = "Skill name is required")]
    [StringLength(100, ErrorMessage = "Skill name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Category is required")]
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "Sub-category cannot exceed 200 characters")]
    public string? SubCategory { get; set; }
}

public class UpdateSkillDto
{
    [StringLength(100, ErrorMessage = "Skill name cannot exceed 100 characters")]
    public string? Name { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    [StringLength(200, ErrorMessage = "Sub-category cannot exceed 200 characters")]
    public string? SubCategory { get; set; }

    public bool? IsActive { get; set; }
}

public class CreateUserSkillDto
{
    [Required(ErrorMessage = "Skill ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid skill ID")]
    public int SkillId { get; set; }

    [Required(ErrorMessage = "Skill type is required")]
    public SkillType Type { get; set; }

    [Required(ErrorMessage = "Skill level is required")]
    public SkillLevel Level { get; set; }

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    [StringLength(500, ErrorMessage = "Requirements cannot exceed 500 characters")]
    public string? Requirements { get; set; }

    [Range(0.1, 1000.0, ErrorMessage = "Credits per hour must be between 0.1 and 1000")]
    public decimal CreditsPerHour { get; set; } = 1.0m;
}

public class UpdateUserSkillDto
{
    public SkillLevel? Level { get; set; }

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    [StringLength(500, ErrorMessage = "Requirements cannot exceed 500 characters")]
    public string? Requirements { get; set; }

    [Range(0.1, 1000.0, ErrorMessage = "Credits per hour must be between 0.1 and 1000")]
    public decimal? CreditsPerHour { get; set; }

    public bool? IsAvailable { get; set; }
}