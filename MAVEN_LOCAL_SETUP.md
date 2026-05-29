# FreightClub Maven Setup — Local Installation

## What Changed

We've updated the build system to use the local Maven installation at `C:\tools\apache-maven-3.9.9` instead of the Maven Wrapper. This avoids network/download issues and provides a cleaner build experience in VS Code.

---

## Prerequisites

Verify these are installed on your machine:

```powershell
# Check Java
java -version
# Expected: Java 21 (Adoptium or similar)

# Check Maven
C:\tools\apache-maven-3.9.9\bin\mvn.cmd -v
# Expected: Apache Maven 3.9.9
```

If either is missing, contact your team lead.

---

## How to Build

### In VS Code (Recommended)

1. **Open the project:**
   ```powershell
   code C:\projects\freightclub
   ```

2. **Run the default build:**
   - Press **Ctrl+Shift+B**
   - Output appears in Terminal panel at bottom
   - Wait for `BUILD SUCCESS` message

3. **Run other tasks:**
   - Press **Ctrl+Shift+P**
   - Type: `Tasks: Run Task`
   - Choose:
     - `BuildBackend` — Build only
     - `BuildBackend + Tests` — Build + tests
     - `Test Backend` — Tests only
     - `Coverage Report` — JaCoCo coverage

### From Command Line

```powershell
cd C:\projects\freightclub\backend

# Build only (no tests)
C:\tools\apache-maven-3.9.9\bin\mvn.cmd clean package -DskipTests

# Build + Tests
C:\tools\apache-maven-3.9.9\bin\mvn.cmd clean verify

# Tests only
C:\tools\apache-maven-3.9.9\bin\mvn.cmd test

# Coverage report
C:\tools\apache-maven-3.9.9\bin\mvn.cmd clean verify -Djacoco.skip=false
```

---

## Configuration Files

- **VS Code tasks:** `.vscode/tasks.json` — defines all build tasks
- **Maven config:** `backend/pom.xml` — project configuration
- **Backend folder:** `backend/` — run all Maven commands here

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Command not found` | Use full path: `C:\tools\apache-maven-3.9.9\bin\mvn.cmd` |
| `Java version error` | Verify `java -version` shows Java 21 |
| `BUILD FAILURE` | Check console output for error details; run `mvn clean` first |
| `Tests fail locally` | Ensure backend DB is accessible; check connection strings in `application.yml` |
| `VS Code task not visible` | Close and reopen folder: `code .` in `C:\projects\freightclub` |

---

## Notes

- ✅ No wrapper jar downloads needed
- ✅ Uses existing Maven installation
- ✅ All builds run from `backend/` directory
- ✅ Test coverage enforced at 70%+ (JaCoCo)

---

**Questions?** Contact the team lead or check this guide.

Last Updated: 2026-05-29
