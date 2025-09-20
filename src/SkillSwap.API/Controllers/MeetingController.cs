using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.Interfaces.Services;
using SkillSwap.Core.DTOs;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeetingController : BaseController
{
    private readonly IMeetingService _meetingService;

    public MeetingController(IMeetingService meetingService, ILogger<MeetingController> logger) : base(logger)
    {
        _meetingService = meetingService;
    }

    /// <summary>
    /// Generate a Google Meet link
    /// </summary>
    [HttpPost("google-meet")]
    public async Task<ActionResult<object>> GenerateGoogleMeetLink([FromBody] CreateMeetingRequestDto request)
    {
        try
        {
            var meetingLink = await _meetingService.GenerateGoogleMeetLinkAsync(request);
            return Ok(meetingLink);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "generate Google Meet link");
        }
    }

    /// <summary>
    /// Generate a Zoom meeting link
    /// </summary>
    [HttpPost("zoom")]
    public async Task<ActionResult<object>> GenerateZoomLink([FromBody] CreateMeetingRequestDto request)
    {
        try
        {
            var meetingLink = await _meetingService.GenerateZoomLinkAsync(request);
            return Ok(meetingLink);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "generate Zoom link");
        }
    }

    /// <summary>
    /// Generate a Microsoft Teams meeting link
    /// </summary>
    [HttpPost("teams")]
    public async Task<ActionResult<object>> GenerateTeamsLink([FromBody] CreateMeetingRequestDto request)
    {
        try
        {
            var meetingLink = await _meetingService.GenerateTeamsLinkAsync(request);
            return Ok(meetingLink);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "generate Teams link");
        }
    }

    /// <summary>
    /// Generate a meeting link based on platform preference
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<object>> GenerateMeetingLink([FromBody] CreateMeetingRequestDto request)
    {
        try
        {
            var meetingLink = await _meetingService.GenerateMeetingLinkAsync(request);
            return Ok(meetingLink);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "generate meeting link");
        }
    }

    /// <summary>
    /// Validate a meeting link
    /// </summary>
    [HttpPost("validate")]
    public async Task<ActionResult<object>> ValidateMeetingLink([FromBody] ValidateMeetingRequestDto request)
    {
        try
        {
            var isValid = await _meetingService.ValidateMeetingLinkAsync(request.Url);
            return Ok(new { isValid, url = request.Url });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "validate meeting link");
        }
    }
}
