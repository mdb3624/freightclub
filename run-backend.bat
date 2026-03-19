@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d C:\projects\freightclub\backend
call mvnw.cmd spring-boot:run
