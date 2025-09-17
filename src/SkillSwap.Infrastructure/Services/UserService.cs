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

    public UserService(UserManager<User> userManager, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var userDto = _mapper.Map<UserDto>(user);
        userDto.CreditBalance = await GetUserCreditBalanceAsync(id);
        userDto.AverageRating = await GetUserAverageRatingAsync(id);
        userDto.TotalReviews = await GetUserTotalReviewsAsync(id);

        return userDto;
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;

        var userDto = _mapper.Map<UserDto>(user);
        userDto.CreditBalance = await GetUserCreditBalanceAsync(user.Id);
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
            userDto.CreditBalance = await GetUserCreditBalanceAsync(user.Id);
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
            userDto.CreditBalance = await GetUserCreditBalanceAsync(user.Id);
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

    private async Task<double> GetUserAverageRatingAsync(string userId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.RevieweeId == userId && r.IsVisible);
        return reviews.Any() ? reviews.Average(r => r.Rating) : 0.0;
    }

    private async Task<int> GetUserTotalReviewsAsync(string userId)
    {
        return await _unitOfWork.Reviews.CountAsync(r => r.RevieweeId == userId && r.IsVisible);
    }
}
