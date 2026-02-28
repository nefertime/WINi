$desktop = "$env:USERPROFILE\OneDrive - Siili Solutions Oyj\Desktop"

# Create new shortcut with icon
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$desktop\WINi.lnk")
$Shortcut.TargetPath = "C:\Dev\Wini\wini-app\scripts\start-dev.bat"
$Shortcut.IconLocation = "C:\Dev\Wini\logo-pictures\wini-favicon.ico"
$Shortcut.Description = "Start WINi dev environment"
$Shortcut.WorkingDirectory = "C:\Dev\Wini\wini-app"
$Shortcut.Save()
Write-Host "WINi.lnk created with icon."

# Delete old .bat shortcut
$oldBat = "$desktop\WINi.bat"
if (Test-Path $oldBat) {
    Remove-Item $oldBat
    Write-Host "Old WINi.bat removed."
}

Write-Host "Done."
