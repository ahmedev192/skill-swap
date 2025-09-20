using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace SkillSwap.Infrastructure.Services;

public class MeetingService : IMeetingService
{
    private readonly ILogger<MeetingService> _logger;
    private readonly GoogleCalendarService _googleCalendarService;

    public MeetingService(ILogger<MeetingService> logger, GoogleCalendarService googleCalendarService)
    {
        _logger = logger;
        _googleCalendarService = googleCalendarService;
    }

    public async Task<MeetingLinkDto> GenerateGoogleMeetLinkAsync(CreateMeetingRequestDto request)
    {
        try
        {
            // Use Google Calendar Service to create a real meeting
            var startTime = DateTime.UtcNow.AddHours(1); // Default to 1 hour from now
            var endTime = startTime.AddMinutes(request.Duration);
            
            if (!string.IsNullOrEmpty(request.StartTime) && DateTime.TryParse(request.StartTime, out var parsedStart))
            {
                startTime = parsedStart;
                endTime = startTime.AddMinutes(request.Duration);
            }
            
            var meetUrl = await _googleCalendarService.CreateMeetingAsync(
                request.Title ?? "SkillSwap Session",
                request.Description ?? "SkillSwap learning session",
                startTime,
                endTime,
                new string[0] // No attendees for now
            );
            
            var meetingId = ExtractMeetingIdFromUrl(meetUrl);
            
            var meetingLink = new MeetingLinkDto
            {
                Url = meetUrl,
                MeetingId = meetingId,
                Platform = "google-meet",
                ExpiresAt = CalculateExpirationDate(request.Duration)
            };

            _logger.LogInformation("Generated Google Meet link: {MeetingId}", meetingId);
            return meetingLink;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Google Meet link");
            throw;
        }
    }

    private string GenerateRealisticMeetingId()
    {
        // Generate a more realistic Google Meet ID format
        // Real Google Meet IDs are typically 10-11 characters with mixed case
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var meetingId = new char[10];
        
        for (int i = 0; i < meetingId.Length; i++)
        {
            meetingId[i] = chars[random.Next(chars.Length)];
        }
        
        return new string(meetingId);
    }

    public async Task<MeetingLinkDto> GenerateZoomLinkAsync(CreateMeetingRequestDto request)
    {
        try
        {
            // For now, return a placeholder Zoom link
            // In a real implementation, this would call the Zoom API
            var meetingId = Guid.NewGuid().ToString("N")[..10];
            var zoomUrl = $"https://zoom.us/j/{meetingId}";
            
            var meetingLink = new MeetingLinkDto
            {
                Url = zoomUrl,
                MeetingId = meetingId,
                Platform = "zoom",
                ExpiresAt = CalculateExpirationDate(request.Duration)
            };

            _logger.LogInformation("Generated Zoom link: {MeetingId}", meetingId);
            return meetingLink;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Zoom link");
            throw;
        }
    }

    public async Task<MeetingLinkDto> GenerateTeamsLinkAsync(CreateMeetingRequestDto request)
    {
        try
        {
            // For now, return a placeholder Teams link
            // In a real implementation, this would call the Microsoft Graph API
            var meetingId = Guid.NewGuid().ToString("N")[..10];
            var teamsUrl = $"https://teams.microsoft.com/l/meetup-join/{meetingId}";
            
            var meetingLink = new MeetingLinkDto
            {
                Url = teamsUrl,
                MeetingId = meetingId,
                Platform = "teams",
                ExpiresAt = CalculateExpirationDate(request.Duration)
            };

            _logger.LogInformation("Generated Teams link: {MeetingId}", meetingId);
            return meetingLink;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Teams link");
            throw;
        }
    }

    public async Task<MeetingLinkDto> GenerateMeetingLinkAsync(CreateMeetingRequestDto request)
    {
        var platform = request.Platform?.ToLower() ?? "google-meet";
        
        return platform switch
        {
            "google-meet" => await GenerateGoogleMeetLinkAsync(request),
            "zoom" => await GenerateZoomLinkAsync(request),
            "teams" => await GenerateTeamsLinkAsync(request),
            _ => await GenerateGoogleMeetLinkAsync(request)
        };
    }

    public async Task<bool> ValidateMeetingLinkAsync(string url)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            var uri = new Uri(url);
            
            // Check if it's a valid meeting platform URL
            var validDomains = new[]
            {
                "meet.google.com",
                "zoom.us",
                "teams.microsoft.com",
                "teams.live.com"
            };
            
            return validDomains.Any(domain => uri.Host.Contains(domain));
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> ExtractMeetingIdAsync(string url)
    {
        try
        {
            var uri = new Uri(url);
            
            if (uri.Host.Contains("meet.google.com"))
            {
                return uri.AbsolutePath.TrimStart('/');
            }
            else if (uri.Host.Contains("zoom.us"))
            {
                var match = System.Text.RegularExpressions.Regex.Match(uri.AbsolutePath, @"/j/(.+)");
                return match.Success ? match.Groups[1].Value : string.Empty;
            }
            else if (uri.Host.Contains("teams.microsoft.com"))
            {
                var match = System.Text.RegularExpressions.Regex.Match(uri.AbsolutePath, @"/l/meetup-join/(.+)");
                return match.Success ? match.Groups[1].Value : string.Empty;
            }
            
            return string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    public async Task<string> GetMeetingPlatformAsync(string url)
    {
        try
        {
            var uri = new Uri(url);
            
            if (uri.Host.Contains("meet.google.com"))
            {
                return "Google Meet";
            }
            else if (uri.Host.Contains("zoom.us"))
            {
                return "Zoom";
            }
            else if (uri.Host.Contains("teams.microsoft.com") || uri.Host.Contains("teams.live.com"))
            {
                return "Microsoft Teams";
            }
            
            return "Unknown";
        }
        catch
        {
            return "Unknown";
        }
    }

    private string ExtractMeetingIdFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            if (uri.Host.Contains("meet.google.com"))
            {
                return uri.AbsolutePath.TrimStart('/');
            }
            return Guid.NewGuid().ToString("N")[..10];
        }
        catch
        {
            return Guid.NewGuid().ToString("N")[..10];
        }
    }

    private DateTime CalculateExpirationDate(int durationMinutes)
    {
        return DateTime.UtcNow.AddMinutes(durationMinutes + 60); // Add 1 hour buffer
    }
}
