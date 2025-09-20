using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthController(IAuthService authService, IUserService userService, ILogger<AuthController> logger) : base(logger)
    {
        _authService = authService;
        _userService = userService;
    }

    /// <summary>
    /// Validate referral code during registration
    /// </summary>
    [HttpPost("validate-referral-code")]
    public async Task<ActionResult<object>> ValidateReferralCode([FromBody] ValidateReferralCodeDto dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.ReferralCode))
            {
                return BadRequest(new { valid = false, message = "Referral code is required" });
            }

            // Check if referral code exists and is valid
            var referrer = await _userService.ValidateReferralCodeAsync(dto.ReferralCode);
            if (referrer != null)
            {
                return Ok(new { 
                    valid = true, 
                    message = "Valid referral code! You'll receive bonus credits after registration.",
                    referrerName = $"{referrer.FirstName} {referrer.LastName}"
                });
            }
            else
            {
                return BadRequest(new { 
                    valid = false, 
                    message = "Invalid referral code. Please check and try again." 
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating referral code");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            if (createUserDto == null)
            {
                return BadRequest("Invalid registration data", "INVALID_REQUEST_DATA");
            }

            // Model validation is handled automatically by ASP.NET Core
            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var result = await _authService.RegisterAsync(createUserDto);
            _logger.LogInformation("User registered successfully: {Email}", createUserDto.Email);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed: {Message}", ex.Message);
            return BadRequest(ex.Message, "REGISTRATION_FAILED", new { email = createUserDto?.Email });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "user registration", new { email = createUserDto?.Email });
        }
    }

    /// <summary>
    /// Login user
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            if (loginDto == null)
            {
                return BadRequest("Invalid login data", "INVALID_REQUEST_DATA");
            }

            // Model validation is handled automatically by ASP.NET Core
            if (!ModelState.IsValid)
            {
                var validationErrors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );
                return ValidationError("Validation failed", validationErrors, "VALIDATION_ERROR");
            }

            var result = await _authService.LoginAsync(loginDto);
            _logger.LogInformation("User logged in successfully: {Email}", loginDto.Email);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed for {Email}: {Message}", loginDto?.Email, ex.Message);
            return Unauthorized("Invalid email or password", "INVALID_CREDENTIALS", new { email = loginDto?.Email });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "user login", new { email = loginDto?.Email });
        }
    }

    /// <summary>
    /// Refresh JWT token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            if (refreshTokenDto == null || string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
            {
                return BadRequest("Refresh token is required", "INVALID_REFRESH_TOKEN");
            }

            var result = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);
            _logger.LogInformation("Token refreshed successfully");
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
            return Unauthorized("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
        }
        catch (Exception ex)
        {
            return HandleException(ex, "token refresh");
        }
    }

    /// <summary>
    /// Logout user
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            if (refreshTokenDto == null || string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
            {
                return BadRequest("Refresh token is required", "INVALID_REFRESH_TOKEN");
            }

            await _authService.LogoutAsync(refreshTokenDto.RefreshToken);
            _logger.LogInformation("User logged out successfully");
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "user logout");
        }
    }

    /// <summary>
    /// Verify email address
    /// </summary>
    [HttpPost("verify-email")]
    public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        try
        {
            if (verifyEmailDto == null || string.IsNullOrEmpty(verifyEmailDto.UserId) || string.IsNullOrEmpty(verifyEmailDto.Token))
            {
                return BadRequest("User ID and token are required", "INVALID_VERIFICATION_DATA");
            }

            var result = await _authService.VerifyEmailAsync(verifyEmailDto.UserId, verifyEmailDto.Token);
            if (result)
            {
                _logger.LogInformation("Email verified successfully for user: {UserId}", verifyEmailDto.UserId);
                return Ok(new { message = "Email verified successfully" });
            }
            return BadRequest("Invalid verification token", "INVALID_VERIFICATION_TOKEN", new { userId = verifyEmailDto.UserId });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "email verification", new { userId = verifyEmailDto?.UserId });
        }
    }

    /// <summary>
    /// Request password reset
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            if (forgotPasswordDto == null || string.IsNullOrEmpty(forgotPasswordDto.Email))
            {
                return BadRequest("Email is required", "INVALID_EMAIL");
            }

            if (!new EmailAddressAttribute().IsValid(forgotPasswordDto.Email))
            {
                return BadRequest("Invalid email format", "INVALID_EMAIL_FORMAT");
            }

            var result = await _authService.ResetPasswordAsync(forgotPasswordDto.Email);
            if (result)
            {
                _logger.LogInformation("Password reset email sent to: {Email}", forgotPasswordDto.Email);
                return Ok(new { message = "Password reset email sent" });
            }
            return BadRequest("User not found", "USER_NOT_FOUND", new { email = forgotPasswordDto.Email });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "password reset request", new { email = forgotPasswordDto?.Email });
        }
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        try
        {
            if (resetPasswordDto == null || string.IsNullOrEmpty(resetPasswordDto.UserId) || 
                string.IsNullOrEmpty(resetPasswordDto.Token) || string.IsNullOrEmpty(resetPasswordDto.NewPassword))
            {
                return BadRequest("User ID, token, and new password are required", "INVALID_RESET_DATA");
            }

            if (resetPasswordDto.NewPassword.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long", "INVALID_PASSWORD_LENGTH");
            }

            var result = await _authService.ConfirmPasswordResetAsync(resetPasswordDto.UserId, resetPasswordDto.Token, resetPasswordDto.NewPassword);
            if (result)
            {
                _logger.LogInformation("Password reset successfully for user: {UserId}", resetPasswordDto.UserId);
                return Ok(new { message = "Password reset successfully" });
            }
            return BadRequest("Invalid reset token", "INVALID_RESET_TOKEN", new { userId = resetPasswordDto.UserId });
        }
        catch (Exception ex)
        {
            return HandleException(ex, "password reset", new { userId = resetPasswordDto?.UserId });
        }
    }
}

public class RefreshTokenDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}

public class VerifyEmailDto
{
    [Required(ErrorMessage = "User ID is required")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Token is required")]
    public string Token { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required(ErrorMessage = "User ID is required")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Token is required")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string NewPassword { get; set; } = string.Empty;
}
