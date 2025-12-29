# PowerShell script to create a Windows Service for the Node.js app
# Usage: Run this script from the application folder with elevated privileges (Run as Administrator)

$serviceName = "VideoDownloader"
$displayName = "VidéoDownloader SaaS"

try {
    $nodeCmd = Get-Command node -ErrorAction Stop
    $nodePath = $nodeCmd.Source
} catch {
    Write-Error "Node.js executable not found in PATH. Install Node.js and ensure 'node' is in PATH."
    exit 1
}

# Resolve full path to server.js
$appPath = (Resolve-Path .\server.js).Path

$binPath = "\"$nodePath\" \"$appPath\""

Write-Host "Creating service '$serviceName' using: $binPath"

# Create the service (overwrite if exists)
$exists = (sc.exe query "$serviceName" 2>$null) -ne $null
if ($exists) {
    Write-Host "Service already exists. Attempting to delete existing service..."
    sc.exe delete "$serviceName" | Out-Null
    Start-Sleep -Seconds 1
}

$create = sc.exe create "$serviceName" binPath= $binPath DisplayName= "$displayName" start= auto
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create service. sc.exe exit code: $LASTEXITCODE"
    exit 1
}

Write-Host "Service created. You can start it with: Start-Service -Name $serviceName or 'sc start $serviceName'"
Write-Host "To view logs, configure the service to write stdout/stderr to files or run the app interactively for debugging."
