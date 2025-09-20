using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace SkillSwap.Infrastructure.Data;

public static class MockDataSeeder
{
    public static async Task SeedMockDataAsync(SkillSwapDbContext context, UserManager<User> userManager, bool forceSeed = false)
    {
        Console.WriteLine("🌱 MockDataSeeder: Starting mock data seeding...");
        
        // Check if data already exists (unless force seeding)
        var existingUsers = await context.Users.AnyAsync();
        Console.WriteLine($"🌱 MockDataSeeder: Existing users found: {existingUsers}");
        
        if (!forceSeed && existingUsers)
        {
            Console.WriteLine("🌱 MockDataSeeder: Data already exists, skipping seeding");
            return; // Data already seeded
        }
        
        Console.WriteLine("🌱 MockDataSeeder: Proceeding with data seeding...");

        // Seed Skills first
        await SeedSkillsAsync(context);
        
        // Seed Users
        var users = await SeedUsersAsync(context, userManager);
        
        // Seed UserSkills
        await SeedUserSkillsAsync(context, users);
        
        // Seed UserAvailability
        await SeedUserAvailabilityAsync(context, users);
        
        // Seed Sessions
        var sessions = await SeedSessionsAsync(context, users);
        
        // Seed CreditTransactions
        await SeedCreditTransactionsAsync(context, users, sessions);
        
        // Seed Reviews
        await SeedReviewsAsync(context, users, sessions);
        
        // Seed Messages
        await SeedMessagesAsync(context, users, sessions);
        
        // Seed Notifications
        await SeedNotificationsAsync(context, users, sessions);
        
        // Seed Endorsements
        await SeedEndorsementsAsync(context, users);
        
        // Seed UserBadges
        await SeedUserBadgesAsync(context, users);
        
        // Seed GroupEvents
        var groupEvents = await SeedGroupEventsAsync(context, users);
        
        // Seed GroupEventParticipants
        await SeedGroupEventParticipantsAsync(context, users, groupEvents);
        
        // Seed UserConnections
        await SeedUserConnectionsAsync(context, users);
        
        // Seed SessionMessages
        await SeedSessionMessagesAsync(context, users, sessions);
        
        // Seed AuditLogs
        await SeedAuditLogsAsync(context, users);
        
        await context.SaveChangesAsync();
    }

    private static async Task SeedSkillsAsync(SkillSwapDbContext context)
    {
        var skills = new List<Skill>
        {
            // Programming & Technology
            new() { Name = "C# Programming", Category = "Programming", SubCategory = "Backend", Description = "Object-oriented programming with C# and .NET framework" },
            new() { Name = "JavaScript", Category = "Programming", SubCategory = "Frontend", Description = "Web development with JavaScript, ES6+, and modern frameworks" },
            new() { Name = "Python", Category = "Programming", SubCategory = "General", Description = "Python programming for data science, web development, and automation" },
            new() { Name = "Java", Category = "Programming", SubCategory = "Backend", Description = "Java programming with Spring framework and enterprise development" },
            new() { Name = "React", Category = "Programming", SubCategory = "Frontend", Description = "React.js for building modern web applications" },
            new() { Name = "Node.js", Category = "Programming", SubCategory = "Backend", Description = "Server-side JavaScript with Node.js and Express" },
            new() { Name = "SQL", Category = "Programming", SubCategory = "Database", Description = "Database design and SQL queries" },
            new() { Name = "Git", Category = "Programming", SubCategory = "Tools", Description = "Version control with Git and GitHub" },
            
            // Languages
            new() { Name = "Spanish", Category = "Languages", SubCategory = "Romance", Description = "Spanish language learning and conversation practice" },
            new() { Name = "French", Category = "Languages", SubCategory = "Romance", Description = "French language learning and cultural exchange" },
            new() { Name = "German", Category = "Languages", SubCategory = "Germanic", Description = "German language learning and grammar" },
            new() { Name = "Japanese", Category = "Languages", SubCategory = "Asian", Description = "Japanese language including Hiragana, Katakana, and Kanji" },
            new() { Name = "Mandarin Chinese", Category = "Languages", SubCategory = "Asian", Description = "Mandarin Chinese language and culture" },
            new() { Name = "English", Category = "Languages", SubCategory = "Germanic", Description = "English as a second language and conversation practice" },
            
            // Arts & Creative
            new() { Name = "Photography", Category = "Arts", SubCategory = "Visual", Description = "Digital and film photography techniques" },
            new() { Name = "Digital Art", Category = "Arts", SubCategory = "Visual", Description = "Digital painting and illustration using Photoshop, Procreate" },
            new() { Name = "Drawing", Category = "Arts", SubCategory = "Visual", Description = "Traditional drawing techniques and sketching" },
            new() { Name = "Graphic Design", Category = "Arts", SubCategory = "Visual", Description = "Logo design, branding, and visual communication" },
            new() { Name = "Video Editing", Category = "Arts", SubCategory = "Media", Description = "Video editing with Adobe Premiere, Final Cut Pro" },
            
            // Music
            new() { Name = "Guitar", Category = "Music", SubCategory = "Instruments", Description = "Acoustic and electric guitar playing" },
            new() { Name = "Piano", Category = "Music", SubCategory = "Instruments", Description = "Piano playing and music theory" },
            new() { Name = "Singing", Category = "Music", SubCategory = "Vocal", Description = "Vocal techniques and performance" },
            new() { Name = "Music Production", Category = "Music", SubCategory = "Technical", Description = "Music production and audio engineering" },
            
            // Fitness & Wellness
            new() { Name = "Yoga", Category = "Fitness", SubCategory = "Mind-Body", Description = "Yoga practice, meditation, and mindfulness" },
            new() { Name = "Weight Training", Category = "Fitness", SubCategory = "Strength", Description = "Strength training and bodybuilding" },
            new() { Name = "Running", Category = "Fitness", SubCategory = "Cardio", Description = "Running techniques and marathon training" },
            new() { Name = "Swimming", Category = "Fitness", SubCategory = "Aquatic", Description = "Swimming techniques and water safety" },
            new() { Name = "Martial Arts", Category = "Fitness", SubCategory = "Combat", Description = "Karate, Taekwondo, and self-defense" },
            
            // Lifestyle & Hobbies
            new() { Name = "Cooking", Category = "Lifestyle", SubCategory = "Culinary", Description = "Cooking techniques and international cuisine" },
            new() { Name = "Baking", Category = "Lifestyle", SubCategory = "Culinary", Description = "Baking bread, pastries, and desserts" },
            new() { Name = "Gardening", Category = "Lifestyle", SubCategory = "Outdoor", Description = "Plant care, vegetable gardening, and landscaping" },
            new() { Name = "Chess", Category = "Lifestyle", SubCategory = "Games", Description = "Chess strategy and tactics" },
            new() { Name = "Knitting", Category = "Lifestyle", SubCategory = "Crafts", Description = "Knitting and crocheting techniques" },
            
            // Business & Professional
            new() { Name = "Public Speaking", Category = "Business", SubCategory = "Communication", Description = "Presentation skills and public speaking confidence" },
            new() { Name = "Project Management", Category = "Business", SubCategory = "Management", Description = "Agile, Scrum, and project coordination" },
            new() { Name = "Digital Marketing", Category = "Business", SubCategory = "Marketing", Description = "Social media marketing and SEO" },
            new() { Name = "Financial Planning", Category = "Business", SubCategory = "Finance", Description = "Personal finance and investment strategies" },
            
            // Analytics & Data
            new() { Name = "Data Analysis", Category = "Analytics", SubCategory = "Statistics", Description = "Data analysis with Excel, R, and Python" },
            new() { Name = "Machine Learning", Category = "Analytics", SubCategory = "AI", Description = "Machine learning algorithms and applications" },
            new() { Name = "Excel", Category = "Analytics", SubCategory = "Tools", Description = "Advanced Excel functions and data visualization" }
        };

        context.Skills.AddRange(skills);
        await context.SaveChangesAsync();
    }

