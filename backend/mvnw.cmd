@REM Licensed to the Apache Software Foundation (ASF)
@REM Maven Wrapper script for Windows
@echo off

@setlocal

set WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@REM Check if JAVA_HOME is set
if not "%JAVA_HOME%"=="" goto javaHomeSet
set JAVACMD=java
goto :checkJavaCmd

:javaHomeSet
set JAVACMD="%JAVA_HOME%\bin\java"

:checkJavaCmd
%JAVACMD% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto :init
echo Error: JAVA_HOME is not set and java is not in PATH
exit /b 1

:init
@REM Check if maven-wrapper.jar exists, download if not
if exist %WRAPPER_JAR% goto :runWrapper

echo Downloading Maven Wrapper...
@REM Download wrapper jar
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR% }"

:runWrapper
@REM Find project base dir
set MAVEN_PROJECTBASEDIR=%~dp0

%JAVACMD% ^
  -jar %WRAPPER_JAR% %*

if ERRORLEVEL 1 goto :error
goto :end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /b %ERROR_CODE%
