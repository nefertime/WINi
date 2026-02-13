# Kill WINi dev server processes on port 3100
Write-Host "Cleaning up WINi dev server..." -ForegroundColor Yellow

$conn = Get-NetTCPConnection -LocalPort 3100 -ErrorAction SilentlyContinue
if ($conn) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "  Killing $($proc.Name) (PID $($proc.Id)) on port 3100" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force
    }
} else {
    Write-Host "  No process found on port 3100" -ForegroundColor Green
}

Write-Host "Done!" -ForegroundColor Green
