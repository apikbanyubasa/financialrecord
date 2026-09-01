# ==============================================================================
# FinancialRecord - Spring Boot Backend Launcher for PowerShell
# ==============================================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " 🚀 Memulai FinancialRecord Backend (Spring Boot 3) " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Deteksi JDK 24 / 21 / 17
$jdkPath = $null

# Cek apakah java command di terminal saat ini adalah JDK
try {
    $javaCmd = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($javaCmd) {
        $parent = Split-Path (Split-Path $javaCmd -Parent) -Parent
        if (Test-Path "$parent\bin\javac.exe") {
            $jdkPath = $parent
        }
    }
} catch {}

# Jika belum ketemu, cari di Program Files
if (-not $jdkPath) {
    $candidates = @(
        "C:\Program Files\Java\jdk-24*",
        "C:\Program Files\Java\jdk-23*",
        "C:\Program Files\Java\jdk-22*",
        "C:\Program Files\Java\jdk-21*",
        "C:\Program Files\Java\jdk-17*",
        "C:\Program Files\Eclipse Adoptium\jdk-24*",
        "C:\Program Files\Eclipse Adoptium\jdk-21*",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Amazon Corretto\jdk24*",
        "C:\Program Files\Amazon Corretto\jdk21*",
        "C:\Program Files\Amazon Corretto\jdk17*",
        "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\jdk*",
        "$env:USERPROFILE\.jdks\*"
    )

    foreach ($pattern in $candidates) {
        $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)\bin\javac.exe" } | Select-Object -First 1
        if ($found) {
            $jdkPath = $found.FullName
            break
        }
    }
}

if ($jdkPath) {
    Write-Host "✅ Menggunakan JDK: $jdkPath" -ForegroundColor Green
    $env:JAVA_HOME = $jdkPath
    $env:PATH = "$jdkPath\bin;$env:PATH"
} else {
    Write-Host "⚠️ Warning: Menggunakan Java bawaan sistem." -ForegroundColor Yellow
}

# 2. Cek Maven
$mavenHome = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-3.9.8"
$mvnCmd = "$mavenHome\bin\mvn.cmd"

if (-not (Test-Path $mvnCmd)) {
    Write-Host "📥 Mengunduh Apache Maven 3.9.8..." -ForegroundColor Yellow
    $zipPath = "$env:TEMP\mvn.zip"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.8/apache-maven-3.9.8-bin.zip" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath "$env:TEMP\mvn-tmp" -Force
    New-Item -ItemType Directory -Force -Path $mavenHome | Out-Null
    Copy-Item -Path "$env:TEMP\mvn-tmp\apache-maven-3.9.8\*" -Destination $mavenHome -Recurse -Force
    Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$env:TEMP\mvn-tmp" -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Jalankan Spring Boot
Write-Host "▶️ Menjalankan Spring Boot..." -ForegroundColor Cyan
& "$mvnCmd" spring-boot:run
