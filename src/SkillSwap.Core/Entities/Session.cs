using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Session
{
    public int Id { get; set; }

    [Required]
    public string TeacherId { get; set; } = string.Empty;

    [Required]
    public string StudentId { get; set; } = string.Empty;

    [Required]
    public int UserSkillId { get; set; }

    [Required]
    public DateTime ScheduledStart { get; set; }

    [Required]
    public DateTime ScheduledEnd { get; set; }

    public DateTime? ActualStart { get; set; }

    public DateTime? ActualEnd { get; set; }

    [Required]
    public decimal CreditsCost { get; set; }

    [Required]
    public SessionStatus Status { get; set; } = SessionStatus.Pending;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(500)]
    public string? MeetingLink { get; set; }

    public bool IsOnline { get; set; } = true;

    [MaxLength(200)]
    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    public bool TeacherConfirmed { get; set; } = false;

    public bool StudentConfirmed { get; set; } = false;

    public DateTime? ConfirmedAt { get; set; }

    // Navigation properties
    public virtual User Teacher { get; set; } = null!;
    public virtual User Student { get; set; } = null!;
    public virtual UserSkill UserSkill { get; set; } = null!;
    public virtual ICollection<SessionMessage> Messages { get; set; } = new List<SessionMessage>();
}

public enum SessionStatus
{
    Pending = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    Disputed = 6
}
