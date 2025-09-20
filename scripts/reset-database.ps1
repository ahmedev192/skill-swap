# PowerShell script to completely reset the SkillSwap database
# This will drop and recreate the database

param(
    [string]$ServerName = "(localdb)\mssqllocaldb",
    [string]$DatabaseName = "SkillSwapDb_Dev"
)

Write-Host "SkillSwap Database Reset" -ForegroundColor Red
Write-Host "========================" -ForegroundColor Red
Write-Host "WARNING: This will completely delete and recreate the database!" -ForegroundColor Red

$confirmation = Read-Host "Are you sure you want to continue? Type 'yes' to confirm"
if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    return
}

try {
    # Connect to master database to drop the database
    $masterConnectionString = "Server=$ServerName;Database=master;Trusted_Connection=true;MultipleActiveResultSets=true"
    $connection = New-Object System.Data.SqlClient.SqlConnection($masterConnectionString)
    $connection.Open()
    
    Write-Host "Connected to SQL Server successfully" -ForegroundColor Green
    
    # Drop the database if it exists
    $dropQuery = "IF EXISTS (SELECT name FROM sys.databases WHERE name = '$DatabaseName') DROP DATABASE [$DatabaseName]"
    $dropCommand = New-Object System.Data.SqlClient.SqlCommand($dropQuery, $connection)
    $dropCommand.ExecuteNonQuery()
    
    Write-Host "Database '$DatabaseName' dropped successfully" -ForegroundColor Green
    
    # Create the database
    $createQuery = "CREATE DATABASE [$DatabaseName]"
    $createCommand = New-Object System.Data.SqlClient.SqlCommand($createQuery, $connection)
    $createCommand.ExecuteNonQuery()
    
    Write-Host "Database '$DatabaseName' created successfully" -ForegroundColor Green
    
    $connection.Close()
    
    Write-Host "`nDatabase reset complete!" -ForegroundColor Green
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
