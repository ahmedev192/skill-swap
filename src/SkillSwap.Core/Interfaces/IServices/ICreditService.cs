using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces.Services;

public interface ICreditService
{
    Task<decimal> GetUserCreditBalanceAsync(string userId);
    Task<decimal> GetUserAvailableBalanceAsync(string userId);
    Task<decimal> GetUserPendingSpentAsync(string userId);
    Task<bool> UpdateUserCreditBalanceAsync(string userId, decimal amount);
    Task<bool> HoldCreditsAsync(string userId, decimal amount, int sessionId, string description);
    Task<bool> TransferCreditsAsync(string fromUserId, string toUserId, decimal amount, int sessionId, string description);
    Task<bool> RefundCreditsAsync(string userId, decimal amount, int sessionId, string description);
    Task<IEnumerable<CreditTransactionDto>> GetUserTransactionHistoryAsync(string userId);
    Task<IEnumerable<CreditTransactionDto>> GetTransactionsBySessionAsync(int sessionId);
    Task<bool> AddBonusCreditsAsync(string userId, decimal amount, string description);
    Task<bool> AdjustCreditsAsync(string userId, decimal amount, string description);
    
    // New methods for enhanced credit functionality
    Task<CreditTransactionDto?> GetTransactionByIdAsync(int transactionId);
    Task<CreditTransactionDto> TransferCreditsAsync(string fromUserId, string toUserId, decimal amount, string description);
    Task<CreditTransactionDto> AddCreditsAsync(string userId, decimal amount, string description);
    Task<CreditTransactionDto> DeductCreditsAsync(string userId, decimal amount, string description);
    Task<IEnumerable<CreditTransactionDto>> GetPendingTransactionsAsync(string userId);
    Task<bool> CancelTransactionAsync(int transactionId, string userId);
}
