using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.Entities;

public class User : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public bool IsEmailVerified { get; set; } = false;

    public bool IsIdVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastActiveAt { get; set; }

    public bool IsActive { get; set; } = true;

    public string? ProfileImageUrl { get; set; }

    public string? TimeZone { get; set; }

    public string? PreferredLanguage { get; set; }

    // Navigation properties
    public virtual ICollection<UserSkill> OfferedSkills { get; set; } = new List<UserSkill>();
    public virtual ICollection<UserSkill> RequestedSkills { get; set; } = new List<UserSkill>();
    public virtual ICollection<Session> TeachingSessions { get; set; } = new List<Session>();
    public virtual ICollection<Session> LearningSessions { get; set; } = new List<Session>();
    public virtual ICollection<CreditTransaction> CreditTransactions { get; set; } = new List<CreditTransaction>();
    public virtual ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public virtual ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<UserAvailability> Availability { get; set; } = new List<UserAvailability>();
    public virtual ICollection<Endorsement> EndorsementsGiven { get; set; } = new List<Endorsement>();
    public virtual ICollection<Endorsement> EndorsementsReceived { get; set; } = new List<Endorsement>();
    public virtual ICollection<Badge> Badges { get; set; } = new List<Badge>();
    public virtual ICollection<GroupEvent> GroupEvents { get; set; } = new List<GroupEvent>();
    public virtual ICollection<GroupEventParticipant> GroupEventParticipants { get; set; } = new List<GroupEventParticipant>();

    // JWT Refresh Token properties
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Referral system properties
    public string? ReferralCode { get; set; }
    public string? ReferrerId { get; set; }
    public bool UsedReferralCode { get; set; } = false;
}
