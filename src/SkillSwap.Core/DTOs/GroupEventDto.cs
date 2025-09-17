using SkillSwap.Core.Entities;

namespace SkillSwap.Core.DTOs;

public class GroupEventDto
{
    public int Id { get; set; }
    public string OrganizerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SkillId { get; set; }
    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public decimal CreditsCost { get; set; }
    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public EventType Type { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; }
    public EventStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public UserDto Organizer { get; set; } = null!;
    public SkillDto Skill { get; set; } = null!;
    public ICollection<GroupEventParticipantDto> Participants { get; set; } = new List<GroupEventParticipantDto>();
}

public class CreateGroupEventDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SkillId { get; set; }
    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public decimal CreditsCost { get; set; }
    public int MaxParticipants { get; set; }
    public EventType Type { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; } = true;
}

public class UpdateGroupEventDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ScheduledEnd { get; set; }
    public decimal? CreditsCost { get; set; }
    public int? MaxParticipants { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public bool? IsOnline { get; set; }
}

public class GroupEventParticipantDto
{
    public int Id { get; set; }
    public int GroupEventId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public bool HasPaid { get; set; }
    public UserDto User { get; set; } = null!;
}
