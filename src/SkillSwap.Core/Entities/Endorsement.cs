using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Endorsement
{
    public int Id { get; set; }

    [Required]
    public string EndorserId { get; set; } = string.Empty;

    [Required]
    public string EndorseeId { get; set; } = string.Empty;

    [Required]
    public int SkillId { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsVerified { get; set; } = false;

    // Navigation properties
    public virtual User Endorser { get; set; } = null!;
    public virtual User Endorsee { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}
