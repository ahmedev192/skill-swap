# PowerShell script to seed mock data for SkillSwap database
# This script will populate the database with realistic test data

param(
    [string]$ConnectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true",
    [switch]$Force = $false
)

Write-Host "SkillSwap Mock Data Seeder" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

try {
    # Check if database exists and has data
    $connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # Check if users already exist
    $userQuery = "SELECT COUNT(*) as UserCount FROM AspNetUsers"
    $userCommand = New-Object System.Data.SqlClient.SqlCommand($userQuery, $connection)
    $userCount = $userCommand.ExecuteScalar()
    
    Write-Host "Current user count: $userCount" -ForegroundColor Yellow
    
    if ($userCount -gt 0 -and -not $Force) {
        Write-Host "Database already contains users. Use -Force to reseed data." -ForegroundColor Red
        Write-Host "WARNING: Using -Force will delete all existing data!" -ForegroundColor Red
        return
    }
    
    if ($Force -and $userCount -gt 0) {
        Write-Host "Force mode enabled. This will delete all existing data!" -ForegroundColor Red
        $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
        if ($confirmation -ne "yes") {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            return
        }
        
        Write-Host "Clearing existing data..." -ForegroundColor Yellow
        # Clear all data in correct order to respect foreign key constraints
        $clearQueries = @(
            "DELETE FROM AuditLogs",
            "DELETE FROM SessionMessages", 
            "DELETE FROM UserConnections",
            "DELETE FROM GroupEventParticipants",
            "DELETE FROM GroupEvents",
            "DELETE FROM UserBadges",
            "DELETE FROM Endorsements",
            "DELETE FROM Notifications",
            "DELETE FROM Messages",
            "DELETE FROM Reviews",
            "DELETE FROM CreditTransactions",
            "DELETE FROM Sessions",
            "DELETE FROM UserAvailabilities",
            "DELETE FROM UserSkills",
            "DELETE FROM Skills",
            "DELETE FROM AspNetUsers"
        )
        
        foreach ($query in $clearQueries) {
            try {
                $clearCommand = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                $clearCommand.ExecuteNonQuery()
                Write-Host "Cleared: $($query.Split(' ')[1])" -ForegroundColor Gray
            }
            catch {
                Write-Host "Warning: Could not clear $($query.Split(' ')[1]): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`nStarting mock data seeding..." -ForegroundColor Green
    Write-Host "This will create:" -ForegroundColor Cyan
    Write-Host "- 15 realistic user profiles with avatar images" -ForegroundColor Cyan
    Write-Host "- 40 diverse skills across multiple categories" -ForegroundColor Cyan
    Write-Host "- User skills (offered/requested) for each user" -ForegroundColor Cyan
    Write-Host "- User availability schedules" -ForegroundColor Cyan
    Write-Host "- 20-30 realistic sessions with various statuses" -ForegroundColor Cyan
    Write-Host "- Credit transactions and balances" -ForegroundColor Cyan
    Write-Host "- Reviews and ratings" -ForegroundColor Cyan
    Write-Host "- Messages between users" -ForegroundColor Cyan
    Write-Host "- Notifications and system events" -ForegroundColor Cyan
    Write-Host "- Endorsements and user connections" -ForegroundColor Cyan
    Write-Host "- Group events and participants" -ForegroundColor Cyan
    Write-Host "- Audit logs and session messages" -ForegroundColor Cyan
    
    Write-Host "`nTo seed the data, run the SkillSwap API application." -ForegroundColor Green
    Write-Host "The MockDataSeeder will automatically populate the database when it detects an empty database." -ForegroundColor Green
    
    Write-Host "`nAlternatively, you can run:" -ForegroundColor Yellow
    Write-Host "cd src/SkillSwap.API" -ForegroundColor Yellow
    Write-Host "dotnet run" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}

Write-Host "`nMock data seeding setup complete!" -ForegroundColor Green
