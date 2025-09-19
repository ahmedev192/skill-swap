using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Notification
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public NotificationType Type { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    public int? RelatedEntityId { get; set; } // SessionId, MessageId, etc.

    [MaxLength(50)]
    public string? RelatedEntityType { get; set; }

    [MaxLength(500)]
    public string? ActionUrl { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
}

public enum NotificationType
{
    SessionRequest = 1,
    SessionConfirmed = 2,
    SessionReminder = 3,
    SessionCompleted = 4,
    NewMessage = 5,
    NewReview = 6,
    CreditEarned = 7,
    CreditSpent = 8,
    System = 9,
    MatchFound = 10,
    GroupEvent = 11,
    Referral = 12
}
