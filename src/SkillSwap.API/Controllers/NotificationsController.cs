using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseController
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger) : base(logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's notifications
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        try
        {
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            var userId = GetCurrentUserId();
            var notifications = await _notificationService.GetUserNotificationsAsync(userId!, unreadOnly);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get notifications", new { unreadOnly });
        }
    }

    /// <summary>
    /// Get unread notification count
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount()
    {
        try
        {
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            var userId = GetCurrentUserId();
            var count = await _notificationService.GetUnreadNotificationCountAsync(userId!);
            return Ok(new { unreadCount = count });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get unread count");
        }
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPost("{id}/mark-read")]
    public async Task<ActionResult> MarkAsRead([Required] int id)
    {
        try
        {
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            if (id <= 0)
            {
                return BadRequest("Invalid notification ID", "INVALID_NOTIFICATION_ID");
            }

            var result = await _notificationService.MarkNotificationAsReadAsync(id);
            if (result)
            {
                return Ok(new { message = "Notification marked as read", notificationId = id });
            }
            return NotFound("Notification not found", "NOTIFICATION_NOT_FOUND", new { notificationId = id });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "mark notification as read", new { notificationId = id });
        }
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPost("mark-all-read")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        try
        {
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            var userId = GetCurrentUserId();
            await _notificationService.MarkAllNotificationsAsReadAsync(userId!);
            return Ok(new { message = "All notifications marked as read" });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "mark all notifications as read");
        }
    }
}
