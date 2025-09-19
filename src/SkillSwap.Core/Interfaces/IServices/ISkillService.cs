using SkillSwap.Core.DTOs;

namespace SkillSwap.Core.Interfaces.Services;

public interface ISkillService
{
    Task<IEnumerable<SkillDto>> GetAllSkillsAsync();
    Task<SkillDto?> GetSkillByIdAsync(int id);
    Task<IEnumerable<SkillDto>> GetSkillsByCategoryAsync(string category);
    Task<SkillDto> CreateSkillAsync(CreateSkillDto createSkillDto);
    Task<SkillDto> UpdateSkillAsync(int id, UpdateSkillDto updateSkillDto);
    Task<bool> DeleteSkillAsync(int id);
    Task<IEnumerable<UserSkillDto>> GetUserSkillsAsync(string userId);
    Task<UserSkillDto?> GetUserSkillByIdAsync(int userSkillId);
    Task<IEnumerable<UserSkillDto>> GetOfferedSkillsAsync(string userId);
    Task<IEnumerable<UserSkillDto>> GetRequestedSkillsAsync(string userId);
    Task<IEnumerable<UserSkillDto>> GetAllOfferedSkillsAsync(string? excludeUserId = null);
    Task<UserSkillDto> CreateUserSkillAsync(string userId, CreateUserSkillDto createUserSkillDto);
    Task<UserSkillDto> UpdateUserSkillAsync(int userSkillId, UpdateUserSkillDto updateUserSkillDto);
    Task<bool> DeleteUserSkillAsync(int userSkillId);
    Task<IEnumerable<UserSkillDto>> SearchSkillsAsync(string searchTerm, string? category = null, string? location = null);
}
