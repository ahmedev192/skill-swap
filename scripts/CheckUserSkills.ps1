# PowerShell script to check existing user skills in the database

$connectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Create connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # Check existing user skills
    $query = @"
SELECT 
    us.Id,
    us.UserId,
    u.FirstName,
    u.LastName,
    u.Email,
    s.Name as SkillName,
    s.Category,
    us.Type,
    us.CreditsPerHour,
    us.Description,
    us.IsAvailable,
    us.CreatedAt
FROM UserSkills us
INNER JOIN AspNetUsers u ON us.UserId = u.Id
INNER JOIN Skills s ON us.SkillId = s.Id
ORDER BY us.CreatedAt DESC
"@
    
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nExisting User Skills:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    $offeredCount = 0
    $requestedCount = 0
    
    while ($reader.Read()) {
        $type = if ($reader["Type"] -eq 0) { "Offered" } else { "Requested" }
        $available = if ($reader["IsAvailable"] -eq $true) { "Yes" } else { "No" }
        
        Write-Host "`nID: $($reader["Id"])" -ForegroundColor Cyan
        Write-Host "User: $($reader["FirstName"]) $($reader["LastName"]) ($($reader["Email"]))" -ForegroundColor White
        Write-Host "Skill: $($reader["SkillName"]) ($($reader["Category"]))" -ForegroundColor White
        Write-Host "Type: $type" -ForegroundColor $(if ($type -eq "Offered") { "Green" } else { "Blue" })
        Write-Host "Credits/Hour: $($reader["CreditsPerHour"])" -ForegroundColor White
        Write-Host "Available: $available" -ForegroundColor White
        Write-Host "Description: $($reader["Description"])" -ForegroundColor Gray
        Write-Host "Created: $($reader["CreatedAt"])" -ForegroundColor Gray
        
        if ($type -eq "Offered") { $offeredCount++ } else { $requestedCount++ }
    }
    $reader.Close()
    
    Write-Host "`nSummary:" -ForegroundColor Yellow
    Write-Host "=========" -ForegroundColor Yellow
    Write-Host "Total User Skills: $($offeredCount + $requestedCount)" -ForegroundColor White
    Write-Host "Offered Skills: $offeredCount" -ForegroundColor Green
    Write-Host "Requested Skills: $requestedCount" -ForegroundColor Blue
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
