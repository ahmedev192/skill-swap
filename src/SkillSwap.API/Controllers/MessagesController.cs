using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using SkillSwap.API.Services;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : BaseController
{
    private readonly IMessageService _messageService;
    private readonly ISignalRNotificationService _signalRNotificationService;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(IMessageService messageService, ISignalRNotificationService signalRNotificationService, ILogger<MessagesController> logger) : base(logger)
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
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            var userId = GetCurrentUserId();
            var conversations = await _messageService.GetUserConversationsAsync(userId!);
            return Ok(conversations);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get conversations");
        }
    }

    /// <summary>
    /// Get messages between current user and another user
    /// </summary>
    [HttpGet("conversation/{otherUserId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetConversation(
        [Required] string otherUserId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50, 
        [FromQuery] bool markAsRead = true)
    {
        try
        {
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            if (string.IsNullOrWhiteSpace(otherUserId))
            {
                return BadRequest("Other user ID is required", "INVALID_USER_ID");
            }

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            var userId = GetCurrentUserId();
            var messages = await _messageService.GetConversationAsync(userId!, otherUserId, page, pageSize);
            
            // Automatically mark messages as read when conversation is opened
            if (markAsRead)
            {
                await _messageService.MarkMessagesAsReadAsync(userId!, otherUserId);
            }
            
            return Ok(messages);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get conversation", new { otherUserId, page, pageSize });
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
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            if (createMessageDto == null)
            {
                return BadRequest("Message data is required", "INVALID_MESSAGE_DATA");
            }

            if (string.IsNullOrWhiteSpace(createMessageDto.ReceiverId))
            {
                return BadRequest("Receiver ID is required", "INVALID_RECEIVER_ID");
            }

            if (string.IsNullOrWhiteSpace(createMessageDto.Content))
            {
                return BadRequest("Message content is required", "INVALID_MESSAGE_CONTENT");
            }

            if (createMessageDto.Content.Length > 1000)
            {
                return BadRequest("Message content cannot exceed 1000 characters", "MESSAGE_TOO_LONG");
            }

            var userId = GetCurrentUserId();
            
            // Prevent sending message to self
            if (userId == createMessageDto.ReceiverId)
            {
                return BadRequest("Cannot send message to yourself", "INVALID_RECEIVER");
            }

            var message = await _messageService.SendMessageAsync(userId!, createMessageDto);
            
            // Send real-time notification to receiver
            await _signalRNotificationService.NotifyMessageReceived(message);

            // Update conversation for both users
            var conversationForReceiver = new ConversationDto
            {
                OtherUserId = userId!,
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
            await _signalRNotificationService.NotifyConversationUpdated(conversationForSender, userId!);

            return CreatedAtAction(nameof(GetConversation), new { otherUserId = createMessageDto.ReceiverId }, message);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "send message", createMessageDto);
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
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            if (markReadDto == null)
            {
                return BadRequest("Mark read data is required", "INVALID_MARK_READ_DATA");
            }

            if (string.IsNullOrWhiteSpace(markReadDto.SenderId))
            {
                return BadRequest("Sender ID is required", "INVALID_SENDER_ID");
            }

            var userId = GetCurrentUserId();
            var markedMessages = await _messageService.MarkMessagesAsReadAsync(userId!, markReadDto.SenderId);
            
            // Notify sender that their messages were read
            var readAt = DateTime.UtcNow.ToString("O");
            // Send notification for each marked message
            foreach (var messageId in markedMessages)
            {
                await _signalRNotificationService.NotifyMessageRead(messageId, readAt, markReadDto.SenderId);
            }

            return Ok(new { message = "Messages marked as read", markedCount = markedMessages.Count() });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "mark messages as read", markReadDto);
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
            var authResult = ValidateAuthentication();
            if (authResult is not OkResult)
            {
                return authResult;
            }

            var userId = GetCurrentUserId();
            var count = await _messageService.GetUnreadMessageCountAsync(userId!);
            return Ok(new { unreadCount = count });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "get unread count");
        }
    }
}

public class MarkMessagesReadDto
{
    [Required]
    [StringLength(450, MinimumLength = 1)]
    public string SenderId { get; set; } = string.Empty;
}
