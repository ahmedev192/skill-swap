using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICreditService _creditService;

    public SessionService(IUnitOfWork unitOfWork, IMapper mapper, ICreditService creditService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _creditService = creditService;
    }

    public async Task<IEnumerable<SessionDto>> GetUserSessionsAsync(string userId)
    {
        var sessions = await _unitOfWork.Sessions.FindAsync(s => s.TeacherId == userId || s.StudentId == userId, 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        return _mapper.Map<IEnumerable<SessionDto>>(sessions);
    }

    public async Task<IEnumerable<SessionDto>> GetTeachingSessionsAsync(string userId)
    {
        var sessions = await _unitOfWork.Sessions.FindAsync(s => s.TeacherId == userId, 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        return _mapper.Map<IEnumerable<SessionDto>>(sessions);
    }

    public async Task<IEnumerable<SessionDto>> GetLearningSessionsAsync(string userId)
    {
        var sessions = await _unitOfWork.Sessions.FindAsync(s => s.StudentId == userId, 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        return _mapper.Map<IEnumerable<SessionDto>>(sessions);
    }

    public async Task<SessionDto?> GetSessionByIdAsync(int sessionId)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId, 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        return session != null ? _mapper.Map<SessionDto>(session) : null;
    }

    public async Task<SessionDto> CreateSessionAsync(string studentId, CreateSessionDto createSessionDto)
    {
        // Get the user skill to calculate credits
        var userSkill = await _unitOfWork.UserSkills.GetByIdAsync(createSessionDto.UserSkillId, us => us.Skill, us => us.User);
        if (userSkill == null)
        {
            throw new ArgumentException("User skill not found");
        }

        if (userSkill.Type != SkillType.Offered)
        {
            throw new InvalidOperationException("Can only book sessions for offered skills");
        }

        if (userSkill.UserId == studentId)
        {
            throw new InvalidOperationException("Cannot book a session with yourself");
        }

        // Validate that the teacherId in the DTO matches the userSkill's owner
        if (!string.IsNullOrEmpty(createSessionDto.TeacherId) && createSessionDto.TeacherId != userSkill.UserId)
        {
            throw new ArgumentException("Teacher ID does not match the skill owner");
        }

        // Calculate session duration and credits
        var duration = createSessionDto.ScheduledEnd - createSessionDto.ScheduledStart;
        var creditsCost = (decimal)duration.TotalHours * userSkill.CreditsPerHour;

        // Check if student has enough credits
        var studentBalance = await _creditService.GetUserCreditBalanceAsync(studentId);
        if (studentBalance < creditsCost)
        {
            throw new InvalidOperationException("Insufficient credits");
        }

        // Create session
        var session = _mapper.Map<Session>(createSessionDto);
        session.StudentId = studentId;
        session.TeacherId = userSkill.UserId;
        session.CreditsCost = creditsCost;
        session.Status = SessionStatus.Pending;
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;
        session.TeacherConfirmed = false;
        session.StudentConfirmed = false;
        session.ConfirmedAt = null;
        session.ActualStart = null;
        session.ActualEnd = null;
        session.CancelledAt = null;
        session.CancellationReason = null;

        await _unitOfWork.Sessions.AddAsync(session);
        await _unitOfWork.SaveChangesAsync();
        
        // Log the created session for debugging
        Console.WriteLine($"Created session: ID={session.Id}, TeacherId={session.TeacherId}, StudentId={session.StudentId}, Status={session.Status}");

        // Hold credits in escrow
        await _creditService.HoldCreditsAsync(studentId, creditsCost, session.Id, "Session booking");

        return _mapper.Map<SessionDto>(session);
    }

    public async Task<SessionDto> UpdateSessionAsync(int sessionId, UpdateSessionDto updateSessionDto)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            throw new ArgumentException("Session not found");
        }

        if (session.Status != SessionStatus.Pending)
        {
            throw new InvalidOperationException("Can only update pending sessions");
        }

        _mapper.Map(updateSessionDto, session);
        session.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Sessions.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SessionDto>(session);
    }

    public async Task<bool> CancelSessionAsync(int sessionId, string cancellationReason)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            return false;
        }

        if (session.Status == SessionStatus.Completed || session.Status == SessionStatus.Cancelled)
        {
            throw new InvalidOperationException("Cannot cancel completed or already cancelled session");
        }

        session.Status = SessionStatus.Cancelled;
        session.CancelledAt = DateTime.UtcNow;
        session.CancellationReason = cancellationReason;
        session.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Sessions.UpdateAsync(session);

        // Refund credits if they were held
        if (session.Status == SessionStatus.Pending || session.Status == SessionStatus.Confirmed)
        {
            await _creditService.RefundCreditsAsync(session.StudentId, session.CreditsCost, session.Id, "Session cancelled");
        }

        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ConfirmSessionAsync(int sessionId, string userId, ConfirmSessionDto confirmSessionDto)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            return false;
        }

        if (session.Status != SessionStatus.Pending)
        {
            throw new InvalidOperationException("Can only confirm pending sessions");
        }

        if (userId == session.TeacherId)
        {
            session.TeacherConfirmed = confirmSessionDto.Confirmed;
        }
        else if (userId == session.StudentId)
        {
            session.StudentConfirmed = confirmSessionDto.Confirmed;
        }
        else
        {
            throw new UnauthorizedAccessException("Not authorized to confirm this session");
        }

        if (session.TeacherConfirmed && session.StudentConfirmed)
        {
            session.Status = SessionStatus.Confirmed;
            session.ConfirmedAt = DateTime.UtcNow;
        }

        session.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Sessions.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CompleteSessionAsync(int sessionId, string userId)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            Console.WriteLine($"Session {sessionId} not found");
            return false;
        }

        Console.WriteLine($"Attempting to complete session {sessionId}: Status={session.Status}, TeacherId={session.TeacherId}, StudentId={session.StudentId}, UserId={userId}");

        if (session.Status != SessionStatus.Confirmed)
        {
            Console.WriteLine($"Cannot complete session {sessionId}: Status is {session.Status}, but must be Confirmed");
            throw new InvalidOperationException($"Can only complete confirmed sessions. Current status: {session.Status}");
        }

        if (userId != session.TeacherId && userId != session.StudentId)
        {
            Console.WriteLine($"User {userId} not authorized to complete session {sessionId}");
            throw new UnauthorizedAccessException("Not authorized to complete this session");
        }

        session.Status = SessionStatus.Completed;
        session.ActualEnd = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Sessions.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        // Transfer credits from escrow to teacher (separate operation to avoid transaction issues)
        try
        {
            await _creditService.TransferCreditsAsync(session.StudentId, session.TeacherId, session.CreditsCost, session.Id, "Session completed");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Credit transfer failed for session {sessionId}: {ex.Message}");
            // Don't fail the session completion if credit transfer fails
        }

        Console.WriteLine($"Session {sessionId} completed successfully");
        return true;
    }

    public async Task<IEnumerable<SessionDto>> GetSessionsByStatusAsync(SessionStatus status)
    {
        var sessions = await _unitOfWork.Sessions.FindAsync(s => s.Status == status, 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        return _mapper.Map<IEnumerable<SessionDto>>(sessions);
    }

    public async Task<IEnumerable<SessionDto>> GetUpcomingSessionsAsync(string userId)
    {
        var sessions = await _unitOfWork.Sessions.FindAsync(s => 
            (s.TeacherId == userId || s.StudentId == userId) && 
            s.ScheduledStart > DateTime.UtcNow && 
            (s.Status == SessionStatus.Confirmed || s.Status == SessionStatus.Pending), 
            s => s.UserSkill, s => s.UserSkill.Skill, s => s.UserSkill.User, s => s.Teacher, s => s.Student);
        
        return _mapper.Map<IEnumerable<SessionDto>>(sessions);
    }

    public async Task<bool> RescheduleSessionAsync(int sessionId, DateTime newStart, DateTime newEnd)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            return false;
        }

        if (session.Status != SessionStatus.Pending && session.Status != SessionStatus.Confirmed)
        {
            throw new InvalidOperationException("Can only reschedule pending or confirmed sessions");
        }

        session.ScheduledStart = newStart;
        session.ScheduledEnd = newEnd;
        session.UpdatedAt = DateTime.UtcNow;

        // Recalculate credits if needed
        var userSkill = await _unitOfWork.UserSkills.GetByIdAsync(session.UserSkillId, us => us.Skill, us => us.User);
        if (userSkill != null)
        {
            var duration = newEnd - newStart;
            var newCreditsCost = (decimal)duration.TotalHours * userSkill.CreditsPerHour;
            
            if (newCreditsCost != session.CreditsCost)
            {
                // Handle credit adjustment
                var difference = newCreditsCost - session.CreditsCost;
                session.CreditsCost = newCreditsCost;
                
                if (difference > 0)
                {
                    // Need more credits
                    await _creditService.HoldCreditsAsync(session.StudentId, difference, sessionId, "Session reschedule - additional credits");
                }
                else if (difference < 0)
                {
                    // Refund excess credits
                    await _creditService.RefundCreditsAsync(session.StudentId, Math.Abs(difference), sessionId, "Session reschedule - credit refund");
                }
            }
        }

        await _unitOfWork.Sessions.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CanUserModifySessionAsync(int sessionId, string userId)
    {
        var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId);
        if (session == null)
        {
            return false;
        }

        // User can modify session if they are the teacher or student
        return session.TeacherId == userId || session.StudentId == userId;
    }
}
