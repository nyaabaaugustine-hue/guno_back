# Launch Chrome with remote debugging for agent-browser
# Run this before using @agent-browser in OpenCode

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$userData = "$env:LOCALAPPDATA\Google\Chrome\User Data\OpenCode"

if (-not (Test-Path $userData)) {
    New-Item -ItemType Directory -Path $userData -Force | Out-Null
}

Write-Host "Starting Chrome with remote debugging on port 9222..." -ForegroundColor Green
Start-Process -FilePath $chrome -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=`"$userData`""
Write-Host "Done. agent-browser can now connect." -ForegroundColor Green
