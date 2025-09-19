# PowerShell script to fix user skills - change them from Requested to Offered

$connectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Create connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # First, let's see what we have
    $query = @"
SELECT 
    us.Id,
    us.UserId,
    u.FirstName,
    u.LastName,
    s.Name as SkillName,
    us.Type,
    us.Level,
    us.CreditsPerHour,
    us.Description
FROM UserSkills us
INNER JOIN AspNetUsers u ON us.UserId = u.Id
INNER JOIN Skills s ON us.SkillId = s.Id
ORDER BY us.Id
"@
    
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nCurrent User Skills:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    $skillsToUpdate = @()
    
    while ($reader.Read()) {
        $type = if ($reader["Type"] -eq 1) { "Offered" } else { "Requested" }
        $level = switch ($reader["Level"]) {
            1 { "Beginner" }
            2 { "Intermediate" }
            3 { "Expert" }
            default { "Unknown" }
        }
        
        Write-Host "`nID: $($reader["Id"])" -ForegroundColor Cyan
        Write-Host "User: $($reader["FirstName"]) $($reader["LastName"])" -ForegroundColor White
        Write-Host "Skill: $($reader["SkillName"])" -ForegroundColor White
        Write-Host "Type: $type (Value: $($reader["Type"]))" -ForegroundColor White
        Write-Host "Level: $level (Value: $($reader["Level"]))" -ForegroundColor White
        Write-Host "Credits/Hour: $($reader["CreditsPerHour"])" -ForegroundColor White
        
        # If it's a Requested skill (Type = 2), we want to change it to Offered (Type = 1)
        if ($reader["Type"] -eq 2) {
            $skillsToUpdate += @{
                Id = $reader["Id"]
                UserName = "$($reader["FirstName"]) $($reader["LastName"])"
                SkillName = $reader["SkillName"]
            }
        }
    }
    $reader.Close()
    
    Write-Host "`nSkills to update from Requested to Offered:" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    
    if ($skillsToUpdate.Count -eq 0) {
        Write-Host "No skills need to be updated." -ForegroundColor Green
        return
    }
    
    foreach ($skill in $skillsToUpdate) {
        Write-Host "  ID $($skill.Id): $($skill.SkillName) for $($skill.UserName)" -ForegroundColor Cyan
    }
    
    # Update the skills
    $updateQuery = "UPDATE UserSkills SET Type = 1 WHERE Id = @Id"
    $updateCommand = New-Object System.Data.SqlClient.SqlCommand($updateQuery, $connection)
    $updateCommand.Parameters.Add("@Id", [System.Data.SqlDbType]::Int)
    
    $updatedCount = 0
    foreach ($skill in $skillsToUpdate) {
        $updateCommand.Parameters["@Id"].Value = $skill.Id
        
        try {
            $rowsAffected = $updateCommand.ExecuteNonQuery()
            if ($rowsAffected -gt 0) {
                $updatedCount++
                Write-Host "Updated skill ID $($skill.Id): $($skill.SkillName)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "Failed to update skill ID $($skill.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nSuccessfully updated $updatedCount skills from Requested to Offered" -ForegroundColor Green
    
    # Show final state
    Write-Host "`nFinal User Skills:" -ForegroundColor Yellow
    Write-Host "=================" -ForegroundColor Yellow
    
    $finalCommand = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $finalReader = $finalCommand.ExecuteReader()
    
    $offeredCount = 0
    $requestedCount = 0
    
    while ($finalReader.Read()) {
        $type = if ($finalReader["Type"] -eq 1) { "Offered" } else { "Requested" }
        Write-Host "ID $($finalReader["Id"]): $($finalReader["SkillName"]) - $type" -ForegroundColor $(if ($type -eq "Offered") { "Green" } else { "Blue" })
        
        if ($finalReader["Type"] -eq 1) { $offeredCount++ } else { $requestedCount++ }
    }
    $finalReader.Close()
    
    Write-Host "`nFinal Summary:" -ForegroundColor Yellow
    Write-Host "==============" -ForegroundColor Yellow
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
