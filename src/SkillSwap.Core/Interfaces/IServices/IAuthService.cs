using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(CreateUserDto createUserDto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string token);
    Task<bool> ValidateTokenAsync(string token);
    Task<string> GenerateEmailVerificationTokenAsync(string userId);
    Task<string> GeneratePasswordResetTokenAsync(string userId);
    Task<bool> VerifyEmailAsync(string userId, string token);
    Task<bool> ResetPasswordAsync(string email);
    Task<bool> ConfirmPasswordResetAsync(string userId, string token, string newPassword);
}
