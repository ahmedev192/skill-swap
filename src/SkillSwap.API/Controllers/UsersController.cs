using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using SkillSwap.Infrastructure.Hubs;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICreditService _creditService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ICreditService creditService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _creditService = creditService;
        _logger = logger;
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get all users (with pagination)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            var paginatedUsers = users.Skip((page - 1) * pageSize).Take(pageSize);
            
            return Ok(new
            {
                data = paginatedUsers,
                page,
                pageSize,
                totalCount = users.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateCurrentUser([FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.UpdateUserAsync(userId, updateUserDto);
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Update failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update user by ID (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            var user = await _userService.UpdateUserAsync(id, updateUserDto);
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Update failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Delete user (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(id);
            if (result)
            {
                return Ok(new { message = "User deleted successfully" });
            }
            return NotFound(new { message = "User not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Search users
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm, [FromQuery] string? location = null)
    {
        try
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                return BadRequest(new { message = "Search term is required" });
            }

            var users = await _userService.SearchUsersAsync(searchTerm, location);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user credit balance
    /// </summary>
    [HttpGet("{id}/credits")]
    public async Task<ActionResult<object>> GetUserCredits(string id)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Users can only view their own credits unless they're admin
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var balance = await _userService.GetUserCreditBalanceAsync(id);
            return Ok(new { balance });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user credits for {UserId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user credit transaction history
    /// </summary>
    [HttpGet("{id}/credits/transactions")]
    public async Task<ActionResult<IEnumerable<CreditTransactionDto>>> GetUserCreditTransactions(string id)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Users can only view their own transactions unless they're admin
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var transactions = await _creditService.GetUserTransactionHistoryAsync(id);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting credit transactions for user {UserId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Change password
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _userService.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (result)
            {
                return Ok(new { message = "Password changed successfully" });
            }
            return BadRequest(new { message = "Current password is incorrect" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get transaction details by ID
    /// </summary>
    [HttpGet("credits/transactions/{transactionId}")]
    public async Task<ActionResult<CreditTransactionDto>> GetTransactionById(int transactionId)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            var transaction = await _creditService.GetTransactionByIdAsync(transactionId);
            if (transaction == null)
            {
                return NotFound(new { message = "Transaction not found" });
            }

            // Users can only view their own transactions unless they're admin
            if (transaction.FromUserId != currentUserId && transaction.ToUserId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction {TransactionId}", transactionId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Transfer credits to another user
    /// </summary>
    [HttpPost("credits/transfer")]
    public async Task<ActionResult<CreditTransactionDto>> TransferCredits([FromBody] TransferCreditsDto transferDto)
    {
        try
        {
            var fromUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(fromUserId))
            {
                return Unauthorized();
            }

            var transaction = await _creditService.TransferCreditsAsync(fromUserId, transferDto.ToUserId, transferDto.Amount, transferDto.Description);
            return Ok(transaction);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Transfer failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Transfer failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error transferring credits");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Add credits to user account (Admin only)
    /// </summary>
    [HttpPost("{userId}/credits/add")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CreditTransactionDto>> AddCredits(string userId, [FromBody] AddCreditsDto addCreditsDto)
    {
        try
        {
            var transaction = await _creditService.AddCreditsAsync(userId, addCreditsDto.Amount, addCreditsDto.Description);
            return Ok(transaction);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Add credits failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding credits to user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Deduct credits from user account (Admin only)
    /// </summary>
    [HttpPost("{userId}/credits/deduct")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CreditTransactionDto>> DeductCredits(string userId, [FromBody] DeductCreditsDto deductCreditsDto)
    {
        try
        {
            var transaction = await _creditService.DeductCreditsAsync(userId, deductCreditsDto.Amount, deductCreditsDto.Description);
            return Ok(transaction);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Deduct credits failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Deduct credits failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deducting credits from user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get pending transactions for user
    /// </summary>
    [HttpGet("{userId}/credits/pending")]
    public async Task<ActionResult<IEnumerable<CreditTransactionDto>>> GetPendingTransactions(string userId)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Users can only view their own pending transactions unless they're admin
            if (currentUserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var transactions = await _creditService.GetPendingTransactionsAsync(userId);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending transactions for user {UserId}", userId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Cancel a pending transaction
    /// </summary>
    [HttpPost("credits/transactions/{transactionId}/cancel")]
    public async Task<ActionResult> CancelTransaction(int transactionId)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            var result = await _creditService.CancelTransactionAsync(transactionId, currentUserId);
            if (result)
            {
                return Ok(new { message = "Transaction cancelled successfully" });
            }
            return BadRequest(new { message = "Transaction cannot be cancelled" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Cancel transaction failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling transaction {TransactionId}", transactionId);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Generate referral code for user
    /// </summary>
    [HttpPost("referral/generate")]
    public async Task<ActionResult<object>> GenerateReferralCode()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var referralCode = await _userService.GenerateReferralCodeAsync(userId);
            return Ok(new { referralCode });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating referral code");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Use referral code
    /// </summary>
    [HttpPost("referral/use")]
    public async Task<ActionResult<object>> UseReferralCode([FromBody] UseReferralCodeDto useReferralDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _userService.UseReferralCodeAsync(userId, useReferralDto.ReferralCode);
            if (result.Success)
            {
                return Ok(new { 
                    message = "Referral code applied successfully! You earned 15 credits.",
                    creditsEarned = result.CreditsEarned
                });
            }
            return BadRequest(new { message = result.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error using referral code");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get user's referral statistics
    /// </summary>
    [HttpGet("referral/stats")]
    public async Task<ActionResult<object>> GetReferralStats()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var stats = await _userService.GetReferralStatsAsync(userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting referral stats");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get list of online users
    /// </summary>
    [HttpGet("online")]
    public ActionResult<object> GetOnlineUsers()
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            var onlineUsers = NotificationHub.GetAllOnlineUsers()
                .Where(u => u.UserId != currentUserId) // Exclude current user
                .Select(u => new
                {
                    userId = u.UserId,
                    email = u.Email,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    connectedAt = u.ConnectedAt,
                    lastSeen = u.LastSeen
                })
                .ToList();

            return Ok(new
            {
                onlineUsers,
                count = onlineUsers.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting online users");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update notification settings
    /// </summary>
    [HttpPut("notification-settings")]
    public async Task<ActionResult> UpdateNotificationSettings([FromBody] UpdateNotificationSettingsDto settingsDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _userService.UpdateNotificationSettingsAsync(userId, settingsDto);
            return Ok(new { message = "Notification settings updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating notification settings");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Update privacy settings
    /// </summary>
    [HttpPut("privacy-settings")]
    public async Task<ActionResult> UpdatePrivacySettings([FromBody] UpdatePrivacySettingsDto settingsDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _userService.UpdatePrivacySettingsAsync(userId, settingsDto);
            return Ok(new { message = "Privacy settings updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating privacy settings");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class TransferCreditsDto
{
    public string ToUserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class AddCreditsDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class DeductCreditsDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UseReferralCodeDto
{
    public string ReferralCode { get; set; } = string.Empty;
}

public class UpdateNotificationSettingsDto
{
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool SessionReminders { get; set; } = true;
    public bool MessageNotifications { get; set; } = true;
    public bool ReviewNotifications { get; set; } = true;
    public bool MarketingEmails { get; set; } = false;
}

public class UpdatePrivacySettingsDto
{
    public string ProfileVisibility { get; set; } = "public"; // public, members, private
    public bool ShowEmail { get; set; } = false;
    public bool ShowLocation { get; set; } = true;
    public bool ShowSessions { get; set; } = true;
    public bool AllowMessages { get; set; } = true;
}
