# Serves the built Resonance site on http://localhost and opens it in the default browser.
# Uses only what ships with Windows (PowerShell and .NET HttpListener); nothing is installed.
param(
  [string]$Root = (Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) 'output\vercel-site\public'),
  [int]$Port = 8767,
  [switch]$NoBrowser,
  [switch]$Fallback
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath (Join-Path $Root 'index.html'))) {
  Write-Host 'Site dosyaları bulunamadı (output\vercel-site\public). Python kuruluysa önce şunu çalıştır: python integrations\web\build.py'
  Write-Host 'The built site was not found. With Python installed, run: python integrations\web\build.py'
  exit 1
}
$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\', '/')
$RootPrefix = $Root + [IO.Path]::DirectorySeparatorChar
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.txt' = 'text/plain; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.ico' = 'image/x-icon'; '.woff2' = 'font/woff2'
}
function Resolve-SiteFile([string]$target) {
  # Map a request path to a file inside the site folder; anything outside it is a 404.
  $relative = [Uri]::UnescapeDataString(($target -split '\?')[0]).TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
  $file = [IO.Path]::GetFullPath([IO.Path]::Combine($Root, $relative))
  if ($file -ne $Root -and -not $file.StartsWith($RootPrefix, [StringComparison]::OrdinalIgnoreCase)) { $file = '' }
  elseif (Test-Path -LiteralPath $file -PathType Container) { $file = [IO.Path]::Combine($file, 'index.html') }
  if ($file -and (Test-Path -LiteralPath $file -PathType Leaf)) { return @(200, $file) }
  return @(404, [IO.Path]::Combine($Root, '404.html'))
}
function Get-ContentType([string]$file) {
  $type = $types[[IO.Path]::GetExtension($file).ToLowerInvariant()]
  if ($type) { return $type } else { return 'application/octet-stream' }
}
function Open-Site([string]$url) {
  Write-Host ''
  Write-Host "  Resonance açık: $url"
  Write-Host '  Oynarken bu pencereyi açık bırak. Kapatınca site de kapanır.'
  Write-Host "  Resonance is running at $url  (close this window to stop)"
  Write-Host ''
  if (-not $NoBrowser) { try { Start-Process $url } catch { Write-Host "Tarayıcıda şu adresi aç: $url" } }
}
# First choice: the Windows HTTP listener on localhost. Take the first free port, so another local server does not block the start.
$listener = $null
if (-not $Fallback) {
  for ($p = $Port; $p -lt $Port + 20; $p++) {
    $candidate = New-Object System.Net.HttpListener
    $candidate.Prefixes.Add("http://localhost:$p/")
    try { $candidate.Start(); $listener = $candidate; $Port = $p; break } catch { $candidate.Close() }
  }
}
if ($listener) {
  Open-Site "http://localhost:$Port/"
  try {
    while ($listener.IsListening) {
      $context = $listener.GetContext()
      $response = $context.Response
      try {
        $status, $file = Resolve-SiteFile $context.Request.Url.AbsolutePath
        $bytes = [IO.File]::ReadAllBytes($file)
        $response.StatusCode = $status
        $response.ContentType = Get-ContentType $file
        $response.Headers['Cache-Control'] = 'no-cache'
        $response.Headers['X-Content-Type-Options'] = 'nosniff'
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } catch { try { $response.StatusCode = 500 } catch {} } finally { $response.Close() }
    }
  } finally { $listener.Stop() }
  exit 0
}
# Fallback for machines where that listener needs administrator rights: a plain socket on 127.0.0.1, which never does.
$server = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
  try { $candidate = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p); $candidate.Start(); $server = $candidate; $Port = $p; break } catch {}
}
if (-not $server) { Write-Host "8767-8786 arasında boş port yok. Diğer yerel sunucuları kapatıp tekrar dene."; exit 1 }
Open-Site "http://127.0.0.1:$Port/"
$reasons = @{ 200 = 'OK'; 404 = 'Not Found' }
try {
  while ($true) {
    $client = $server.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      # Short timeout: a browser may open a spare connection and send nothing on it.
      $stream.ReadTimeout = 1500
      $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
      $request = $reader.ReadLine()
      while ($true) { $line = $reader.ReadLine(); if ($null -eq $line -or $line -eq '') { break } }
      $parts = "$request" -split ' '
      if ($parts.Count -lt 2) { continue }
      $status, $file = Resolve-SiteFile $parts[1]
      $bytes = [IO.File]::ReadAllBytes($file)
      $head = "HTTP/1.1 $status $($reasons[$status])`r`nContent-Type: $(Get-ContentType $file)`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n"
      $headBytes = [Text.Encoding]::ASCII.GetBytes($head)
      $stream.Write($headBytes, 0, $headBytes.Length)
      if ($parts[0] -ne 'HEAD') { $stream.Write($bytes, 0, $bytes.Length) }
      $stream.Flush()
    } catch {} finally { $client.Close() }
  }
} finally { $server.Stop() }
