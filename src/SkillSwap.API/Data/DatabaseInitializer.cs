using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.Entities;
using SkillSwap.Infrastructure.Data;

namespace SkillSwap.API.Data
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SkillSwapDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            
            try
            {
                // Check if referral columns exist
                var hasReferralColumns = await CheckReferralColumnsExistAsync(context);
                
                if (!hasReferralColumns)
                {
                    await AddReferralColumnsAsync(context);
                }

                // Seed mock data if database is empty
                Console.WriteLine("🔧 DatabaseInitializer: Calling MockDataSeeder...");
                await MockDataSeeder.SeedMockDataAsync(context, userManager);
                Console.WriteLine("🔧 DatabaseInitializer: MockDataSeeder completed");
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the application startup
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<SkillSwapDbContext>>();
                logger.LogError(ex, "Error initializing database with referral columns and mock data");
            }
        }

        private static async Task<bool> CheckReferralColumnsExistAsync(SkillSwapDbContext context)
        {
            try
            {
                // Check if all required columns exist
                await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 ReferralCode FROM AspNetUsers");
                await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 ReferrerId FROM AspNetUsers");
                await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 UsedReferralCode FROM AspNetUsers");
                await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 FromUserId FROM CreditTransactions");
                await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 ToUserId FROM CreditTransactions");
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static async Task AddReferralColumnsAsync(SkillSwapDbContext context)
        {
            try
            {
                // Add referral columns to AspNetUsers table individually
                await AddColumnIfNotExistsAsync(context, "AspNetUsers", "ReferralCode", "NVARCHAR(MAX) NULL");
                await AddColumnIfNotExistsAsync(context, "AspNetUsers", "ReferrerId", "NVARCHAR(450) NULL");
                await AddColumnIfNotExistsAsync(context, "AspNetUsers", "UsedReferralCode", "BIT NOT NULL DEFAULT 0");

                // Create index on ReferrerId if it doesn't exist
                try
                {
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE INDEX IX_AspNetUsers_ReferrerId ON AspNetUsers (ReferrerId)");
                }
                catch
                {
                    // Index might already exist, that's okay
                }

                // Add foreign key constraint if it doesn't exist
                try
                {
                    await context.Database.ExecuteSqlRawAsync(@"
                        ALTER TABLE AspNetUsers 
                        ADD CONSTRAINT FK_AspNetUsers_AspNetUsers_ReferrerId 
                        FOREIGN KEY (ReferrerId) REFERENCES AspNetUsers(Id)");
                }
                catch
                {
                    // Constraint might already exist, that's okay
                }

                // Add FromUserId and ToUserId columns to CreditTransactions table
                await AddColumnIfNotExistsAsync(context, "CreditTransactions", "FromUserId", "NVARCHAR(MAX) NULL");
                await AddColumnIfNotExistsAsync(context, "CreditTransactions", "ToUserId", "NVARCHAR(MAX) NULL");

                // Try to add migration record if the table exists
                try
                {
                    await context.Database.ExecuteSqlRawAsync(@"
                        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
                        VALUES ('20250919000000_AddReferralColumnsToUser', '8.0.0')");
                }
                catch
                {
                    // Migration history table doesn't exist, that's okay
                    // The columns have been added successfully
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to add referral columns: {ex.Message}", ex);
            }
        }

        private static async Task AddColumnIfNotExistsAsync(SkillSwapDbContext context, string tableName, string columnName, string columnDefinition)
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync($@"
                    ALTER TABLE {tableName} 
                    ADD {columnName} {columnDefinition}");
            }
            catch (Exception ex) when (ex.Message.Contains("already exists") || 
                                       ex.Message.Contains("duplicate") || 
                                       ex.Message.Contains("must be unique") ||
                                       ex.Message.Contains("already defined"))
            {
                // Column already exists, that's okay
            }
        }
    }
}
