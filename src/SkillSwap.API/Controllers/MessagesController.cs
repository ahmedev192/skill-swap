using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using SkillSwap.API.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;
    private readonly ISignalRNotificationService _signalRNotificationService;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(IMessageService messageService, ISignalRNotificationService signalRNotificationService, ILogger<MessagesController> logger)
    {
        _messageService = messageService;
        _signalRNotificationService = signalRNotificationService;
        _logger = logger;
    }

    /// <summary>
    /// Get conversations for current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var conversations = await _messageService.GetUserConversationsAsync(userId);
            return Ok(conversations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversations");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get messages between current user and another user
    /// </summary>
    [HttpGet("conversation/{otherUserId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetConversation(string otherUserId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] bool markAsRead = true)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var messages = await _messageService.GetConversationAsync(userId, otherUserId, page, pageSize);
            
            // Automatically mark messages as read when conversation is opened
            if (markAsRead)
            {
                await _messageService.MarkMessagesAsReadAsync(userId, otherUserId);
            }
            
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversation with {OtherUserId}", otherUserId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Send a message
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] CreateMessageDto createMessageDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var message = await _messageService.SendMessageAsync(userId, createMessageDto);
            
            // Send real-time notification to receiver
            await _signalRNotificationService.NotifyMessageReceived(message);

            // Update conversation for both users
            var conversationForReceiver = new ConversationDto
            {
                OtherUserId = userId,
                OtherUserName = $"{message.Sender.FirstName} {message.Sender.LastName}",
                OtherUserProfileImage = message.Sender.ProfileImageUrl,
                LastMessage = message.Content,
                LastMessageTime = message.SentAt,
                UnreadCount = 1
            };

            var conversationForSender = new ConversationDto
            {
                OtherUserId = createMessageDto.ReceiverId,
                OtherUserName = $"{message.Receiver.FirstName} {message.Receiver.LastName}",
                OtherUserProfileImage = message.Receiver.ProfileImageUrl,
                LastMessage = message.Content,
                LastMessageTime = message.SentAt,
                UnreadCount = 0
            };

            await _signalRNotificationService.NotifyConversationUpdated(conversationForReceiver, createMessageDto.ReceiverId);
            await _signalRNotificationService.NotifyConversationUpdated(conversationForSender, userId);

            return CreatedAtAction(nameof(GetConversation), new { otherUserId = createMessageDto.ReceiverId }, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Mark messages as read
    /// </summary>
    [HttpPost("mark-read")]
    public async Task<ActionResult> MarkMessagesAsRead([FromBody] MarkMessagesReadDto markReadDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var markedMessages = await _messageService.MarkMessagesAsReadAsync(userId, markReadDto.SenderId);
            
            // Notify sender that their messages were read
            var readAt = DateTime.UtcNow.ToString("O");
            // Send notification for each marked message
            foreach (var messageId in markedMessages)
            {
                await _signalRNotificationService.NotifyMessageRead(messageId, readAt, markReadDto.SenderId);
            }

            return Ok(new { message = "Messages marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking messages as read");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get unread message count
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var count = await _messageService.GetUnreadMessageCountAsync(userId);
            return Ok(new { unreadCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}

public class MarkMessagesReadDto
{
    public string SenderId { get; set; } = string.Empty;
}
