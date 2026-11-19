$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
function Read-TaskPassword([string]$label) {
    $secure = Read-Host $label -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
if (-not $env:DASHBOARD_PASSWORD) { $env:DASHBOARD_PASSWORD = Read-TaskPassword 'Crea la clave del cuidador (minimo 16 caracteres)' }
if (-not $env:DEVICE_PASSWORD) { $env:DEVICE_PASSWORD = Read-TaskPassword 'Crea otra clave para el baston (minimo 16 caracteres)' }
$jar = Join-Path $PSScriptRoot 'target\smart-blind-stick-0.0.1-SNAPSHOT.jar'
if (-not (Test-Path -LiteralPath $jar)) {
    Write-Host 'Compilando por primera vez... Necesitas un JDK 17 o superior.'
    & .\mvnw.cmd -B verify
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar. Revisa JAVA_HOME y la conexion a Internet.' }
}
$javaCmd = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' } else { 'java.exe' }
Write-Host 'Abre http://localhost:8080/ e inicia sesion como cuidador.'
Write-Host 'Esta prueba local requiere que la computadora permanezca encendida. Deten con Ctrl+C.'
& $javaCmd -jar $jar
