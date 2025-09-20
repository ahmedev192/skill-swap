namespace SkillSwap.Core.DTOs;

public class MeetingLinkDto
{
    public string Url { get; set; } = string.Empty;
    public string MeetingId { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public string? Password { get; set; }
}

public class CreateMeetingRequestDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int Duration { get; set; } = 60; // in minutes
    public string? StartTime { get; set; }
    public string Platform { get; set; } = "google-meet"; // google-meet, zoom, teams
}

public class ValidateMeetingRequestDto
{
    public string Url { get; set; } = string.Empty;
}
