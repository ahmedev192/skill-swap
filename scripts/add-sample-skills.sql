-- Add sample user skills to the database for testing
-- This script adds some sample offered skills for users

-- First, let's check if we have any users
-- If not, we'll need to create some test users first

-- Add sample user skills (assuming we have users with IDs)
-- You'll need to replace these user IDs with actual user IDs from your database

-- Example: Add C# Programming as an offered skill for a user
-- INSERT INTO UserSkills (UserId, SkillId, Type, CreditsPerHour, Description, IsAvailable, CreatedAt, UpdatedAt)
-- VALUES ('user-id-here', 1, 0, 25, 'I can teach C# programming from basics to advanced concepts', 1, GETUTCDATE(), GETUTCDATE());

-- Example: Add JavaScript as an offered skill for another user
-- INSERT INTO UserSkills (UserId, SkillId, Type, CreditsPerHour, Description, IsAvailable, CreatedAt, UpdatedAt)
-- VALUES ('user-id-here', 2, 0, 20, 'JavaScript and web development expertise', 1, GETUTCDATE(), GETUTCDATE());

-- To find actual user IDs, run this query first:
-- SELECT Id, Email, FirstName, LastName FROM AspNetUsers;

-- Then replace 'user-id-here' with actual user IDs and uncomment the INSERT statements above
