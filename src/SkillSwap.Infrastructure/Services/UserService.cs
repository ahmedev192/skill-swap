using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICreditService _creditService;

    public UserService(UserManager<User> userManager, IUnitOfWork unitOfWork, IMapper mapper, ICreditService creditService)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _creditService = creditService;
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var userDto = _mapper.Map<UserDto>(user);
        userDto.CreditBalance = await _creditService.GetUserAvailableBalanceAsync(id);
        userDto.AverageRating = await GetUserAverageRatingAsync(id);
        userDto.TotalReviews = await GetUserTotalReviewsAsync(id);

        return userDto;
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;

        var userDto = _mapper.Map<UserDto>(user);
        userDto.CreditBalance = await _creditService.GetUserAvailableBalanceAsync(user.Id);
        userDto.AverageRating = await GetUserAverageRatingAsync(user.Id);
        userDto.TotalReviews = await GetUserTotalReviewsAsync(user.Id);

        return userDto;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userManager.Users.Where(u => u.IsActive).ToListAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var userDto = _mapper.Map<UserDto>(user);
            userDto.CreditBalance = await _creditService.GetUserAvailableBalanceAsync(user.Id);
            userDto.AverageRating = await GetUserAverageRatingAsync(user.Id);
            userDto.TotalReviews = await GetUserTotalReviewsAsync(user.Id);
            userDtos.Add(userDto);
        }

        return userDtos;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        var user = new User
        {
            UserName = createUserDto.Email,
            Email = createUserDto.Email,
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            Bio = createUserDto.Bio,
            Location = createUserDto.Location,
            DateOfBirth = createUserDto.DateOfBirth,
            TimeZone = createUserDto.TimeZone,
            PreferredLanguage = createUserDto.PreferredLanguage,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, createUserDto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateUserAsync(string id, UpdateUserDto updateUserDto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        if (!string.IsNullOrEmpty(updateUserDto.FirstName))
            user.FirstName = updateUserDto.FirstName;
        
        if (!string.IsNullOrEmpty(updateUserDto.LastName))
            user.LastName = updateUserDto.LastName;
        
        if (updateUserDto.Bio != null)
            user.Bio = updateUserDto.Bio;
        
        if (updateUserDto.Location != null)
            user.Location = updateUserDto.Location;
        
        if (updateUserDto.DateOfBirth.HasValue)
            user.DateOfBirth = updateUserDto.DateOfBirth;
        
        if (updateUserDto.ProfileImageUrl != null)
            user.ProfileImageUrl = updateUserDto.ProfileImageUrl;
        
        if (updateUserDto.TimeZone != null)
            user.TimeZone = updateUserDto.TimeZone;
        
        if (updateUserDto.PreferredLanguage != null)
            user.PreferredLanguage = updateUserDto.PreferredLanguage;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"User update failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        user.IsActive = false;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> VerifyEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            user.IsEmailVerified = true;
            await _userManager.UpdateAsync(user);
        }

        return result.Succeeded;
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return result.Succeeded;
    }

    public async Task<bool> ResetPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // In a real implementation, you would send this token via email
        return true;
    }

    public async Task<bool> ConfirmPasswordResetAsync(string userId, string token, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }

    public async Task<decimal> GetUserCreditBalanceAsync(string userId)
    {
        return await _creditService.GetUserCreditBalanceAsync(userId);
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

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm, string? location = null)
    {
        var query = _userManager.Users.Where(u => u.IsActive);

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(u => 
                u.FirstName.Contains(searchTerm) || 
                u.LastName.Contains(searchTerm) || 
                u.Email!.Contains(searchTerm) ||
                (u.Bio != null && u.Bio.Contains(searchTerm)));
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(u => u.Location != null && u.Location.Contains(location));
        }

        var users = await query.ToListAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var userDto = _mapper.Map<UserDto>(user);
            userDto.CreditBalance = await _creditService.GetUserAvailableBalanceAsync(user.Id);
            userDto.AverageRating = await GetUserAverageRatingAsync(user.Id);
            userDto.TotalReviews = await GetUserTotalReviewsAsync(user.Id);
            userDtos.Add(userDto);
        }

        return userDtos;
    }

    public async Task<bool> UpdateLastActiveAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.LastActiveAt = DateTime.UtcNow;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<string> GenerateReferralCodeAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        // If user already has a referral code, return it
        if (!string.IsNullOrEmpty(user.ReferralCode))
        {
            return user.ReferralCode;
        }

        // Generate a unique referral code based on user ID and timestamp
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var referralCode = $"REF{userId.Substring(0, 4).ToUpper()}{timestamp.ToString().Substring(6)}";
        
        // Ensure the referral code is unique
        var existingUser = await _userManager.Users.FirstOrDefaultAsync(u => u.ReferralCode == referralCode);
        while (existingUser != null)
        {
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            referralCode = $"REF{userId.Substring(0, 4).ToUpper()}{timestamp.ToString().Substring(6)}";
            existingUser = await _userManager.Users.FirstOrDefaultAsync(u => u.ReferralCode == referralCode);
        }
        
        // Store the referral code in user's data
        user.ReferralCode = referralCode;
        await _userManager.UpdateAsync(user);

        return referralCode;
    }

    public async Task<ReferralResult> UseReferralCodeAsync(string userId, string referralCode)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new ReferralResult { Success = false, Message = "User not found" };
        }

        // Check if user has already used a referral code
        if (user.UsedReferralCode)
        {
            return new ReferralResult { Success = false, Message = "You have already used a referral code" };
        }

        // Find the user who owns this referral code
        var referrer = await _userManager.Users.FirstOrDefaultAsync(u => u.ReferralCode == referralCode);
        if (referrer == null)
        {
            return new ReferralResult { Success = false, Message = "Invalid referral code" };
        }

        if (referrer.Id == userId)
        {
            return new ReferralResult { Success = false, Message = "You cannot use your own referral code" };
        }

        // Mark that this user has used a referral code
        user.UsedReferralCode = true;
        user.ReferrerId = referrer.Id;
        await _userManager.UpdateAsync(user);

        // Award credits to both users
        const decimal referralCredits = 15m;
        
        // Get current balances to calculate new balances
        var newUserBalance = await _creditService.GetUserCreditBalanceAsync(userId);
        var referrerBalance = await _creditService.GetUserCreditBalanceAsync(referrer.Id);
        
        // Award credits to the new user
        var newUserTransaction = new CreditTransaction
        {
            UserId = userId,
            Type = TransactionType.Bonus,
            Amount = referralCredits,
            BalanceAfter = newUserBalance + referralCredits,
            Description = "Referral bonus - Welcome!",
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        // Award credits to the referrer
        var referrerTransaction = new CreditTransaction
        {
            UserId = referrer.Id,
            Type = TransactionType.Bonus,
            Amount = referralCredits,
            BalanceAfter = referrerBalance + referralCredits,
            Description = "Referral bonus - Friend joined!",
            Status = TransactionStatus.Completed,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.CreditTransactions.AddAsync(newUserTransaction);
        await _unitOfWork.CreditTransactions.AddAsync(referrerTransaction);

        // Create notification for the referrer
        var notification = new Notification
        {
            UserId = referrer.Id,
            Type = NotificationType.Referral,
            Title = "New Referral!",
            Message = $"{user.FirstName} {user.LastName} joined using your referral code! You earned {referralCredits} credits.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return new ReferralResult 
        { 
            Success = true, 
            Message = "Referral code applied successfully! You earned 15 credits.",
            CreditsEarned = referralCredits
        };
    }

    public async Task<object> GetReferralStatsAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        // Count how many users this user has referred
        var referredUsersCount = await _userManager.Users.CountAsync(u => u.ReferrerId == userId);
        
        // Calculate total credits earned from referrals
        var referralTransactions = await _unitOfWork.CreditTransactions
            .FindAsync(ct => ct.UserId == userId && 
                           ct.Type == TransactionType.Bonus && 
                           ct.Description.Contains("Referral bonus"));
        
        var totalCreditsEarned = referralTransactions.Sum(t => t.Amount);

        return new
        {
            referralCode = user.ReferralCode,
            referredUsersCount,
            totalCreditsEarned,
            hasUsedReferral = user.UsedReferralCode
        };
    }

    public async Task<UserDto?> ValidateReferralCodeAsync(string referralCode)
    {
        // Find the user who owns this referral code
        var referrer = await _userManager.Users.FirstOrDefaultAsync(u => u.ReferralCode == referralCode);
        if (referrer == null)
        {
            return null;
        }

        // Return basic user info (without sensitive data)
        return new UserDto
        {
            Id = referrer.Id,
            FirstName = referrer.FirstName,
            LastName = referrer.LastName,
            Email = referrer.Email,
            Bio = referrer.Bio,
            Location = referrer.Location,
            DateOfBirth = referrer.DateOfBirth,
            TimeZone = referrer.TimeZone,
            PreferredLanguage = referrer.PreferredLanguage,
            IsActive = referrer.IsActive,
            CreatedAt = referrer.CreatedAt,
            LastActiveAt = referrer.LastActiveAt
        };
    }

    private async Task<double> GetUserAverageRatingAsync(string userId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.RevieweeId == userId && r.IsVisible);
        return reviews.Any() ? reviews.Average(r => r.Rating) : 0.0;
    }

    private async Task<int> GetUserTotalReviewsAsync(string userId)
    {
        return await _unitOfWork.Reviews.CountAsync(r => r.RevieweeId == userId && r.IsVisible);
    }

    public async Task<bool> UpdateNotificationSettingsAsync(string userId, object settings)
    {
        // For now, this is a placeholder implementation
        // In a real application, you would store these settings in a separate table
        // or as JSON in the user profile
        await Task.Delay(1); // Simulate async operation
        return true;
    }

    public async Task<bool> UpdatePrivacySettingsAsync(string userId, object settings)
    {
        // For now, this is a placeholder implementation
        // In a real application, you would store these settings in a separate table
        // or as JSON in the user profile
        await Task.Delay(1); // Simulate async operation
        return true;
    }
}
