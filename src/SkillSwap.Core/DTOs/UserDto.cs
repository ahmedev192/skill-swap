namespace SkillSwap.Core.DTOs;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsIdVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
    public decimal CreditBalance { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}

public class CreateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
}

public class UpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}
