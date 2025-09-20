# Test script to verify avatar URLs are working
Write-Host "Testing Avatar URLs..." -ForegroundColor Green

# Test some of the avatar URLs from the database
$avatarUrls = @(
    "https://api.dicebear.com/7.x/personas/svg?seed=1e01965f-e133-4ed7-812e-1be75f56b611&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=20b78323-6698-496a-8965-3351c33c4b4f&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    "https://api.dicebear.com/7.x/micah/svg?seed=5d6d205e-dc51-4562-ab1e-5c2b32d9fce9&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    "https://api.adorable.io/avatars/200/4ffffd70-07ef-4c94-bf1f-0195ece92b94.png"
)

foreach ($url in $avatarUrls) {
    Write-Host "Testing: $url" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Avatar URL is accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ Avatar URL returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Avatar URL failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Avatar URL testing completed!" -ForegroundColor Green
