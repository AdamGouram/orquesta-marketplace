# Genera dist/orquesta.zip para "Upload plugin" en claude.ai y Cowork.
# Deja fuera las evals, que solo sirven para desarrollar. Las rutas del zip
# van con "/" para que se lean bien fuera de Windows.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$raiz = Split-Path -Parent $PSScriptRoot
$origen = (Resolve-Path (Join-Path $raiz 'plugins\orquesta')).Path
$dist = Join-Path $raiz 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist 'orquesta.zip'
if (Test-Path $zip) { Remove-Item -Force -LiteralPath $zip }

$archivo = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
  Get-ChildItem -LiteralPath $origen -Recurse -File -Force | ForEach-Object {
    $relativa = $_.FullName.Substring($origen.Length + 1).Replace('\', '/')
    if (-not $relativa.StartsWith('evals/')) {
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archivo, $_.FullName, $relativa) | Out-Null
    }
  }
} finally {
  $archivo.Dispose()
}
Write-Output "Creado $zip"
