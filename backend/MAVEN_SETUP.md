# Maven Setup - Permanent Solution

## Problem Solved

**Issue:** Maven failed with `ClassNotFoundException: org.codehaus.plexus.classworlds.launcher.Launcher`

**Root Cause:** POSIX paths (`/c/tools/...`) were being converted to invalid Windows paths (`\c\tools\...`)

**Solution:** Use Windows native paths and the `.cmd` batch file instead of the bash script

---

## Permanent Fix

### Environment Variables (Set These Once)
```bash
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot"
export MAVEN_HOME="C:/tools/apache-maven-3.9.9"
export PATH="$MAVEN_HOME/bin:$PATH"
```

### Correct Maven Command
```bash
"$MAVEN_HOME/bin/mvn.cmd" clean verify -DskipTests=false
```

### Key Rules
1. ✅ **Use Windows paths:** `C:/...` NOT `/c/...`
2. ✅ **Use `.cmd` file:** `mvn.cmd` NOT `mvn` script
3. ✅ **Set MAVEN_HOME:** Environment variable must point to Maven directory
4. ✅ **Use `mvn.cmd`:** The batch file handles Windows paths correctly

### Why This Works

- **Windows paths** (`C:/tools/...`) are correctly converted by Java
- **POSIX paths** (`/c/tools/...`) are incorrectly converted to `\c\tools\...` (invalid)
- **`.cmd` batch file** properly handles Windows environment and paths
- **bash script** (`mvn`) has issues with spaces in JAVA_HOME paths

---

## Quick Reference

### One-Liner for Testing
```bash
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot" && export MAVEN_HOME="C:/tools/apache-maven-3.9.9" && cd C:/projects/freightclub/backend && "$MAVEN_HOME/bin/mvn.cmd" clean verify -DskipTests=false
```

### Running Tests Only
```bash
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot" && export MAVEN_HOME="C:/tools/apache-maven-3.9.9" && cd C:/projects/freightclub/backend && "$MAVEN_HOME/bin/mvn.cmd" test
```

### Running With JaCoCo Coverage Report
```bash
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot" && export MAVEN_HOME="C:/tools/apache-maven-3.9.9" && cd C:/projects/freightclub/backend && "$MAVEN_HOME/bin/mvn.cmd" clean verify -DskipTests=false
```

Then view report: `C:/projects/freightclub/backend/target/site/jacoco/index.html`

---

## Verification

Test that Maven works:
```bash
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot"
export MAVEN_HOME="C:/tools/apache-maven-3.9.9"
"$MAVEN_HOME/bin/mvn.cmd" -v
```

Expected output:
```
Apache Maven 3.9.9
Maven home: C:\tools\apache-maven-3.9.9
Java version: 21.0.10
```

---

## Why NOT To Use
- ❌ `/c/tools/apache-maven-3.9.9/bin/mvn` - Wrong path format
- ❌ `./mvnw` - Wrapper has classpath issues
- ❌ System `mvn` command - May not resolve correct classpath
- ❌ Direct Java classpath - Requires full complex configuration

---

## If Issues Persist

1. Verify paths with forward slashes only in environment variables
2. Use `"$MAVEN_HOME/bin/mvn.cmd"` with quotes (for spaces in JAVA_HOME)
3. Check that Maven is installed at `C:/tools/apache-maven-3.9.9`
4. Ensure JAVA_HOME points to a valid Java 21 installation
5. Run from the exact directory: `C:/projects/freightclub/backend`

---

**This solution is permanent and requires NO changes to Maven installation or configuration files.**

Last Updated: 2026-05-28
