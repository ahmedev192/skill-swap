using Microsoft.EntityFrameworkCore.Storage;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Infrastructure.Data;

namespace SkillSwap.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly SkillSwapDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(SkillSwapDbContext context)
    {
        _context = context;
        Users = new Repository<User>(_context);
        Skills = new Repository<Skill>(_context);
        UserSkills = new Repository<UserSkill>(_context);
        Sessions = new Repository<Session>(_context);
        CreditTransactions = new Repository<CreditTransaction>(_context);
        Reviews = new Repository<Review>(_context);
        Messages = new Repository<Message>(_context);
        Notifications = new Repository<Notification>(_context);
        UserAvailabilities = new Repository<UserAvailability>(_context);
        Endorsements = new Repository<Endorsement>(_context);
        Badges = new Repository<Badge>(_context);
        UserBadges = new Repository<UserBadge>(_context);
        GroupEvents = new Repository<GroupEvent>(_context);
        GroupEventParticipants = new Repository<GroupEventParticipant>(_context);
        SessionMessages = new Repository<SessionMessage>(_context);
        AuditLogs = new Repository<AuditLog>(_context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Skill> Skills { get; }
    public IRepository<UserSkill> UserSkills { get; }
    public IRepository<Session> Sessions { get; }
    public IRepository<CreditTransaction> CreditTransactions { get; }
    public IRepository<Review> Reviews { get; }
    public IRepository<Message> Messages { get; }
    public IRepository<Notification> Notifications { get; }
    public IRepository<UserAvailability> UserAvailabilities { get; }
    public IRepository<Endorsement> Endorsements { get; }
    public IRepository<Badge> Badges { get; }
    public IRepository<UserBadge> UserBadges { get; }
    public IRepository<GroupEvent> GroupEvents { get; }
    public IRepository<GroupEventParticipant> GroupEventParticipants { get; }
    public IRepository<SessionMessage> SessionMessages { get; }
    public IRepository<AuditLog> AuditLogs { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
