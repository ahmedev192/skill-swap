# PowerShell script to force seed mock data even with existing data
# This will add mock data alongside existing data

param(
    [string]$ConnectionString = "Server=(localdb)\mssqllocaldb;Database=SkillSwapDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
)

Write-Host "SkillSwap Force Mock Data Seeder" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "This will add mock data alongside existing data." -ForegroundColor Yellow

$confirmation = Read-Host "Continue? (y/n)"
if ($confirmation -ne "y" -and $confirmation -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    return
}

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Green
    
    # Check current user count
    $userQuery = "SELECT COUNT(*) as UserCount FROM AspNetUsers"
    $userCommand = New-Object System.Data.SqlClient.SqlCommand($userQuery, $connection)
    $userCount = $userCommand.ExecuteScalar()
    
    Write-Host "Current user count: $userCount" -ForegroundColor Yellow
    
    Write-Host "`nTo force seed mock data, you need to:" -ForegroundColor Cyan
    Write-Host "1. Stop the running application (if any)" -ForegroundColor Cyan
    Write-Host "2. Modify the DatabaseInitializer to call:" -ForegroundColor Cyan
    Write-Host "   await MockDataSeeder.SeedMockDataAsync(context, userManager, forceSeed: true);" -ForegroundColor Cyan
    Write-Host "3. Run the application again" -ForegroundColor Cyan
    
    Write-Host "`nAlternatively, use the clear-database.ps1 script to start fresh." -ForegroundColor Yellow
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
