# SkillSwap Mock Data System

This document describes the comprehensive mock data seeding system for the SkillSwap application. The system automatically populates the database with realistic test data when the database is empty.

## Overview

The mock data seeder creates a complete, realistic dataset that includes:

- **15 diverse user profiles** with professional avatars from Unsplash
- **40+ skills** across multiple categories (Programming, Languages, Arts, Music, Fitness, etc.)
- **User skills** (both offered and requested) with realistic descriptions and pricing
- **User availability** schedules for each user
- **20-30 sessions** with various statuses (Pending, Confirmed, Completed, Cancelled)
- **Credit transactions** including welcome bonuses, session payments, and refunds
- **Reviews and ratings** for completed sessions
- **Messages** between users who have had sessions
- **Notifications** for various system events
- **Endorsements** between users for specific skills
- **User badges** earned through various achievements
- **Group events** with participants
- **User connections** (friend requests, etc.)
- **Session messages** for completed sessions
- **Audit logs** for user activities

## Features

### Realistic User Profiles
- Professional headshots from Unsplash (150x150px, optimized for web)
- Diverse backgrounds and locations
- Realistic bios and professional descriptions
- Proper timezone settings
- Email verification and ID verification status

### Comprehensive Skills Database
- **Programming & Technology**: C#, JavaScript, Python, Java, React, Node.js, SQL, Git
- **Languages**: Spanish, French, German, Japanese, Mandarin Chinese, English
- **Arts & Creative**: Photography, Digital Art, Drawing, Graphic Design, Video Editing
- **Music**: Guitar, Piano, Singing, Music Production
- **Fitness & Wellness**: Yoga, Weight Training, Running, Swimming, Martial Arts
- **Lifestyle & Hobbies**: Cooking, Baking, Gardening, Chess, Knitting
- **Business & Professional**: Public Speaking, Project Management, Digital Marketing, Financial Planning
- **Analytics & Data**: Data Analysis, Machine Learning, Excel

### Realistic Session Data
- Sessions with proper scheduling (past, present, and future)
- Various statuses based on timing (Pending, Confirmed, InProgress, Completed, Cancelled)
- Realistic meeting links and locations
- Proper credit calculations
- Teacher and student confirmations

### Credit System
- Welcome bonus of 50 credits for each user
- Session payments and earnings
- Refunds for cancelled sessions
- Proper balance tracking

### Social Features
- Reviews and ratings (3-5 stars)
- Messages between users
- Endorsements for skills
- User connections and friend requests
- Group events with participants

## Usage

### Automatic Seeding
The mock data is automatically seeded when:
1. The database is empty (no users exist)
2. The application starts up
3. The `DatabaseInitializer.InitializeAsync()` method is called

### Manual Seeding
To manually trigger the seeding process:

1. **Using PowerShell Script**:
   ```powershell
   .\scripts\seed-mock-data.ps1
   ```

2. **Force Reseed** (clears existing data):
   ```powershell
   .\scripts\seed-mock-data.ps1 -Force
   ```

3. **Run the API**:
   ```bash
   cd src/SkillSwap.API
   dotnet run
   ```

### Database Connection
The seeder uses the connection string from your application configuration. Default connection string:
```
Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true
```

## Data Characteristics

### User Profiles
- **15 users** with diverse backgrounds
- **Professional avatars** from Unsplash (high-quality, diverse)
- **Realistic locations** across North America
- **Proper timezones** for each location
- **Professional bios** describing their expertise

### Skills and User Skills
- **40+ skills** across 8 major categories
- **2-4 offered skills** per user
- **1-3 requested skills** per user
- **Realistic pricing** (15-50 credits per hour)
- **Skill levels** (Beginner, Intermediate, Expert)

### Sessions
- **20-30 sessions** with realistic timing
- **Various statuses** based on session timing
- **1-3 hour duration** per session
- **70% online, 30% in-person** sessions
- **Proper credit calculations**

### Credit Transactions
- **Welcome bonus** of 50 credits per user
- **Session payments** and earnings
- **Refunds** for cancelled sessions
- **Proper balance tracking**

### Reviews and Ratings
- **3-5 star ratings** (realistic distribution)
- **Meaningful comments** for each review
- **Both teacher and student reviews**

### Messages and Notifications
- **Realistic message content** between users
- **System notifications** for various events
- **Proper read/unread status**

## File Structure

```
src/SkillSwap.Infrastructure/Data/
├── MockDataSeeder.cs          # Main seeder class
├── SkillSwapDbContext.cs      # Updated to use new seeder
└── ...

src/SkillSwap.API/Data/
├── DatabaseInitializer.cs     # Updated to call MockDataSeeder
└── ...

scripts/
├── seed-mock-data.ps1         # PowerShell script for manual seeding
└── ...
```

## Customization

### Adding New Skills
To add new skills, modify the `SeedSkillsAsync` method in `MockDataSeeder.cs`:

```csharp
new() { Id = 41, Name = "New Skill", Category = "Category", SubCategory = "SubCategory", Description = "Description" }
```

### Modifying User Data
To change user profiles, modify the `userData` array in `SeedUsersAsync`:

```csharp
new { FirstName = "John", LastName = "Doe", Email = "john.doe@email.com", Bio = "Bio", Location = "Location", TimeZone = "Timezone", ProfileImageUrl = "https://..." }
```

### Adjusting Data Volume
Modify the random ranges in the seeder methods:
- `sessionCount = Random.Shared.Next(20, 31)` for session count
- `offeredSkillsCount = Random.Shared.Next(2, 5)` for skills per user
- `messageCount = Random.Shared.Next(3, 8)` for messages per conversation

## Production Considerations

### Avatar URLs
The seeder uses Unsplash URLs for profile images. For production:
1. Download and host images on your own CDN
2. Update the `ProfileImageUrl` values in the seeder
3. Ensure proper image optimization and caching

### Data Privacy
The mock data uses realistic but fictional information:
- All names and emails are fictional
- Locations are real but randomly assigned
- Bios are generic and professional

### Performance
The seeder is optimized for development use:
- Creates a reasonable amount of data (not excessive)
- Uses efficient database operations
- Includes proper error handling

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify connection string in `appsettings.json`
   - Ensure SQL Server is running
   - Check database permissions

2. **Seeding Fails**
   - Check database constraints
   - Verify all required tables exist
   - Review error logs for specific issues

3. **Duplicate Data**
   - The seeder checks for existing users before seeding
   - Use `-Force` flag to clear existing data
   - Manually clear database if needed

### Logs
The seeder includes comprehensive logging:
- Success messages for each seeding step
- Error handling with detailed messages
- Progress indicators for long operations

## API Testing

With the mock data seeded, you can test all API endpoints:

### Authentication
- Login with any seeded user: `{email}@email.com` / `Password123!`

### Skills
- Browse all 40+ skills across categories
- View user skills (offered/requested)

### Sessions
- View sessions with various statuses
- Test session creation and management

### Credits
- Check user credit balances
- View transaction history

### Reviews
- View reviews and ratings
- Test review creation

### Messages
- View message conversations
- Test messaging functionality

## Conclusion

The SkillSwap mock data system provides a comprehensive, realistic dataset that enables thorough testing of all application features. The data is designed to be production-ready while maintaining privacy and performance considerations.

For questions or issues, refer to the application logs or contact the development team.
