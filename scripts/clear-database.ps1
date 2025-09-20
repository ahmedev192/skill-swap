# PowerShell script to completely clear the SkillSwap database
# WARNING: This will delete ALL data in the database

param(
    [string]$ConnectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
)

Write-Host "SkillSwap Database Cleaner" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host "WARNING: This will delete ALL data in the database!" -ForegroundColor Red

$confirmation = Read-Host "Are you sure you want to continue? Type 'yes' to confirm"
if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    return
}

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
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
            $rowsAffected = $clearCommand.ExecuteNonQuery()
            Write-Host "Cleared: $($query.Split(' ')[1]) ($rowsAffected rows)" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not clear $($query.Split(' ')[1]): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nDatabase cleared successfully!" -ForegroundColor Green
    Write-Host "Now run the application to seed mock data:" -ForegroundColor Cyan
    Write-Host "cd src/SkillSwap.API" -ForegroundColor Cyan
    Write-Host "dotnet run" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
