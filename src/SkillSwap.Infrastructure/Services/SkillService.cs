using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class SkillService : ISkillService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SkillService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<SkillDto>> GetAllSkillsAsync()
    {
        var skills = await _unitOfWork.Skills.FindAsync(s => s.IsActive);
        return _mapper.Map<IEnumerable<SkillDto>>(skills);
    }

    public async Task<SkillDto?> GetSkillByIdAsync(int id)
    {
        var skill = await _unitOfWork.Skills.GetByIdAsync(id);
        return skill != null ? _mapper.Map<SkillDto>(skill) : null;
    }

    public async Task<IEnumerable<SkillDto>> GetSkillsByCategoryAsync(string category)
    {
        var skills = await _unitOfWork.Skills.FindAsync(s => s.IsActive && s.Category == category);
        return _mapper.Map<IEnumerable<SkillDto>>(skills);
    }

    public async Task<SkillDto> CreateSkillAsync(CreateSkillDto createSkillDto)
    {
        var skill = _mapper.Map<Skill>(createSkillDto);
        skill.CreatedAt = DateTime.UtcNow;
        skill.IsActive = true;

        await _unitOfWork.Skills.AddAsync(skill);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SkillDto>(skill);
    }

    public async Task<SkillDto> UpdateSkillAsync(int id, UpdateSkillDto updateSkillDto)
    {
        var skill = await _unitOfWork.Skills.GetByIdAsync(id);
        if (skill == null)
        {
            throw new ArgumentException("Skill not found");
        }

        _mapper.Map(updateSkillDto, skill);
        await _unitOfWork.Skills.UpdateAsync(skill);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SkillDto>(skill);
    }

    public async Task<bool> DeleteSkillAsync(int id)
    {
        var skill = await _unitOfWork.Skills.GetByIdAsync(id);
        if (skill == null) return false;

        skill.IsActive = false;
        await _unitOfWork.Skills.UpdateAsync(skill);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<UserSkillDto>> GetUserSkillsAsync(string userId)
    {
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId, us => us.Skill, us => us.User);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<UserSkillDto?> GetUserSkillByIdAsync(int userSkillId)
    {
        var userSkill = await _unitOfWork.UserSkills.GetByIdAsync(userSkillId, us => us.Skill, us => us.User);
        return userSkill != null ? _mapper.Map<UserSkillDto>(userSkill) : null;
    }

    public async Task<IEnumerable<UserSkillDto>> GetOfferedSkillsAsync(string userId)
    {
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId && us.Type == SkillType.Offered, us => us.Skill, us => us.User);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> GetRequestedSkillsAsync(string userId)
    {
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId && us.Type == SkillType.Requested, us => us.Skill, us => us.User);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> GetAllOfferedSkillsAsync(string? excludeUserId = null)
    {
        System.Linq.Expressions.Expression<Func<UserSkill, bool>> query;
        
        if (!string.IsNullOrEmpty(excludeUserId))
        {
            query = us => us.Type == SkillType.Offered && us.IsAvailable && us.UserId != excludeUserId;
        }
        else
        {
            query = us => us.Type == SkillType.Offered && us.IsAvailable;
        }
        
        var userSkills = await _unitOfWork.UserSkills.FindAsync(query, us => us.Skill, us => us.User);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<UserSkillDto> CreateUserSkillAsync(string userId, CreateUserSkillDto createUserSkillDto)
    {
        // Debug: Log the data before mapping
        Console.WriteLine($"Creating UserSkill: UserId={userId}, SkillId={createUserSkillDto.SkillId}, Type={createUserSkillDto.Type}, Level={createUserSkillDto.Level}, CreditsPerHour={createUserSkillDto.CreditsPerHour}");
        
        var userSkill = _mapper.Map<UserSkill>(createUserSkillDto);
        userSkill.UserId = userId;
        userSkill.CreatedAt = DateTime.UtcNow;
        userSkill.IsAvailable = true;

        // Debug: Log the mapped entity
        Console.WriteLine($"Mapped UserSkill: UserId={userSkill.UserId}, SkillId={userSkill.SkillId}, Type={userSkill.Type}, Level={userSkill.Level}, CreditsPerHour={userSkill.CreditsPerHour}");

        await _unitOfWork.UserSkills.AddAsync(userSkill);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserSkillDto>(userSkill);
    }

    public async Task<UserSkillDto> UpdateUserSkillAsync(int userSkillId, UpdateUserSkillDto updateUserSkillDto)
    {
        var userSkill = await _unitOfWork.UserSkills.GetByIdAsync(userSkillId);
        if (userSkill == null)
        {
            throw new ArgumentException("User skill not found");
        }

        _mapper.Map(updateUserSkillDto, userSkill);
        userSkill.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserSkills.UpdateAsync(userSkill);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserSkillDto>(userSkill);
    }

    public async Task<bool> DeleteUserSkillAsync(int userSkillId)
    {
        var userSkill = await _unitOfWork.UserSkills.GetByIdAsync(userSkillId);
        if (userSkill == null) return false;

        await _unitOfWork.UserSkills.DeleteAsync(userSkill);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<UserSkillDto>> SearchSkillsAsync(string? searchTerm = null, string? category = null, string? location = null, string? level = null, string? type = null)
    {
        // Start with all available offered skills
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.IsAvailable && us.Type == SkillType.Offered, us => us.Skill, us => us.User);

        // Apply search term filter if provided
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            userSkills = userSkills.Where(us => 
                us.Skill.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
                (us.Skill.Description != null && us.Skill.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)) ||
                (us.Description != null && us.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
        }

        // Apply category filter if provided
        if (!string.IsNullOrEmpty(category) && category != "all")
        {
            userSkills = userSkills.Where(us => us.Skill.Category == category);
        }

        // Apply location filter if provided
        if (!string.IsNullOrEmpty(location))
        {
            userSkills = userSkills.Where(us => us.User.Location != null && us.User.Location.Contains(location, StringComparison.OrdinalIgnoreCase));
        }

        // Apply level filter if provided
        if (!string.IsNullOrEmpty(level) && level != "all")
        {
            var levelValue = level.ToLower() switch
            {
                "beginner" => SkillLevel.Beginner,
                "intermediate" => SkillLevel.Intermediate,
                "expert" => SkillLevel.Expert,
                _ => (SkillLevel)(-1)
            };
            
            if (levelValue != (SkillLevel)(-1))
            {
                userSkills = userSkills.Where(us => us.Level == levelValue);
            }
        }

        // Apply type filter if provided
        if (!string.IsNullOrEmpty(type) && type != "all")
        {
            var typeValue = type.ToLower() switch
            {
                "offering" => SkillType.Offered,
                "requested" => SkillType.Requested,
                _ => (SkillType)(-1)
            };
            
            if (typeValue != (SkillType)(-1))
            {
                userSkills = userSkills.Where(us => us.Type == typeValue);
            }
        }

        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }
}
