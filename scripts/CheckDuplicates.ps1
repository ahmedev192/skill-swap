# PowerShell script to check for duplicate user skills

$connectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Create connection
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # Check for duplicates
    $query = @"
SELECT 
    UserId,
    SkillId,
    Type,
    COUNT(*) as Count
FROM UserSkills
GROUP BY UserId, SkillId, Type
HAVING COUNT(*) > 1
ORDER BY Count DESC
"@
    
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nDuplicate User Skills:" -ForegroundColor Yellow
    Write-Host "=====================" -ForegroundColor Yellow
    
    $duplicates = @()
    while ($reader.Read()) {
        $duplicates += @{
            UserId = $reader["UserId"]
            SkillId = $reader["SkillId"]
            Type = $reader["Type"]
            Count = $reader["Count"]
        }
        
        Write-Host "User: $($reader["UserId"]) | Skill: $($reader["SkillId"]) | Type: $($reader["Type"]) | Count: $($reader["Count"])" -ForegroundColor Red
    }
    $reader.Close()
    
    if ($duplicates.Count -eq 0) {
        Write-Host "No duplicate user skills found." -ForegroundColor Green
    } else {
        Write-Host "`nFound $($duplicates.Count) duplicate combinations" -ForegroundColor Red
        
        # For each duplicate, show the actual records
        foreach ($dup in $duplicates) {
            Write-Host "`nDuplicate records for User: $($dup.UserId), Skill: $($dup.SkillId), Type: $($dup.Type)" -ForegroundColor Yellow
            
            $detailQuery = @"
SELECT 
    us.Id,
    us.UserId,
    u.FirstName,
    u.LastName,
    s.Name as SkillName,
    us.Type,
    us.Level,
    us.CreditsPerHour,
    us.Description,
    us.CreatedAt
FROM UserSkills us
INNER JOIN AspNetUsers u ON us.UserId = u.Id
INNER JOIN Skills s ON us.SkillId = s.Id
WHERE us.UserId = @UserId AND us.SkillId = @SkillId AND us.Type = @Type
ORDER BY us.CreatedAt
"@
            
            $detailCommand = New-Object System.Data.SqlClient.SqlCommand($detailQuery, $connection)
            $detailCommand.Parameters.Add("@UserId", [System.Data.SqlDbType]::NVarChar).Value = $dup.UserId
            $detailCommand.Parameters.Add("@SkillId", [System.Data.SqlDbType]::Int).Value = $dup.SkillId
            $detailCommand.Parameters.Add("@Type", [System.Data.SqlDbType]::Int).Value = $dup.Type
            
            $detailReader = $detailCommand.ExecuteReader()
            
            while ($detailReader.Read()) {
                $type = if ($detailReader["Type"] -eq 1) { "Offered" } else { "Requested" }
                Write-Host "  ID: $($detailReader["Id"]) | $($detailReader["FirstName"]) $($detailReader["LastName"]) | $($detailReader["SkillName"]) | $type | $($detailReader["CreditsPerHour"]) credits | Created: $($detailReader["CreatedAt"])" -ForegroundColor Cyan
            }
            $detailReader.Close()
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
