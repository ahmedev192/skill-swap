using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class UserConnection
{
    public int Id { get; set; }

    [Required]
    public string RequesterId { get; set; } = string.Empty;

    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    [Required]
    public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }

    [MaxLength(500)]
    public string? Message { get; set; }

    // Navigation properties
    public virtual User Requester { get; set; } = null!;
    public virtual User Receiver { get; set; } = null!;
}

public enum ConnectionStatus
{
    Pending = 1,
    Accepted = 2,
    Declined = 3,
    Blocked = 4
}
