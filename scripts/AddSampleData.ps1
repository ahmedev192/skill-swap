# PowerShell script to add sample user skills to the database
# This script connects to the local database and adds sample offered skills

$connectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Create connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # First, let's see what users we have
    $userQuery = "SELECT Id, Email, FirstName, LastName FROM AspNetUsers"
    $userCommand = New-Object System.Data.SqlClient.SqlCommand($userQuery, $connection)
    $userReader = $userCommand.ExecuteReader()
    
    $users = @()
    while ($userReader.Read()) {
        $users += @{
            Id = $userReader["Id"]
            Email = $userReader["Email"]
            FirstName = $userReader["FirstName"]
            LastName = $userReader["LastName"]
        }
    }
    $userReader.Close()
    
    Write-Host "Found $($users.Count) users in the database" -ForegroundColor Yellow
    
    if ($users.Count -eq 0) {
        Write-Host "No users found. Please create some users first through the registration process." -ForegroundColor Red
        return
    }
    
    # Display users
    foreach ($user in $users) {
        Write-Host "User: $($user.FirstName) $($user.LastName) ($($user.Email)) - ID: $($user.Id)" -ForegroundColor Cyan
    }
    
    # Check if we already have user skills
    $skillQuery = "SELECT COUNT(*) as Count FROM UserSkills"
    $skillCommand = New-Object System.Data.SqlClient.SqlCommand($skillQuery, $connection)
    $skillCount = $skillCommand.ExecuteScalar()
    
    Write-Host "Current user skills count: $skillCount" -ForegroundColor Yellow
    
    if ($skillCount -gt 0) {
        Write-Host "User skills already exist. Skipping sample data creation." -ForegroundColor Yellow
        return
    }
    
    # Add sample user skills
    $sampleSkills = @(
        @{ SkillId = 1; CreditsPerHour = 25; Description = "I can teach C# programming from basics to advanced concepts including OOP, LINQ, and .NET Core" },
        @{ SkillId = 2; CreditsPerHour = 20; Description = "JavaScript and web development expertise including React, Node.js, and modern frameworks" },
        @{ SkillId = 3; CreditsPerHour = 30; Description = "Python programming for data science, web development, and automation" },
        @{ SkillId = 4; CreditsPerHour = 22; Description = "Java programming with Spring framework and enterprise development" },
        @{ SkillId = 5; CreditsPerHour = 18; Description = "SQL and database design including MySQL, PostgreSQL, and optimization" }
    )
    
    $insertQuery = @"
INSERT INTO UserSkills (UserId, SkillId, Type, CreditsPerHour, Description, IsAvailable, CreatedAt, UpdatedAt)
VALUES (@UserId, @SkillId, 0, @CreditsPerHour, @Description, 1, GETUTCDATE(), GETUTCDATE())
"@
    
    $insertCommand = New-Object System.Data.SqlClient.SqlCommand($insertQuery, $connection)
    $insertCommand.Parameters.Add("@UserId", [System.Data.SqlDbType]::NVarChar)
    $insertCommand.Parameters.Add("@SkillId", [System.Data.SqlDbType]::Int)
    $insertCommand.Parameters.Add("@CreditsPerHour", [System.Data.SqlDbType]::Int)
    $insertCommand.Parameters.Add("@Description", [System.Data.SqlDbType]::NVarChar)
    
    $addedCount = 0
    foreach ($user in $users) {
        foreach ($skill in $sampleSkills) {
            $insertCommand.Parameters["@UserId"].Value = $user.Id
            $insertCommand.Parameters["@SkillId"].Value = $skill.SkillId
            $insertCommand.Parameters["@CreditsPerHour"].Value = $skill.CreditsPerHour
            $insertCommand.Parameters["@Description"].Value = $skill.Description
            
            try {
                $insertCommand.ExecuteNonQuery()
                $addedCount++
                Write-Host "Added skill $($skill.SkillId) for user $($user.FirstName) $($user.LastName)" -ForegroundColor Green
            }
            catch {
                Write-Host "Failed to add skill $($skill.SkillId) for user $($user.FirstName): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "Successfully added $addedCount sample user skills" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
