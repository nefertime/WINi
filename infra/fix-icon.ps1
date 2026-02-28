$desktop = "$env:USERPROFILE\OneDrive - Siili Solutions Oyj\Desktop"
$shortcutPath = "$desktop\WINi.lnk"

# Remove old shortcut and recreate with icon
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "C:\Dev\Wini\wini-app\scripts\start-dev.bat"
$Shortcut.IconLocation = "C:\Dev\Wini\logo-pictures\wini-favicon.ico, 0"
$Shortcut.Description = "Start WINi dev environment"
$Shortcut.WorkingDirectory = "C:\Dev\Wini\wini-app"
$Shortcut.Save()

# Clear Windows icon cache
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-Process explorer

Write-Host "Icon updated and explorer restarted."
