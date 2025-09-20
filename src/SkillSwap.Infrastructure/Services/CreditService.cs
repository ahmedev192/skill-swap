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

        return transactions.Sum(t => t.Type == TransactionType.Earned || t.Type == TransactionType.Bonus || t.Type == TransactionType.Transfer || t.Type == TransactionType.Refund
            ? t.Amount 
            : -t.Amount);
    }

    public async Task<decimal> GetUserAvailableBalanceAsync(string userId)
    {
        var totalBalance = await GetUserCreditBalanceAsync(userId);
        var pendingSpent = await GetUserPendingSpentAsync(userId);
        return totalBalance - pendingSpent;
    }

    public async Task<decimal> GetUserPendingSpentAsync(string userId)
    {
        var pendingTransactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.UserId == userId && 
                           ct.Status == TransactionStatus.Pending && 
                           ct.Type == TransactionType.Spent);
        
        return pendingTransactions.Sum(t => t.Amount);
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
        var availableBalance = await GetUserAvailableBalanceAsync(userId);
        if (availableBalance < amount)
        {
            return false; // Insufficient credits
        }

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Spent,
            Amount = amount,
            BalanceAfter = availableBalance - amount, // This will be updated when transaction completes
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
        try
        {
            Console.WriteLine($"TransferCreditsAsync: fromUserId={fromUserId}, toUserId={toUserId}, amount={amount}, sessionId={sessionId}");
            
            // Complete the pending transaction for the student
            var pendingTransaction = await _unitOfWork.CreditTransactions
                .FirstOrDefaultAsync(ct => ct.UserId == fromUserId && ct.SessionId == sessionId && ct.Status == TransactionStatus.Pending);

            Console.WriteLine($"Found pending transaction: {pendingTransaction != null}");

            if (pendingTransaction != null)
            {
                Console.WriteLine($"Pending transaction: Amount={pendingTransaction.Amount}, Status={pendingTransaction.Status}");
                pendingTransaction.Status = TransactionStatus.Completed;
                pendingTransaction.ProcessedAt = DateTime.UtcNow;
                // Update the balance after to reflect the actual balance after completion
                var studentNewBalance = await GetUserCreditBalanceAsync(fromUserId);
                pendingTransaction.BalanceAfter = studentNewBalance;
                await _unitOfWork.CreditTransactions.UpdateAsync(pendingTransaction);
                Console.WriteLine($"Updated student transaction: NewBalance={studentNewBalance}");
            }

            // Now create transaction for the teacher
            var teacherBalance = await GetUserCreditBalanceAsync(toUserId);
            Console.WriteLine($"Teacher current balance: {teacherBalance}");
            
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

            Console.WriteLine($"Creating teacher transaction: Amount={amount}, NewBalance={teacherBalance + amount}");
            await _unitOfWork.CreditTransactions.AddAsync(teacherTransaction);
            
            // Save all changes in a single transaction (EF Core handles this automatically)
            await _unitOfWork.SaveChangesAsync();

            Console.WriteLine($"Credit transfer completed successfully");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Credit transfer failed: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> RefundCreditsAsync(string userId, decimal amount, int sessionId, string description)
    {
        try
        {
            // Cancel the pending transaction
            var pendingTransaction = await _unitOfWork.CreditTransactions
                .FirstOrDefaultAsync(ct => ct.UserId == userId && ct.SessionId == sessionId && ct.Status == TransactionStatus.Pending);

            if (pendingTransaction != null)
            {
                pendingTransaction.Status = TransactionStatus.Cancelled;
                pendingTransaction.ProcessedAt = DateTime.UtcNow;
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

            return true;
        }
        catch
        {
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

    public async Task<CreditTransactionDto?> GetTransactionByIdAsync(int transactionId)
    {
        var transaction = await _unitOfWork.CreditTransactions.GetByIdAsync(transactionId);
        return transaction != null ? _mapper.Map<CreditTransactionDto>(transaction) : null;
    }

    public async Task<CreditTransactionDto> TransferCreditsAsync(string fromUserId, string toUserId, decimal amount, string description)
    {
        try
        {
            var fromUserBalance = await GetUserCreditBalanceAsync(fromUserId);
            if (fromUserBalance < amount)
            {
                throw new InvalidOperationException("Insufficient credits for transfer");
            }

            var toUserBalance = await GetUserCreditBalanceAsync(toUserId);

            // Create debit transaction for sender
            var debitTransaction = new CreditTransaction
            {
                UserId = fromUserId,
                Type = TransactionType.Transfer,
                Amount = amount,
                BalanceAfter = fromUserBalance - amount,
                Description = $"Transfer to user: {description}",
                Status = TransactionStatus.Completed,
                ProcessedAt = DateTime.UtcNow,
                ToUserId = toUserId
            };

            // Create credit transaction for receiver
            var creditTransaction = new CreditTransaction
            {
                UserId = toUserId,
                Type = TransactionType.Transfer,
                Amount = amount,
                BalanceAfter = toUserBalance + amount,
                Description = $"Transfer from user: {description}",
                Status = TransactionStatus.Completed,
                ProcessedAt = DateTime.UtcNow,
                FromUserId = fromUserId
            };

            await _unitOfWork.CreditTransactions.AddAsync(debitTransaction);
            await _unitOfWork.CreditTransactions.AddAsync(creditTransaction);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<CreditTransactionDto>(debitTransaction);
        }
        catch
        {
            throw;
        }
    }

    public async Task<CreditTransactionDto> AddCreditsAsync(string userId, decimal amount, string description)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        var newBalance = currentBalance + amount;

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Adjustment,
            Amount = amount,
            BalanceAfter = newBalance,
            Description = description,
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CreditTransactionDto>(transaction);
    }

    public async Task<CreditTransactionDto> DeductCreditsAsync(string userId, decimal amount, string description)
    {
        var currentBalance = await GetUserCreditBalanceAsync(userId);
        if (currentBalance < amount)
        {
            throw new InvalidOperationException("Insufficient credits for deduction");
        }

        var newBalance = currentBalance - amount;

        var transaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Adjustment,
            Amount = amount,
            BalanceAfter = newBalance,
            Description = description,
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CreditTransactionDto>(transaction);
    }

    public async Task<IEnumerable<CreditTransactionDto>> GetPendingTransactionsAsync(string userId)
    {
        var transactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.UserId == userId && ct.Status == TransactionStatus.Pending);

        return _mapper.Map<IEnumerable<CreditTransactionDto>>(transactions.OrderByDescending(t => t.CreatedAt));
    }

    public async Task<bool> CancelTransactionAsync(int transactionId, string userId)
    {
        var transaction = await _unitOfWork.CreditTransactions.GetByIdAsync(transactionId);
        if (transaction == null || transaction.UserId != userId)
        {
            return false;
        }

        if (transaction.Status != TransactionStatus.Pending)
        {
            return false; // Can only cancel pending transactions
        }

        transaction.Status = TransactionStatus.Cancelled;
        await _unitOfWork.CreditTransactions.UpdateAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
