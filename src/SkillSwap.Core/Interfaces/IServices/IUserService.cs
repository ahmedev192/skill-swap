using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IUserService
{
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateUserAsync(string id, UpdateUserDto updateUserDto);
    Task<bool> DeleteUserAsync(string id);
    Task<bool> VerifyEmailAsync(string userId, string token);
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<bool> ResetPasswordAsync(string email);
    Task<bool> ConfirmPasswordResetAsync(string userId, string token, string newPassword);
    Task<decimal> GetUserCreditBalanceAsync(string userId);
    Task<bool> UpdateUserCreditBalanceAsync(string userId, decimal amount);
    Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm, string? location = null);
    Task<bool> UpdateLastActiveAsync(string userId);
    
    // Referral system methods
    Task<string> GenerateReferralCodeAsync(string userId);
    Task<ReferralResult> UseReferralCodeAsync(string userId, string referralCode);
    Task<object> GetReferralStatsAsync(string userId);
    Task<UserDto?> ValidateReferralCodeAsync(string referralCode);
    
    // Settings methods
    Task<bool> UpdateNotificationSettingsAsync(string userId, object settings);
    Task<bool> UpdatePrivacySettingsAsync(string userId, object settings);
    
    // Avatar methods
    Task<string> GetUserAvatarUrlAsync(string userId);
    Task<bool> UpdateUserAvatarAsync(string userId, UpdateAvatarDto updateAvatarDto);
    Task<string> GenerateRandomAvatarForUserAsync(string userId);
}

public class ReferralResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal CreditsEarned { get; set; }
}
