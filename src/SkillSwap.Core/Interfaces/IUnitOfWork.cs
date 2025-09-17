using SkillSwap.Core.Entities;

namespace SkillSwap.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Skill> Skills { get; }
    IRepository<UserSkill> UserSkills { get; }
    IRepository<Session> Sessions { get; }
    IRepository<CreditTransaction> CreditTransactions { get; }
    IRepository<Review> Reviews { get; }
    IRepository<Message> Messages { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<UserAvailability> UserAvailabilities { get; }
    IRepository<Endorsement> Endorsements { get; }
    IRepository<Badge> Badges { get; }
    IRepository<UserBadge> UserBadges { get; }
    IRepository<GroupEvent> GroupEvents { get; }
    IRepository<GroupEventParticipant> GroupEventParticipants { get; }
    IRepository<SessionMessage> SessionMessages { get; }
    IRepository<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
