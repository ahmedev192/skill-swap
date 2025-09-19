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
    [Required(ErrorMessage = "Teacher ID is required")]
    public string TeacherId { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "User skill ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "User skill ID must be a positive number")]
    public int UserSkillId { get; set; }
    
    [Required(ErrorMessage = "Scheduled start time is required")]
    public DateTime ScheduledStart { get; set; }
    
    [Required(ErrorMessage = "Scheduled end time is required")]
    public DateTime ScheduledEnd { get; set; }
    
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
    
    public bool IsOnline { get; set; } = true;
    
    [MaxLength(200, ErrorMessage = "Location cannot exceed 200 characters")]
    public string? Location { get; set; }
    
    [MaxLength(500, ErrorMessage = "Meeting link cannot exceed 500 characters")]
    public string? MeetingLink { get; set; }
}

public class UpdateSessionDto
{
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
    
    [MaxLength(500, ErrorMessage = "Meeting link cannot exceed 500 characters")]
    public string? MeetingLink { get; set; }
    
    public bool? IsOnline { get; set; }
    
    [MaxLength(200, ErrorMessage = "Location cannot exceed 200 characters")]
    public string? Location { get; set; }
}

public class ConfirmSessionDto
{
    [Required(ErrorMessage = "Confirmation status is required")]
    public bool Confirmed { get; set; }
    
    [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
    public string? Notes { get; set; }
}

public class CancelSessionDto
{
    [Required(ErrorMessage = "Cancellation reason is required")]
    [MaxLength(500, ErrorMessage = "Cancellation reason cannot exceed 500 characters")]
    public string Reason { get; set; } = string.Empty;
}

public class RescheduleSessionDto
{
    [Required(ErrorMessage = "New start time is required")]
    public DateTime NewStart { get; set; }
    
    [Required(ErrorMessage = "New end time is required")]
    public DateTime NewEnd { get; set; }
}
