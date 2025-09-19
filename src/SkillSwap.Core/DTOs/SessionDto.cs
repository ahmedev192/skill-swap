using SkillSwap.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.DTOs;

public class SessionDto
{
    public int Id { get; set; }
    public string TeacherId { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public int UserSkillId { get; set; }
    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public decimal CreditsCost { get; set; }
    public SessionStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? MeetingLink { get; set; }
    public bool IsOnline { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public bool TeacherConfirmed { get; set; }
    public bool StudentConfirmed { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public UserDto Teacher { get; set; } = null!;
    public UserDto Student { get; set; } = null!;
    public UserSkillDto UserSkill { get; set; } = null!;
}

public class CreateSessionDto
{
    [Required]
    public string TeacherId { get; set; } = string.Empty;
    
    [Required]
    public int UserSkillId { get; set; }
    
    [Required]
    public DateTime ScheduledStart { get; set; }
    
    [Required]
    public DateTime ScheduledEnd { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public bool IsOnline { get; set; } = true;
    
    [MaxLength(200)]
    public string? Location { get; set; }
}

public class UpdateSessionDto
{
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public string? Notes { get; set; }
    public string? MeetingLink { get; set; }
    public bool? IsOnline { get; set; }
    public string? Location { get; set; }
}

public class ConfirmSessionDto
{
    public bool Confirmed { get; set; }
    public string? Notes { get; set; }
}
