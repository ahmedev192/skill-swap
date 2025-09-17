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
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> GetOfferedSkillsAsync(string userId)
    {
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId && us.Type == SkillType.Offered);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> GetRequestedSkillsAsync(string userId)
    {
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId && us.Type == SkillType.Requested);
        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }

    public async Task<UserSkillDto> CreateUserSkillAsync(string userId, CreateUserSkillDto createUserSkillDto)
    {
        var userSkill = _mapper.Map<UserSkill>(createUserSkillDto);
        userSkill.UserId = userId;
        userSkill.CreatedAt = DateTime.UtcNow;
        userSkill.IsAvailable = true;

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

    public async Task<IEnumerable<UserSkillDto>> SearchSkillsAsync(string searchTerm, string? category = null, string? location = null)
    {
        var query = _unitOfWork.UserSkills.FindAsync(us => 
            us.IsAvailable && 
            (us.Skill.Name.Contains(searchTerm) || 
             us.Skill.Description!.Contains(searchTerm) ||
             us.Description!.Contains(searchTerm)));

        var userSkills = await query;

        if (!string.IsNullOrEmpty(category))
        {
            userSkills = userSkills.Where(us => us.Skill.Category == category);
        }

        if (!string.IsNullOrEmpty(location))
        {
            userSkills = userSkills.Where(us => us.User.Location != null && us.User.Location.Contains(location));
        }

        return _mapper.Map<IEnumerable<UserSkillDto>>(userSkills);
    }
}
