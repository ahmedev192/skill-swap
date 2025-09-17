using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Review
{
    public int Id { get; set; }

    [Required]
    public string ReviewerId { get; set; } = string.Empty;

    [Required]
    public string RevieweeId { get; set; } = string.Empty;

    [Required]
    public int SessionId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsVisible { get; set; } = true;

    // Navigation properties
    public virtual User Reviewer { get; set; } = null!;
    public virtual User Reviewee { get; set; } = null!;
    public virtual Session Session { get; set; } = null!;
}