    private static async Task<List<User>> SeedUsersAsync(SkillSwapDbContext context, UserManager<User> userManager)
    {
        var users = new List<User>();
        var userData = new[]
        {
            new { FirstName = "Sarah", LastName = "Johnson", Email = "sarah.johnson@email.com", Bio = "Software engineer with 5+ years experience in full-stack development. Passionate about teaching and helping others learn programming.", Location = "San Francisco, CA", TimeZone = "America/Los_Angeles", ProfileImageUrl = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Michael", LastName = "Chen", Email = "michael.chen@email.com", Bio = "Data scientist and machine learning enthusiast. Love sharing knowledge about AI and data analysis.", Location = "Seattle, WA", TimeZone = "America/Los_Angeles", ProfileImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Emily", LastName = "Rodriguez", Email = "emily.rodriguez@email.com", Bio = "Bilingual teacher and language enthusiast. Native Spanish speaker with experience in language instruction.", Location = "Miami, FL", TimeZone = "America/New_York", ProfileImageUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "David", LastName = "Kim", Email = "david.kim@email.com", Bio = "Professional photographer and digital artist. Specialized in portrait and landscape photography.", Location = "New York, NY", TimeZone = "America/New_York", ProfileImageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Lisa", LastName = "Thompson", Email = "lisa.thompson@email.com", Bio = "Certified yoga instructor and wellness coach. Helping people find balance through movement and mindfulness.", Location = "Portland, OR", TimeZone = "America/Los_Angeles", ProfileImageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "James", LastName = "Wilson", Email = "james.wilson@email.com", Bio = "Guitarist and music producer with 10+ years experience. Teaching guitar, music theory, and production techniques.", Location = "Austin, TX", TimeZone = "America/Chicago", ProfileImageUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Maria", LastName = "Garcia", Email = "maria.garcia@email.com", Bio = "Chef and culinary instructor. Specialized in Mediterranean and Latin American cuisine.", Location = "Los Angeles, CA", TimeZone = "America/Los_Angeles", ProfileImageUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Alex", LastName = "Brown", Email = "alex.brown@email.com", Bio = "Fitness trainer and nutritionist. Certified in personal training and helping people achieve their health goals.", Location = "Denver, CO", TimeZone = "America/Denver", ProfileImageUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Sophie", LastName = "Martinez", Email = "sophie.martinez@email.com", Bio = "Graphic designer and digital artist. Creating beautiful visual experiences and teaching design principles.", Location = "Chicago, IL", TimeZone = "America/Chicago", ProfileImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Ryan", LastName = "Taylor", Email = "ryan.taylor@email.com", Bio = "Business consultant and public speaking coach. Helping professionals improve their communication skills.", Location = "Boston, MA", TimeZone = "America/New_York", ProfileImageUrl = "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Emma", LastName = "Davis", Email = "emma.davis@email.com", Bio = "Language teacher specializing in French and English. Creating engaging learning experiences for all levels.", Location = "Montreal, QC", TimeZone = "America/Montreal", ProfileImageUrl = "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Kevin", LastName = "Lee", Email = "kevin.lee@email.com", Bio = "Software architect and technical mentor. Passionate about clean code and system design.", Location = "Toronto, ON", TimeZone = "America/Toronto", ProfileImageUrl = "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Anna", LastName = "White", Email = "anna.white@email.com", Bio = "Pianist and music educator. Teaching classical and contemporary piano with a focus on technique and expression.", Location = "Vancouver, BC", TimeZone = "America/Vancouver", ProfileImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Carlos", LastName = "Lopez", Email = "carlos.lopez@email.com", Bio = "Chess master and strategy coach. Teaching chess fundamentals and advanced tactics for competitive play.", Location = "Mexico City, MX", TimeZone = "America/Mexico_City", ProfileImageUrl = "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face" },
            new { FirstName = "Rachel", LastName = "Green", Email = "rachel.green@email.com", Bio = "Environmental scientist and gardening expert. Teaching sustainable gardening and plant care techniques.", Location = "Portland, OR", TimeZone = "America/Los_Angeles", ProfileImageUrl = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" }
        };

        foreach (var userInfo in userData)
        {
            var user = new User
            {
                UserName = userInfo.Email,
                Email = userInfo.Email,
                FirstName = userInfo.FirstName,
                LastName = userInfo.LastName,
                Bio = userInfo.Bio,
                Location = userInfo.Location,
                TimeZone = userInfo.TimeZone,
                ProfileImageUrl = userInfo.ProfileImageUrl,
                IsEmailVerified = true,
                IsIdVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 365)),
                LastActiveAt = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 48))
            };

            var result = await userManager.CreateAsync(user, "Password123!");
            if (result.Succeeded)
            {
                users.Add(user);
            }
        }

        return users;
    }

    private static async Task SeedUserSkillsAsync(SkillSwapDbContext context, List<User> users)
    {
        var userSkills = new List<UserSkill>();
        var skills = await context.Skills.ToListAsync();

        foreach (var user in users)
        {
            // Each user offers 2-4 skills
            var offeredSkillsCount = Random.Shared.Next(2, 5);
            var offeredSkills = skills.OrderBy(x => Random.Shared.Next()).Take(offeredSkillsCount);

            foreach (var skill in offeredSkills)
            {
                userSkills.Add(new UserSkill
                {
                    UserId = user.Id,
                    SkillId = skill.Id,
                    Type = SkillType.Offered,
                    Level = (SkillLevel)Random.Shared.Next(1, 4),
                    Description = GetSkillDescription(skill.Name),
                    CreditsPerHour = Random.Shared.Next(15, 50),
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
                });
            }

            // Each user requests 1-3 skills
            var requestedSkillsCount = Random.Shared.Next(1, 4);
            var requestedSkills = skills.Where(s => !offeredSkills.Contains(s))
                                      .OrderBy(x => Random.Shared.Next())
                                      .Take(requestedSkillsCount);

            foreach (var skill in requestedSkills)
            {
                userSkills.Add(new UserSkill
                {
                    UserId = user.Id,
                    SkillId = skill.Id,
                    Type = SkillType.Requested,
                    Level = (SkillLevel)Random.Shared.Next(1, 3), // Usually beginner to intermediate for requests
                    Description = $"Looking to learn {skill.Name.ToLower()}",
                    CreditsPerHour = Random.Shared.Next(20, 40),
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
                });
            }
        }

        context.UserSkills.AddRange(userSkills);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUserAvailabilityAsync(SkillSwapDbContext context, List<User> users)
    {
        var availabilities = new List<UserAvailability>();
        var daysOfWeek = Enum.GetValues<DayOfWeek>();

        foreach (var user in users)
        {
            // Each user has availability for 3-6 days per week
            var availableDays = daysOfWeek.OrderBy(x => Random.Shared.Next()).Take(Random.Shared.Next(3, 7));

            foreach (var day in availableDays)
            {
                var startHour = Random.Shared.Next(8, 18); // 8 AM to 6 PM
                var endHour = startHour + Random.Shared.Next(2, 6); // 2-6 hour blocks

                availabilities.Add(new UserAvailability
                {
                    UserId = user.Id,
                    DayOfWeek = day,
                    StartTime = TimeSpan.FromHours(startHour),
                    EndTime = TimeSpan.FromHours(Math.Min(endHour, 22)), // Max 10 PM
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
                });
            }
        }

        context.UserAvailabilities.AddRange(availabilities);
        await context.SaveChangesAsync();
    }

    private static async Task<List<Session>> SeedSessionsAsync(SkillSwapDbContext context, List<User> users)
    {
        var sessions = new List<Session>();
        var userSkills = await context.UserSkills
            .Where(us => us.Type == SkillType.Offered)
            .Include(us => us.Skill)
            .ToListAsync();

        // Create 20-30 sessions
        var sessionCount = Random.Shared.Next(20, 31);

        for (int i = 0; i < sessionCount; i++)
        {
            var userSkill = userSkills[Random.Shared.Next(userSkills.Count)];
            var teacher = users.First(u => u.Id == userSkill.UserId);
            var student = users.Where(u => u.Id != teacher.Id).OrderBy(x => Random.Shared.Next()).First();

            var startTime = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60));
            var duration = Random.Shared.Next(1, 4); // 1-3 hours
            var endTime = startTime.AddHours(duration);

            var status = GetRandomSessionStatus(startTime);

            sessions.Add(new Session
            {
                TeacherId = teacher.Id,
                StudentId = student.Id,
                UserSkillId = userSkill.Id,
                ScheduledStart = startTime,
                ScheduledEnd = endTime,
                ActualStart = status == SessionStatus.Completed ? startTime.AddMinutes(Random.Shared.Next(-15, 15)) : null,
                ActualEnd = status == SessionStatus.Completed ? endTime.AddMinutes(Random.Shared.Next(-15, 15)) : null,
                CreditsCost = userSkill.CreditsPerHour * duration,
                Status = status,
                Notes = GetSessionNotes(status),
                MeetingLink = status != SessionStatus.Cancelled ? $"https://meet.skillswap.com/session-{i + 1}" : null,
                IsOnline = Random.Shared.NextDouble() > 0.3, // 70% online
                Location = Random.Shared.NextDouble() > 0.7 ? GetRandomLocation() : null,
                CreatedAt = startTime.AddDays(-Random.Shared.Next(1, 7)),
                UpdatedAt = status != SessionStatus.Pending ? DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)) : null,
                CancelledAt = status == SessionStatus.Cancelled ? startTime.AddDays(-Random.Shared.Next(1, 3)) : null,
                CancellationReason = status == SessionStatus.Cancelled ? GetCancellationReason() : null,
                TeacherConfirmed = status != SessionStatus.Pending,
                StudentConfirmed = status != SessionStatus.Pending,
                ConfirmedAt = status != SessionStatus.Pending ? startTime.AddDays(-Random.Shared.Next(1, 5)) : null
            });
        }

        context.Sessions.AddRange(sessions);
        await context.SaveChangesAsync();
        return sessions;
    }

    private static async Task SeedCreditTransactionsAsync(SkillSwapDbContext context, List<User> users, List<Session> sessions)
    {
        var transactions = new List<CreditTransaction>();

        // Initial credit balance for each user (welcome bonus)
        foreach (var user in users)
        {
            transactions.Add(new CreditTransaction
            {
                UserId = user.Id,
                Type = TransactionType.Bonus,
                Amount = 50, // Welcome bonus
                BalanceAfter = 50,
                Description = "Welcome bonus",
                Status = TransactionStatus.Completed,
                CreatedAt = user.CreatedAt,
                ProcessedAt = user.CreatedAt
            });
        }

        // Session-related transactions
        foreach (var session in sessions.Where(s => s.Status == SessionStatus.Completed))
        {
            // Student pays credits
            var studentBalance = transactions.Where(t => t.UserId == session.StudentId).Sum(t => t.Amount) - 
                                transactions.Where(t => t.UserId == session.StudentId && t.Type == TransactionType.Spent).Sum(t => t.Amount);
            
            transactions.Add(new CreditTransaction
            {
                UserId = session.StudentId,
                FromUserId = session.StudentId,
                ToUserId = session.TeacherId,
                Type = TransactionType.Spent,
                Amount = -session.CreditsCost,
                BalanceAfter = studentBalance - session.CreditsCost,
                Description = $"Payment for {session.UserSkill.Skill.Name} session",
                SessionId = session.Id,
                Status = TransactionStatus.Completed,
                CreatedAt = session.ActualStart ?? session.ScheduledStart,
                ProcessedAt = session.ActualStart ?? session.ScheduledStart
            });

            // Teacher earns credits
            var teacherBalance = transactions.Where(t => t.UserId == session.TeacherId).Sum(t => t.Amount) + 
                                transactions.Where(t => t.UserId == session.TeacherId && t.Type == TransactionType.Earned).Sum(t => t.Amount);
            
            transactions.Add(new CreditTransaction
            {
                UserId = session.TeacherId,
                FromUserId = session.StudentId,
                ToUserId = session.TeacherId,
                Type = TransactionType.Earned,
                Amount = session.CreditsCost,
                BalanceAfter = teacherBalance + session.CreditsCost,
                Description = $"Earned from {session.UserSkill.Skill.Name} session",
                SessionId = session.Id,
                Status = TransactionStatus.Completed,
                CreatedAt = session.ActualEnd ?? session.ScheduledEnd,
                ProcessedAt = session.ActualEnd ?? session.ScheduledEnd
            });
        }

        // Refund transactions for cancelled sessions
        foreach (var session in sessions.Where(s => s.Status == SessionStatus.Cancelled && s.CancelledAt.HasValue))
        {
            transactions.Add(new CreditTransaction
            {
                UserId = session.StudentId,
                Type = TransactionType.Refund,
                Amount = session.CreditsCost,
                BalanceAfter = transactions.Where(t => t.UserId == session.StudentId).Sum(t => t.Amount) + session.CreditsCost,
                Description = $"Refund for cancelled {session.UserSkill.Skill.Name} session",
                SessionId = session.Id,
                Status = TransactionStatus.Completed,
                CreatedAt = session.CancelledAt.Value,
                ProcessedAt = session.CancelledAt.Value
            });
        }

        context.CreditTransactions.AddRange(transactions);
        await context.SaveChangesAsync();
    }

    private static async Task SeedReviewsAsync(SkillSwapDbContext context, List<User> users, List<Session> sessions)
    {
        var reviews = new List<Review>();
        var completedSessions = sessions.Where(s => s.Status == SessionStatus.Completed).ToList();

        foreach (var session in completedSessions)
        {
            // Student reviews teacher
            reviews.Add(new Review
            {
                ReviewerId = session.StudentId,
                RevieweeId = session.TeacherId,
                SessionId = session.Id,
                Rating = Random.Shared.Next(3, 6), // 3-5 stars
                Comment = GetReviewComment("student"),
                CreatedAt = (session.ActualEnd ?? session.ScheduledEnd).AddHours(Random.Shared.Next(1, 24)),
                IsVisible = true
            });

            // Teacher reviews student (80% chance)
            if (Random.Shared.NextDouble() > 0.2)
            {
                reviews.Add(new Review
                {
                    ReviewerId = session.TeacherId,
                    RevieweeId = session.StudentId,
                    SessionId = session.Id,
                    Rating = Random.Shared.Next(4, 6), // 4-5 stars (teachers tend to be more generous)
                    Comment = GetReviewComment("teacher"),
                    CreatedAt = (session.ActualEnd ?? session.ScheduledEnd).AddHours(Random.Shared.Next(1, 48)),
                    IsVisible = true
                });
            }
        }

        context.Reviews.AddRange(reviews);
        await context.SaveChangesAsync();
    }

    private static async Task SeedMessagesAsync(SkillSwapDbContext context, List<User> users, List<Session> sessions)
    {
        var messages = new List<Message>();
        var messageTemplates = new[]
        {
            "Hi! I'm interested in learning more about your {skill} sessions. When would be a good time to chat?",
            "Thanks for the great session yesterday! I learned a lot about {skill}.",
            "I have a question about the homework you assigned. Could you clarify the part about {topic}?",
            "Looking forward to our next session! I've been practicing {skill} and have some questions.",
            "Thank you for being such a patient teacher. Your explanations really helped me understand {concept}.",
            "I found some additional resources about {skill} that might be helpful for other students.",
            "Could we schedule an extra session this week? I'd like to focus on {topic}.",
            "The project you suggested is really interesting! I've started working on it and have some progress to show."
        };

        // Create messages between users who have had sessions
        var userPairs = sessions.Select(s => new { Teacher = s.TeacherId, Student = s.StudentId }).Distinct();

        foreach (var pair in userPairs)
        {
            var messageCount = Random.Shared.Next(3, 8);
            var lastMessageTime = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30));

            for (int i = 0; i < messageCount; i++)
            {
                var isFromTeacher = Random.Shared.NextDouble() > 0.5;
                var senderId = isFromTeacher ? pair.Teacher : pair.Student;
                var receiverId = isFromTeacher ? pair.Student : pair.Teacher;

                var template = messageTemplates[Random.Shared.Next(messageTemplates.Length)];
                var content = template.Replace("{skill}", "programming")
                                    .Replace("{topic}", "advanced concepts")
                                    .Replace("{concept}", "the fundamentals");

                messages.Add(new Message
                {
                    SenderId = senderId,
                    ReceiverId = receiverId,
                    Content = content,
                    SentAt = lastMessageTime.AddHours(-Random.Shared.Next(1, 72)),
                    ReadAt = Random.Shared.NextDouble() > 0.3 ? DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 24)) : null,
                    IsRead = Random.Shared.NextDouble() > 0.3,
                    Type = MessageType.Text
                });

                lastMessageTime = lastMessageTime.AddHours(-Random.Shared.Next(1, 72));
            }
        }

        context.Messages.AddRange(messages);
        await context.SaveChangesAsync();
    }

    private static async Task SeedNotificationsAsync(SkillSwapDbContext context, List<User> users, List<Session> sessions)
    {
        var notifications = new List<Notification>();

        foreach (var user in users)
        {
            // Welcome notification
            notifications.Add(new Notification
            {
                UserId = user.Id,
                Title = "Welcome to SkillSwap!",
                Message = "Welcome to SkillSwap! Start by exploring skills and connecting with other learners.",
                Type = NotificationType.System,
                IsRead = Random.Shared.NextDouble() > 0.5,
                CreatedAt = user.CreatedAt,
                ReadAt = Random.Shared.NextDouble() > 0.5 ? user.CreatedAt.AddHours(Random.Shared.Next(1, 24)) : null
            });

            // Session-related notifications
            var userSessions = sessions.Where(s => s.TeacherId == user.Id || s.StudentId == user.Id).ToList();
            foreach (var session in userSessions)
            {
                if (session.Status == SessionStatus.Confirmed)
                {
                    notifications.Add(new Notification
                    {
                        UserId = user.Id,
                        Title = "Session Confirmed",
                        Message = $"Your {session.UserSkill.Skill.Name} session has been confirmed for {session.ScheduledStart:MMM dd, yyyy} at {session.ScheduledStart:HH:mm}.",
                        Type = NotificationType.SessionConfirmed,
                        IsRead = Random.Shared.NextDouble() > 0.3,
                        RelatedEntityId = session.Id,
                        RelatedEntityType = "Session",
                        CreatedAt = session.ConfirmedAt ?? session.CreatedAt,
                        ReadAt = Random.Shared.NextDouble() > 0.3 ? (session.ConfirmedAt ?? session.CreatedAt).AddHours(Random.Shared.Next(1, 12)) : null
                    });
                }

                if (session.Status == SessionStatus.Completed)
                {
                    notifications.Add(new Notification
                    {
                        UserId = user.Id,
                        Title = "Session Completed",
                        Message = $"Your {session.UserSkill.Skill.Name} session has been completed. Please leave a review!",
                        Type = NotificationType.SessionCompleted,
                        IsRead = Random.Shared.NextDouble() > 0.4,
                        RelatedEntityId = session.Id,
                        RelatedEntityType = "Session",
                        CreatedAt = session.ActualEnd ?? session.ScheduledEnd,
                        ReadAt = Random.Shared.NextDouble() > 0.4 ? (session.ActualEnd ?? session.ScheduledEnd).AddHours(Random.Shared.Next(1, 24)) : null
                    });
                }
            }
        }

        context.Notifications.AddRange(notifications);
        await context.SaveChangesAsync();
    }

    private static async Task SeedEndorsementsAsync(SkillSwapDbContext context, List<User> users)
    {
        var endorsements = new List<Endorsement>();
        var skills = await context.Skills.Take(10).ToListAsync();

        foreach (var user in users.Take(10)) // Only endorse first 10 users
        {
            var endorsementCount = Random.Shared.Next(1, 4);
            var endorsers = users.Where(u => u.Id != user.Id).OrderBy(x => Random.Shared.Next()).Take(endorsementCount);

            foreach (var endorser in endorsers)
            {
                var skill = skills[Random.Shared.Next(skills.Count)];
                endorsements.Add(new Endorsement
                {
                    EndorserId = endorser.Id,
                    EndorseeId = user.Id,
                    SkillId = skill.Id,
                    Comment = GetEndorsementComment(skill.Name),
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
                    IsVerified = Random.Shared.NextDouble() > 0.3
                });
            }
        }

        context.Endorsements.AddRange(endorsements);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUserBadgesAsync(SkillSwapDbContext context, List<User> users)
    {
        var userBadges = new List<UserBadge>();
        var badges = await context.Badges.ToListAsync();

        foreach (var user in users)
        {
            var badgeCount = Random.Shared.Next(1, 4);
            var userBadgeList = badges.OrderBy(x => Random.Shared.Next()).Take(badgeCount);

            foreach (var badge in userBadgeList)
            {
                userBadges.Add(new UserBadge
                {
                    UserId = user.Id,
                    BadgeId = badge.Id,
                    EarnedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 90))
                });
            }
        }

        context.UserBadges.AddRange(userBadges);
        await context.SaveChangesAsync();
    }

    private static async Task<List<GroupEvent>> SeedGroupEventsAsync(SkillSwapDbContext context, List<User> users)
    {
        var groupEvents = new List<GroupEvent>();
        var skills = await context.Skills.Take(15).ToListAsync();

        for (int i = 0; i < 8; i++)
        {
            var organizer = users[Random.Shared.Next(users.Count)];
            var skill = skills[Random.Shared.Next(skills.Count)];
            var startTime = DateTime.UtcNow.AddDays(Random.Shared.Next(1, 30));
            var duration = Random.Shared.Next(2, 5);
            var endTime = startTime.AddHours(duration);

            groupEvents.Add(new GroupEvent
            {
                OrganizerId = organizer.Id,
                Title = GetGroupEventTitle(skill.Name),
                Description = GetGroupEventDescription(skill.Name),
                SkillId = skill.Id,
                ScheduledStart = startTime,
                ScheduledEnd = endTime,
                CreditsCost = Random.Shared.Next(10, 30),
                MaxParticipants = Random.Shared.Next(5, 15),
                CurrentParticipants = 0,
                Type = (EventType)Random.Shared.Next(1, 5),
                MeetingLink = $"https://meet.skillswap.com/group-{i + 1}",
                IsOnline = Random.Shared.NextDouble() > 0.2,
                Location = Random.Shared.NextDouble() > 0.8 ? GetRandomLocation() : null,
                Status = EventStatus.Scheduled,
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 7))
            });
        }

        context.GroupEvents.AddRange(groupEvents);
        await context.SaveChangesAsync();
        return groupEvents;
    }

    private static async Task SeedGroupEventParticipantsAsync(SkillSwapDbContext context, List<User> users, List<GroupEvent> groupEvents)
    {
        var participants = new List<GroupEventParticipant>();

        foreach (var groupEvent in groupEvents)
        {
            var participantCount = Random.Shared.Next(2, Math.Min(groupEvent.MaxParticipants, 8));
            var eventParticipants = users.Where(u => u.Id != groupEvent.OrganizerId)
                                        .OrderBy(x => Random.Shared.Next())
                                        .Take(participantCount);

            foreach (var user in eventParticipants)
            {
                participants.Add(new GroupEventParticipant
                {
                    GroupEventId = groupEvent.Id,
                    UserId = user.Id,
                    JoinedAt = groupEvent.CreatedAt.AddHours(Random.Shared.Next(1, 48)),
                    HasPaid = Random.Shared.NextDouble() > 0.2
                });
            }

            // Update current participants count
            groupEvent.CurrentParticipants = participantCount;
        }

        context.GroupEventParticipants.AddRange(participants);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUserConnectionsAsync(SkillSwapDbContext context, List<User> users)
    {
        var connections = new List<UserConnection>();
        var existingConnections = new HashSet<(string, string)>();

        // Create connections between users
        for (int i = 0; i < 20; i++)
        {
            var requester = users[Random.Shared.Next(users.Count)];
            var receiver = users.Where(u => u.Id != requester.Id).OrderBy(x => Random.Shared.Next()).First();

            // Create a unique key for the connection (both directions)
            var connectionKey1 = (requester.Id, receiver.Id);
            var connectionKey2 = (receiver.Id, requester.Id);

            // Skip if this connection already exists (in either direction)
            if (existingConnections.Contains(connectionKey1) || existingConnections.Contains(connectionKey2))
            {
                continue;
            }

            existingConnections.Add(connectionKey1);

            connections.Add(new UserConnection
            {
                RequesterId = requester.Id,
                ReceiverId = receiver.Id,
                Status = (ConnectionStatus)Random.Shared.Next(1, 5),
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
                RespondedAt = Random.Shared.NextDouble() > 0.3 ? DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)) : null,
                Message = Random.Shared.NextDouble() > 0.5 ? "Hi! I'd like to connect and learn from you." : null
            });
        }

        context.UserConnections.AddRange(connections);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSessionMessagesAsync(SkillSwapDbContext context, List<User> users, List<Session> sessions)
    {
        var sessionMessages = new List<SessionMessage>();
        var messageTemplates = new[]
        {
            "Great session! Thanks for the clear explanation.",
            "I have a question about the last topic we covered.",
            "Could you share the resources you mentioned?",
            "Looking forward to our next session!",
            "The homework was really helpful for understanding the concept.",
            "I've been practicing and have some questions.",
            "Thanks for being so patient with my questions.",
            "The examples you gave really helped me understand better."
        };

        foreach (var session in sessions.Where(s => s.Status == SessionStatus.Completed))
        {
            var messageCount = Random.Shared.Next(2, 6);
            var lastMessageTime = session.ActualStart ?? session.ScheduledStart;

            for (int i = 0; i < messageCount; i++)
            {
                var isFromTeacher = Random.Shared.NextDouble() > 0.5;
                var senderId = isFromTeacher ? session.TeacherId : session.StudentId;
                var template = messageTemplates[Random.Shared.Next(messageTemplates.Length)];

                sessionMessages.Add(new SessionMessage
                {
                    SessionId = session.Id,
                    SenderId = senderId,
                    Content = template,
                    SentAt = lastMessageTime.AddMinutes(Random.Shared.Next(10, 120)),
                    Type = MessageType.Text
                });

                lastMessageTime = lastMessageTime.AddMinutes(Random.Shared.Next(10, 120));
            }
        }

        context.SessionMessages.AddRange(sessionMessages);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAuditLogsAsync(SkillSwapDbContext context, List<User> users)
    {
        var auditLogs = new List<AuditLog>();

        foreach (var user in users)
        {
            var logCount = Random.Shared.Next(3, 8);
            var actions = new[] { "Login", "Profile Update", "Skill Added", "Session Created", "Message Sent", "Review Posted" };

            for (int i = 0; i < logCount; i++)
            {
                var action = actions[Random.Shared.Next(actions.Length)];
                auditLogs.Add(new AuditLog
                {
                    UserId = user.Id,
                    Action = action,
                    Details = GetAuditLogDetails(action),
                    EntityType = GetEntityType(action),
                    EntityId = Random.Shared.Next(1, 100),
                    IpAddress = $"192.168.1.{Random.Shared.Next(1, 255)}",
                    UserAgent = GetRandomUserAgent(),
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
                });
            }
        }

        context.AuditLogs.AddRange(auditLogs);
        await context.SaveChangesAsync();
    }

    // Helper methods
    private static string GetSkillDescription(string skillName)
    {
        var descriptions = new Dictionary<string, string>
        {
            ["C# Programming"] = "I can teach C# programming from basics to advanced concepts including OOP, LINQ, and .NET Core development.",
            ["JavaScript"] = "Expert in JavaScript and modern web development including React, Node.js, and ES6+ features.",
            ["Python"] = "Python programming for data science, web development, automation, and machine learning applications.",
            ["Photography"] = "Professional photography techniques including composition, lighting, and post-processing.",
            ["Spanish"] = "Native Spanish speaker with experience in language instruction and cultural exchange.",
            ["Yoga"] = "Certified yoga instructor specializing in Hatha, Vinyasa, and meditation practices.",
            ["Guitar"] = "Guitar instruction covering acoustic, electric, and music theory for all skill levels.",
            ["Cooking"] = "Culinary arts and cooking techniques with focus on international cuisine and healthy recipes."
        };

        return descriptions.GetValueOrDefault(skillName, $"Experienced instructor in {skillName.ToLower()} with a passion for teaching and helping others learn.");
    }

    private static SessionStatus GetRandomSessionStatus(DateTime startTime)
    {
        var now = DateTime.UtcNow;
        if (startTime > now.AddDays(1))
            return SessionStatus.Pending;
        else if (startTime > now)
            return (SessionStatus)Random.Shared.Next(1, 3); // Pending or Confirmed
        else if (startTime > now.AddHours(-2))
            return (SessionStatus)Random.Shared.Next(2, 5); // Confirmed, InProgress, or Completed
        else
            return (SessionStatus)Random.Shared.Next(3, 6); // InProgress, Completed, or Cancelled
    }

    private static string GetSessionNotes(SessionStatus status)
    {
        return status switch
        {
            SessionStatus.Completed => "Great session! Student showed good progress and engagement.",
            SessionStatus.Cancelled => "Session cancelled due to scheduling conflict.",
            SessionStatus.InProgress => "Session is currently in progress.",
            _ => null
        };
    }

    private static string GetCancellationReason()
    {
        var reasons = new[]
        {
            "Scheduling conflict",
            "Emergency came up",
            "Not feeling well",
            "Technical difficulties",
            "Personal reasons"
        };
        return reasons[Random.Shared.Next(reasons.Length)];
    }

    private static string GetRandomLocation()
    {
        var locations = new[]
        {
            "Central Park, New York",
            "Golden Gate Park, San Francisco",
            "Millennium Park, Chicago",
            "Pike Place Market, Seattle",
            "Boston Common, Boston"
        };
        return locations[Random.Shared.Next(locations.Length)];
    }

    private static string GetReviewComment(string reviewerType)
    {
        var studentComments = new[]
        {
            "Excellent teacher! Very patient and clear explanations.",
            "Great session, learned a lot. Highly recommend!",
            "Very knowledgeable and helpful. Made complex topics easy to understand.",
            "Professional and engaging. Looking forward to more sessions.",
            "Amazing instructor with great teaching methods."
        };

        var teacherComments = new[]
        {
            "Great student! Very engaged and asked thoughtful questions.",
            "Quick learner with good attention to detail.",
            "Pleasure to teach. Shows genuine interest in learning.",
            "Excellent student with great potential.",
            "Very respectful and eager to learn."
        };

        var comments = reviewerType == "student" ? studentComments : teacherComments;
        return comments[Random.Shared.Next(comments.Length)];
    }

    private static string GetEndorsementComment(string skillName)
    {
        var comments = new[]
        {
            $"Highly skilled in {skillName.ToLower()}. Great teacher!",
            $"Excellent knowledge of {skillName.ToLower()}. Very professional.",
            $"Outstanding expertise in {skillName.ToLower()}. Highly recommended.",
            $"Great communicator and expert in {skillName.ToLower()}.",
            $"Top-notch skills in {skillName.ToLower()}. Excellent instructor."
        };
        return comments[Random.Shared.Next(comments.Length)];
    }

    private static string GetGroupEventTitle(string skillName)
    {
        var titles = new[]
        {
            $"Introduction to {skillName}",
            $"Advanced {skillName} Techniques",
            $"{skillName} Workshop",
            $"Learn {skillName} in a Day",
            $"{skillName} Masterclass"
        };
        return titles[Random.Shared.Next(titles.Length)];
    }

    private static string GetGroupEventDescription(string skillName)
    {
        return $"Join us for an interactive group session on {skillName.ToLower()}. Perfect for beginners and intermediate learners. We'll cover fundamentals and practical applications.";
    }

    private static string GetAuditLogDetails(string action)
    {
        return action switch
        {
            "Login" => "User logged in successfully",
            "Profile Update" => "User updated their profile information",
            "Skill Added" => "User added a new skill to their profile",
            "Session Created" => "User created a new teaching/learning session",
            "Message Sent" => "User sent a message to another user",
            "Review Posted" => "User posted a review for a session",
            _ => $"User performed action: {action}"
        };
    }

    private static string GetEntityType(string action)
    {
        return action switch
        {
            "Login" => "User",
            "Profile Update" => "User",
            "Skill Added" => "UserSkill",
            "Session Created" => "Session",
            "Message Sent" => "Message",
            "Review Posted" => "Review",
            _ => "Unknown"
        };
    }

    private static string GetRandomUserAgent()
    {
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
        };
        return userAgents[Random.Shared.Next(userAgents.Length)];
    }
}
