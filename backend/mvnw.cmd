@REM Maven wrapper script for Windows
@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF)
@REM ----------------------------------------------------------------------------
@echo off
set JAVA_EXEC=java
if not "%JAVA_HOME%"=="" set JAVA_EXEC=%JAVA_HOME%\bin\java

"%JAVA_EXEC%" -classpath "%~dp0.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=%~dp0" org.apache.maven.wrapper.MavenWrapperMain %*
