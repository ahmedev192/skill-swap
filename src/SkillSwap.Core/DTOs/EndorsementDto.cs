namespace SkillSwap.Core.DTOs;

public class EndorsementDto
{
    public int Id { get; set; }
    public string EndorserId { get; set; } = string.Empty;
    public string EndorseeId { get; set; } = string.Empty;
    public int SkillId { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsVerified { get; set; }
    public UserDto Endorser { get; set; } = null!;
    public UserDto Endorsee { get; set; } = null!;
    public SkillDto Skill { get; set; } = null!;
}

public class CreateEndorsementDto
{
    public string EndorseeId { get; set; } = string.Empty;
    public int SkillId { get; set; }
    public string? Comment { get; set; }
}
