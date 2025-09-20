using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Services;

public interface IAvatarService
{
    string GenerateRandomAvatarUrl(string? seed = null);
    List<AvatarOption> GetAvailableAvatarOptions();
    string GetAvatarUrl(string? seed, string? customUrl = null);
}
