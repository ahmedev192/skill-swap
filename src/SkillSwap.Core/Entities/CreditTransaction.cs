using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class CreditTransaction
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public decimal BalanceAfter { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? SessionId { get; set; }

    public int? RelatedTransactionId { get; set; }

    [Required]
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ProcessedAt { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Session? Session { get; set; }
    public virtual CreditTransaction? RelatedTransaction { get; set; }
}

public enum TransactionType
{
    Earned = 1,        // Teaching session
    Spent = 2,         // Learning session
    Refund = 3,        // Cancelled session
    Bonus = 4,         // Welcome bonus, referral, etc.
    Adjustment = 5,    // Admin adjustment
    Transfer = 6       // Direct transfer between users
}

public enum TransactionStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4
}
