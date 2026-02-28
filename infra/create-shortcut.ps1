$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\OneDrive - Siili Solutions Oyj\Desktop\WINi.lnk")
$Shortcut.TargetPath = "C:\Dev\Wini\wini-app\scripts\start-dev.bat"
$Shortcut.IconLocation = "C:\Dev\Wini\logo-pictures\wini-favicon.ico"
$Shortcut.Description = "Start WINi dev environment"
$Shortcut.WorkingDirectory = "C:\Dev\Wini\wini-app"
$Shortcut.Save()
Write-Host "Shortcut created on Desktop with WINi icon."
