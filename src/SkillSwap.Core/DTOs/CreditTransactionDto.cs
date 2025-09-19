using SkillSwap.Core.Entities;

namespace SkillSwap.Core.DTOs;

public class CreditTransactionDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? FromUserId { get; set; }
    public string? ToUserId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? Description { get; set; }
    public int? SessionId { get; set; }
    public int? RelatedTransactionId { get; set; }
    public TransactionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? Notes { get; set; }
    public UserDto User { get; set; } = null!;
    public SessionDto? Session { get; set; }
}
