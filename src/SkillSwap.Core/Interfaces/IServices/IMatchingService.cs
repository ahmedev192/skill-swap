using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface IMatchingService
{
    Task<IEnumerable<UserSkillDto>> FindMatchesAsync(string userId);
    Task<IEnumerable<UserSkillDto>> FindOfferedSkillsForRequestAsync(int requestedSkillId);
    Task<IEnumerable<UserSkillDto>> FindRequestedSkillsForOfferAsync(int offeredSkillId);
    Task<IEnumerable<UserSkillDto>> GetRecommendedSkillsAsync(string userId);
    Task<IEnumerable<UserDto>> GetRecommendedUsersAsync(string userId);
}
