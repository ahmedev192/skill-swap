# PowerShell script to add offered skills to the database

$connectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Create connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # Get available skills
    $skillQuery = "SELECT Id, Name, Category FROM Skills WHERE IsActive = 1 ORDER BY Name"
    $skillCommand = New-Object System.Data.SqlClient.SqlCommand($skillQuery, $connection)
    $skillReader = $skillCommand.ExecuteReader()
    
    $skills = @()
    while ($skillReader.Read()) {
        $skills += @{
            Id = $skillReader["Id"]
            Name = $skillReader["Name"]
            Category = $skillReader["Category"]
        }
    }
    $skillReader.Close()
    
    Write-Host "Available Skills:" -ForegroundColor Yellow
    foreach ($skill in $skills) {
        Write-Host "  $($skill.Id): $($skill.Name) ($($skill.Category))" -ForegroundColor Cyan
    }
    
    # Get users
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
    
    Write-Host "`nAvailable Users:" -ForegroundColor Yellow
    foreach ($user in $users) {
        Write-Host "  $($user.Id): $($user.FirstName) $($user.LastName) ($($user.Email))" -ForegroundColor Cyan
    }
    
    # Add offered skills for each user
    $insertQuery = @"
INSERT INTO UserSkills (UserId, SkillId, Type, Level, CreditsPerHour, Description, IsAvailable, CreatedAt, UpdatedAt)
VALUES (@UserId, @SkillId, 1, @Level, @CreditsPerHour, @Description, 1, GETUTCDATE(), GETUTCDATE())
"@
    
    $insertCommand = New-Object System.Data.SqlClient.SqlCommand($insertQuery, $connection)
    $insertCommand.Parameters.Add("@UserId", [System.Data.SqlDbType]::NVarChar)
    $insertCommand.Parameters.Add("@SkillId", [System.Data.SqlDbType]::Int)
    $insertCommand.Parameters.Add("@Level", [System.Data.SqlDbType]::Int)
    $insertCommand.Parameters.Add("@CreditsPerHour", [System.Data.SqlDbType]::Int)
    $insertCommand.Parameters.Add("@Description", [System.Data.SqlDbType]::NVarChar)
    
    $addedCount = 0
    $skillDescriptions = @{
        1 = "I can teach C# programming from basics to advanced concepts including OOP, LINQ, and .NET Core"
        2 = "JavaScript and web development expertise including React, Node.js, and modern frameworks"
        3 = "Python programming for data science, web development, and automation"
        4 = "Java programming with Spring framework and enterprise development"
        5 = "SQL and database design including MySQL, PostgreSQL, and optimization"
        6 = "React.js development including hooks, context, and modern patterns"
        7 = "Node.js backend development with Express and RESTful APIs"
        8 = "HTML/CSS frontend development and responsive design"
        9 = "Git version control and collaborative development workflows"
        10 = "Docker containerization and deployment strategies"
    }
    
    foreach ($user in $users) {
        # Add 2-3 offered skills per user
        $userSkills = $skills | Get-Random -Count 3
        
        foreach ($skill in $userSkills) {
            $description = if ($skillDescriptions.ContainsKey($skill.Id)) { 
                $skillDescriptions[$skill.Id] 
            } else { 
                "I can teach $($skill.Name) and help you master this skill" 
            }
            
            $creditsPerHour = Get-Random -Minimum 15 -Maximum 35
            $level = Get-Random -Minimum 1 -Maximum 4  # 1=Beginner, 2=Intermediate, 3=Expert
            
            $insertCommand.Parameters["@UserId"].Value = $user.Id
            $insertCommand.Parameters["@SkillId"].Value = $skill.Id
            $insertCommand.Parameters["@Level"].Value = $level
            $insertCommand.Parameters["@CreditsPerHour"].Value = $creditsPerHour
            $insertCommand.Parameters["@Description"].Value = $description
            
            try {
                $insertCommand.ExecuteNonQuery()
                $addedCount++
                Write-Host "Added offered skill '$($skill.Name)' for $($user.FirstName) $($user.LastName) ($creditsPerHour credits/hour)" -ForegroundColor Green
            }
            catch {
                Write-Host "Failed to add skill '$($skill.Name)' for $($user.FirstName): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`nSuccessfully added $addedCount offered skills" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
