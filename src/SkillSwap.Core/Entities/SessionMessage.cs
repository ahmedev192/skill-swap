using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class SessionMessage
{
    public int Id { get; set; }

    [Required]
    public int SessionId { get; set; }

    [Required]
    public string SenderId { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public MessageType Type { get; set; } = MessageType.Text;

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    // Navigation properties
    public virtual Session Session { get; set; } = null!;
    public virtual User Sender { get; set; } = null!;
}
