@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Windows
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableExtensions EnableDelayedExpansion

set ERROR_CODE=0
if "%HOME%" == "" (set "HOME=%USERPROFILE%")

@REM Explicitly lock to installed JDK 24
if exist "C:\Program Files\Java\jdk-24\bin\javac.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-24"
    set "PATH=C:\Program Files\Java\jdk-24\bin;!PATH!"
)

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.8

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [Maven Wrapper] Downloading Apache Maven 3.9.8...
    if not exist "%TEMP%\mvn-tmp" mkdir "%TEMP%\mvn-tmp"
    if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"

    curl -sSL "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.8/apache-maven-3.9.8-bin.zip" -o "%TEMP%\mvn-tmp\mvn.zip"
    tar -xf "%TEMP%\mvn-tmp\mvn.zip" -C "%TEMP%\mvn-tmp"
    xcopy "%TEMP%\mvn-tmp\apache-maven-3.9.8\*" "%MAVEN_HOME%\" /E /I /Y
    rd /s /q "%TEMP%\mvn-tmp"
)

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    echo Error: Could not locate Maven in %MAVEN_HOME%
    exit /b 1
)
