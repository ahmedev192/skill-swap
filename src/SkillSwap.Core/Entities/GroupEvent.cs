using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class GroupEvent
{
    public int Id { get; set; }

    [Required]
    public string OrganizerId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public int SkillId { get; set; }

    [Required]
    public DateTime ScheduledStart { get; set; }

    [Required]
    public DateTime ScheduledEnd { get; set; }

    [Required]
    public decimal CreditsCost { get; set; }

    [Required]
    public int MaxParticipants { get; set; }

    public int CurrentParticipants { get; set; } = 0;

    [Required]
    public EventType Type { get; set; }

    [MaxLength(500)]
    public string? MeetingLink { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public bool IsOnline { get; set; } = true;

    [Required]
    public EventStatus Status { get; set; } = EventStatus.Scheduled;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual User Organizer { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
    public virtual ICollection<GroupEventParticipant> Participants { get; set; } = new List<GroupEventParticipant>();
}

public class GroupEventParticipant
{
    public int Id { get; set; }

    [Required]
    public int GroupEventId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public bool HasPaid { get; set; } = false;

    // Navigation properties
    public virtual GroupEvent GroupEvent { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public enum EventType
{
    Workshop = 1,
    Webinar = 2,
    StudyGroup = 3,
    PracticeSession = 4
}

public enum EventStatus
{
    Scheduled = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}
