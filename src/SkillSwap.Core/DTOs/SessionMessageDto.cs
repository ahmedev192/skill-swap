using SkillSwap.Core.Entities;

namespace SkillSwap.Core.DTOs;

public class SessionMessageDto
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public MessageType Type { get; set; }
    public string? AttachmentUrl { get; set; }
    public SessionDto Session { get; set; } = null!;
    public UserDto Sender { get; set; } = null!;
}

public class CreateSessionMessageDto
{
    public int SessionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; } = MessageType.Text;
    public string? AttachmentUrl { get; set; }
}
