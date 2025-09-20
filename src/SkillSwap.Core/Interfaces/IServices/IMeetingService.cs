using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IMeetingService
{
    Task<MeetingLinkDto> GenerateGoogleMeetLinkAsync(CreateMeetingRequestDto request);
    Task<MeetingLinkDto> GenerateZoomLinkAsync(CreateMeetingRequestDto request);
    Task<MeetingLinkDto> GenerateTeamsLinkAsync(CreateMeetingRequestDto request);
    Task<MeetingLinkDto> GenerateMeetingLinkAsync(CreateMeetingRequestDto request);
    Task<bool> ValidateMeetingLinkAsync(string url);
    Task<string> ExtractMeetingIdAsync(string url);
    Task<string> GetMeetingPlatformAsync(string url);
}
