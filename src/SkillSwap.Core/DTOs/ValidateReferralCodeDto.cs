using System.ComponentModel.DataAnnotations;

namespace SkillSwap.Core.DTOs;

public class ValidateReferralCodeDto
{
    [Required]
    [StringLength(20, MinimumLength = 3)]
    public string ReferralCode { get; set; } = string.Empty;
}
