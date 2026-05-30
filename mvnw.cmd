@echo off
setlocal
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_OPTS=%MAVEN_OPTS%
"%JAVA_HOME%\bin\java" -jar "%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar" %*
endlocal