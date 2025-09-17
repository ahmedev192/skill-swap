namespace SkillSwap.Core.DTOs;

public class UserAvailabilityDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class CreateUserAvailabilityDto
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class UpdateUserAvailabilityDto
{
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public bool? IsAvailable { get; set; }
}
