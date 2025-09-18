using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class MatchingService : IMatchingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MatchingService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserSkillDto>> FindMatchesAsync(string userId)
    {
        // Get user's requested skills
        var userRequestedSkills = await _unitOfWork.UserSkills.FindAsync(us => 
            us.UserId == userId && us.Type == SkillType.Requested && us.IsAvailable);

        var matches = new List<UserSkillDto>();

        foreach (var requestedSkill in userRequestedSkills)
        {
            // Find offered skills that match the requested skill
            var offeredSkills = await _unitOfWork.UserSkills.FindAsync(us => 
                us.SkillId == requestedSkill.SkillId && 
                us.Type == SkillType.Offered && 
                us.IsAvailable &&
                us.UserId != userId);

            matches.AddRange(_mapper.Map<IEnumerable<UserSkillDto>>(offeredSkills));
        }

        return matches.DistinctBy(m => m.Id);
    }

    public async Task<IEnumerable<UserSkillDto>> FindOfferedSkillsForRequestAsync(int requestedSkillId)
    {
        var requestedSkill = await _unitOfWork.UserSkills.GetByIdAsync(requestedSkillId);
        if (requestedSkill == null || requestedSkill.Type != SkillType.Requested)
        {
            return Enumerable.Empty<UserSkillDto>();
        }

        var offeredSkills = await _unitOfWork.UserSkills.FindAsync(us => 
            us.SkillId == requestedSkill.SkillId && 
            us.Type == SkillType.Offered && 
            us.IsAvailable &&
            us.UserId != requestedSkill.UserId);

        return _mapper.Map<IEnumerable<UserSkillDto>>(offeredSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> FindRequestedSkillsForOfferAsync(int offeredSkillId)
    {
        var offeredSkill = await _unitOfWork.UserSkills.GetByIdAsync(offeredSkillId);
        if (offeredSkill == null || offeredSkill.Type != SkillType.Offered)
        {
            return Enumerable.Empty<UserSkillDto>();
        }

        var requestedSkills = await _unitOfWork.UserSkills.FindAsync(us => 
            us.SkillId == offeredSkill.SkillId && 
            us.Type == SkillType.Requested && 
            us.IsAvailable &&
            us.UserId != offeredSkill.UserId);

        return _mapper.Map<IEnumerable<UserSkillDto>>(requestedSkills);
    }

    public async Task<IEnumerable<UserSkillDto>> GetRecommendedSkillsAsync(string userId)
    {
        // Get user's completed sessions to understand their interests
        var userSessions = await _unitOfWork.Sessions.FindAsync(s => 
            (s.TeacherId == userId || s.StudentId == userId) && 
            s.Status == SessionStatus.Completed);

        var skillIds = userSessions.Select(s => s.UserSkill.SkillId).Distinct();

        // Find similar skills based on category
        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => 
            us.UserId == userId && us.Type == SkillType.Requested);

        var userCategories = userSkills
            .Where(us => us.Skill != null && us.Skill.Category != null)
            .Select(us => us.Skill.Category)
            .Distinct()
            .ToList();

        var recommendedSkills = await _unitOfWork.UserSkills.FindAsync(us => 
            us.Type == SkillType.Offered && 
            us.IsAvailable &&
            us.UserId != userId &&
            userCategories.Contains(us.Skill.Category));

        return _mapper.Map<IEnumerable<UserSkillDto>>(recommendedSkills.Take(10));
    }

    public async Task<IEnumerable<UserDto>> GetRecommendedUsersAsync(string userId)
    {
        // Get users who have similar skills or are in the same location
        var currentUser = await _unitOfWork.Users.GetByIdAsync(userId);
        if (currentUser == null)
        {
            return Enumerable.Empty<UserDto>();
        }

        var userSkills = await _unitOfWork.UserSkills.FindAsync(us => us.UserId == userId);
        var userSkillIds = userSkills.Select(us => us.SkillId).Distinct();

        // Find users with similar skills
        var similarUsers = await _unitOfWork.UserSkills.FindAsync(us => 
            us.UserId != userId && 
            userSkillIds.Contains(us.SkillId));

        var recommendedUserIds = similarUsers
            .GroupBy(us => us.UserId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key);

        var recommendedUsers = new List<UserDto>();
        foreach (var recommendedUserId in recommendedUserIds)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(recommendedUserId);
            if (user != null)
            {
                recommendedUsers.Add(_mapper.Map<UserDto>(user));
            }
        }

        return recommendedUsers;
    }
}
