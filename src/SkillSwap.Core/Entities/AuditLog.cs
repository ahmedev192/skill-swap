using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class AuditLog
{
    public int Id { get; set; }

    public string? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Details { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? User { get; set; }
}
