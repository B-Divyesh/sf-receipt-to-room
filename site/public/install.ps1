$ErrorActionPreference = "Stop"
$manifestUrl = "https://github.com/B-Divyesh/sf-receipt-to-room/releases/latest/download/latest.json"
$manifest = Invoke-RestMethod -Uri $manifestUrl
$asset = $manifest.platforms."windows-x86_64"
if (-not $asset) { throw "The Windows installer is not present in the latest release." }
$temporary = Join-Path ([IO.Path]::GetTempPath()) "ReceiptToRoom.msi"
Invoke-WebRequest -Uri $asset.url -OutFile $temporary
$actual = (Get-FileHash -Path $temporary -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $asset.sha256.ToLowerInvariant()) {
  Remove-Item $temporary -Force
  throw "Checksum mismatch; the download was not installed."
}
Write-Host "SHA256 verified. Starting the Receipt to Room installer..."
Write-Host "This release is unsigned, so Windows may ask you to confirm the publisher."
Start-Process msiexec.exe -ArgumentList "/i `"$temporary`"" -Wait
Write-Host "Receipt to Room installation finished."
