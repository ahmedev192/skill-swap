using SkillSwap.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsRead { get; set; }
    public int? SessionId { get; set; }
    public MessageType Type { get; set; }
    public string? AttachmentUrl { get; set; }
    public UserDto Sender { get; set; } = null!;
    public UserDto Receiver { get; set; } = null!;
    public SessionDto? Session { get; set; }
}

public class CreateMessageDto
{
    [Required]
    [StringLength(450, MinimumLength = 1)]
    public string ReceiverId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
    
    public int? SessionId { get; set; }
    
    public MessageType Type { get; set; } = MessageType.Text;
    
    [StringLength(500)]
    public string? AttachmentUrl { get; set; }
}

public class ConversationDto
{
    public string OtherUserId { get; set; } = string.Empty;
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserProfileImage { get; set; }
    public string? OtherUserCustomAvatar { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
}
