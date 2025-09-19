using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.Entities;

namespace SkillSwap.Infrastructure.Data;

public class SkillSwapDbContext : IdentityDbContext<User>
{
    public SkillSwapDbContext(DbContextOptions<SkillSwapDbContext> options) : base(options)
    {
    }

    public DbSet<Skill> Skills { get; set; }
    public DbSet<UserSkill> UserSkills { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<CreditTransaction> CreditTransactions { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<UserAvailability> UserAvailabilities { get; set; }
    public DbSet<Endorsement> Endorsements { get; set; }
    public DbSet<Badge> Badges { get; set; }
    public DbSet<UserBadge> UserBadges { get; set; }
    public DbSet<GroupEvent> GroupEvents { get; set; }
    public DbSet<GroupEventParticipant> GroupEventParticipants { get; set; }
    public DbSet<SessionMessage> SessionMessages { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<UserConnection> UserConnections { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User entity
        builder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure UserSkill entity
        builder.Entity<UserSkill>(entity =>
        {
            entity.HasOne(us => us.User)
                .WithMany(u => u.OfferedSkills)
                .HasForeignKey(us => us.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(us => us.Skill)
                .WithMany(s => s.UserSkills)
                .HasForeignKey(us => us.SkillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(us => new { us.UserId, us.SkillId, us.Type }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Session entity
        builder.Entity<Session>(entity =>
        {
            entity.HasOne(s => s.Teacher)
                .WithMany(u => u.TeachingSessions)
                .HasForeignKey(s => s.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.Student)
                .WithMany(u => u.LearningSessions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.UserSkill)
                .WithMany()
                .HasForeignKey(s => s.UserSkillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure CreditTransaction entity
        builder.Entity<CreditTransaction>(entity =>
        {
            entity.HasOne(ct => ct.User)
                .WithMany(u => u.CreditTransactions)
                .HasForeignKey(ct => ct.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ct => ct.Session)
                .WithMany()
                .HasForeignKey(ct => ct.SessionId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Review entity
        builder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Reviewee)
                .WithMany(u => u.ReviewsReceived)
                .HasForeignKey(r => r.RevieweeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Session)
                .WithMany()
                .HasForeignKey(r => r.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(r => new { r.ReviewerId, r.SessionId }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Message entity
        builder.Entity<Message>(entity =>
        {
            entity.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Session)
                .WithMany()
                .HasForeignKey(m => m.SessionId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.SentAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Notification entity
        builder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure UserAvailability entity
        builder.Entity<UserAvailability>(entity =>
        {
            entity.HasOne(ua => ua.User)
                .WithMany(u => u.Availability)
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(ua => new { ua.UserId, ua.DayOfWeek }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Endorsement entity
        builder.Entity<Endorsement>(entity =>
        {
            entity.HasOne(e => e.Endorser)
                .WithMany(u => u.EndorsementsGiven)
                .HasForeignKey(e => e.EndorserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Endorsee)
                .WithMany(u => u.EndorsementsReceived)
                .HasForeignKey(e => e.EndorseeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Skill)
                .WithMany()
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.EndorserId, e.EndorseeId, e.SkillId }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Badge entity
        builder.Entity<Badge>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure UserBadge entity
        builder.Entity<UserBadge>(entity =>
        {
            entity.HasOne(ub => ub.User)
                .WithMany()
                .HasForeignKey(ub => ub.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ub => ub.Badge)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(ub => new { ub.UserId, ub.BadgeId }).IsUnique();
            entity.Property(e => e.EarnedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure GroupEvent entity
        builder.Entity<GroupEvent>(entity =>
        {
            entity.HasOne(ge => ge.Organizer)
                .WithMany(u => u.GroupEvents)
                .HasForeignKey(ge => ge.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ge => ge.Skill)
                .WithMany()
                .HasForeignKey(ge => ge.SkillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure GroupEventParticipant entity
        builder.Entity<GroupEventParticipant>(entity =>
        {
            entity.HasOne(gep => gep.GroupEvent)
                .WithMany(ge => ge.Participants)
                .HasForeignKey(gep => gep.GroupEventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(gep => gep.User)
                .WithMany(u => u.GroupEventParticipants)
                .HasForeignKey(gep => gep.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(gep => new { gep.GroupEventId, gep.UserId }).IsUnique();
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure SessionMessage entity
        builder.Entity<SessionMessage>(entity =>
        {
            entity.HasOne(sm => sm.Session)
                .WithMany(s => s.Messages)
                .HasForeignKey(sm => sm.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sm => sm.Sender)
                .WithMany()
                .HasForeignKey(sm => sm.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.SentAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure AuditLog entity
        builder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(al => al.User)
                .WithMany()
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure UserConnection entity
        builder.Entity<UserConnection>(entity =>
        {
            entity.HasOne(uc => uc.Requester)
                .WithMany(u => u.ConnectionRequestsSent)
                .HasForeignKey(uc => uc.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(uc => uc.Receiver)
                .WithMany(u => u.ConnectionRequestsReceived)
                .HasForeignKey(uc => uc.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(uc => new { uc.RequesterId, uc.ReceiverId }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Seed data
        SeedData(builder);
    }

    private static void SeedData(ModelBuilder builder)
    {
        // Seed skills
        var skills = new List<Skill>
        {
            new() { Id = 1, Name = "C# Programming", Category = "Programming", Description = "Object-oriented programming with C#" },
            new() { Id = 2, Name = "JavaScript", Category = "Programming", Description = "Web development with JavaScript" },
            new() { Id = 3, Name = "Python", Category = "Programming", Description = "Python programming language" },
            new() { Id = 4, Name = "Spanish", Category = "Languages", Description = "Spanish language learning" },
            new() { Id = 5, Name = "French", Category = "Languages", Description = "French language learning" },
            new() { Id = 6, Name = "Cooking", Category = "Lifestyle", Description = "Culinary skills and techniques" },
            new() { Id = 7, Name = "Photography", Category = "Arts", Description = "Digital and film photography" },
            new() { Id = 8, Name = "Guitar", Category = "Music", Description = "Guitar playing and music theory" },
            new() { Id = 9, Name = "Yoga", Category = "Fitness", Description = "Yoga practice and meditation" },
            new() { Id = 10, Name = "Data Analysis", Category = "Analytics", Description = "Data analysis and visualization" }
        };

        builder.Entity<Skill>().HasData(skills);

        // Seed badges
        var badges = new List<Badge>
        {
            new() { Id = 1, Name = "First Session", Description = "Completed your first teaching session", Type = BadgeType.TeachingHours, RequiredValue = 1 },
            new() { Id = 2, Name = "Teaching Pro", Description = "Taught for 10 hours", Type = BadgeType.TeachingHours, RequiredValue = 10 },
            new() { Id = 3, Name = "Learning Enthusiast", Description = "Learned for 5 hours", Type = BadgeType.LearningHours, RequiredValue = 5 },
            new() { Id = 4, Name = "Community Helper", Description = "Helped 5 different people", Type = BadgeType.CommunityHelper, RequiredValue = 5 },
            new() { Id = 5, Name = "Skill Master", Description = "Offered 3 different skills", Type = BadgeType.SkillsOffered, RequiredValue = 3 }
        };

        builder.Entity<Badge>().HasData(badges);
    }
}
