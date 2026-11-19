$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not $env:SMARTBLIND_API_URL) { $env:SMARTBLIND_API_URL = Read-Host 'URL completa (https://TU-SITIO/api/sensor o http://localhost:8080/api/sensor)' }
if (-not $env:ARDUINO_PORT) { $env:ARDUINO_PORT = Read-Host 'Puerto del Arduino (ejemplo COM5)' }
if (-not $env:DEVICE_PASSWORD) {
    $secure = Read-Host 'Clave del baston configurada en el servidor' -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $env:DEVICE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
& python arduino_bridge.py
