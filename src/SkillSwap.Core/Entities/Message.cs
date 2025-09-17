using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class Message
{
    public int Id { get; set; }

    [Required]
    public string SenderId { get; set; } = string.Empty;

    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    public bool IsRead { get; set; } = false;

    public int? SessionId { get; set; }

    public MessageType Type { get; set; } = MessageType.Text;

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    // Navigation properties
    public virtual User Sender { get; set; } = null!;
    public virtual User Receiver { get; set; } = null!;
    public virtual Session? Session { get; set; }
}

public enum MessageType
{
    Text = 1,
    Image = 2,
    File = 3,
    System = 4
}
