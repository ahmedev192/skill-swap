using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class CreditService : ICreditService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreditService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<decimal> GetUserCreditBalanceAsync(string userId)
    {
        var transactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.UserId == userId && ct.Status == TransactionStatus.Completed);

        return transactions.Sum(t => t.Type == TransactionType.Earned || t.Type == TransactionType.Bonus || t.Type == TransactionType.Transfer 
            ? t.Amount 
            : -t.Amount);
    }

    public async Task<bool> UpdateUserCreditBalanceAsync(string userId, decimal amount)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        var newBalance = currentBalance + amount;

        if (newBalance < 0)
        {
            return false; // Insufficient credits
        }

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = amount > 0 ? TransactionType.Adjustment : TransactionType.Adjustment,
            Amount = Math.Abs(amount),
            BalanceAfter = newBalance,
            Description = "Admin adjustment",
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> HoldCreditsAsync(string userId, decimal amount, int sessionId, string description)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        if (currentBalance < amount)
        {
            return false; // Insufficient credits
        }

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Spent,
            Amount = amount,
            BalanceAfter = currentBalance - amount,
            Description = description,
            SessionId = sessionId,
            Status = TransactionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> TransferCreditsAsync(string fromUserId, string toUserId, decimal amount, int sessionId, string description)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Complete the pending transaction for the student
            var pendingTransaction = await _unitOfWork.CreditTransactions
                .FirstOrDefaultAsync(ct => ct.UserId == fromUserId && ct.SessionId == sessionId && ct.Status == TransactionStatus.Pending);

            if (pendingTransaction != null)
            {
                pendingTransaction.Status = TransactionStatus.Completed;
                pendingTransaction.ProcessedAt = DateTime.UtcNow;
                await _unitOfWork.CreditTransactions.UpdateAsync(pendingTransaction);
            }

            // Create transaction for the teacher
            var teacherBalance = await GetUserCreditBalanceAsync(toUserId);
            var teacherTransaction = new CreditTransaction
            {
                UserId = toUserId,
                Type = TransactionType.Earned,
                Amount = amount,
                BalanceAfter = teacherBalance + amount,
                Description = description,
                SessionId = sessionId,
                Status = TransactionStatus.Completed,
                ProcessedAt = DateTime.UtcNow,
                RelatedTransactionId = pendingTransaction?.Id
            };

            await _unitOfWork.CreditTransactions.AddAsync(teacherTransaction);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<bool> RefundCreditsAsync(string userId, decimal amount, int sessionId, string description)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Cancel the pending transaction
            var pendingTransaction = await _unitOfWork.CreditTransactions
                .FirstOrDefaultAsync(ct => ct.UserId == userId && ct.SessionId == sessionId && ct.Status == TransactionStatus.Pending);

            if (pendingTransaction != null)
            {
                pendingTransaction.Status = TransactionStatus.Cancelled;
                await _unitOfWork.CreditTransactions.UpdateAsync(pendingTransaction);
            }

            // Create refund transaction
            var currentBalance = await GetUserCreditBalanceAsync(userId);
            var refundTransaction = new CreditTransaction
            {
                UserId = userId,
                Type = TransactionType.Refund,
                Amount = amount,
                BalanceAfter = currentBalance + amount,
                Description = description,
                SessionId = sessionId,
                Status = TransactionStatus.Completed,
                ProcessedAt = DateTime.UtcNow,
                RelatedTransactionId = pendingTransaction?.Id
            };

            await _unitOfWork.CreditTransactions.AddAsync(refundTransaction);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<IEnumerable<CreditTransactionDto>> GetUserTransactionHistoryAsync(string userId)
    {
        var transactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.UserId == userId);

        return _mapper.Map<IEnumerable<CreditTransactionDto>>(transactions.OrderByDescending(t => t.CreatedAt));
    }

    public async Task<IEnumerable<CreditTransactionDto>> GetTransactionsBySessionAsync(int sessionId)
    {
        var transactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.SessionId == sessionId);

        return _mapper.Map<IEnumerable<CreditTransactionDto>>(transactions.OrderBy(t => t.CreatedAt));
    }

    public async Task<bool> AddBonusCreditsAsync(string userId, decimal amount, string description)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        var newBalance = currentBalance + amount;

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Bonus,
            Amount = amount,
            BalanceAfter = newBalance,
            Description = description,
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AdjustCreditsAsync(string userId, decimal amount, string description)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        var newBalance = currentBalance + amount;

        if (newBalance < 0)
        {
            return false; // Insufficient credits
        }

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Adjustment,
            Amount = Math.Abs(amount),
            BalanceAfter = newBalance,
            Description = description,
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
