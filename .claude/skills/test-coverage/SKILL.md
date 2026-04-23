# Test Coverage

Run all backend tests and ensure at least 70% line coverage. If coverage is below 70%, write or update tests until the gate passes.

## Exclusions

DTOs (`com/freightclub/dto/**`), domain/entity classes (`com/freightclub/domain/**`), exception classes (`com/freightclub/exception/**`), and the main application bootstrap class are excluded from coverage calculations — do NOT write tests for these.

## Steps

### 1. Run tests and generate the JaCoCo coverage report

```bash
cd /c/projects/freightclub
/c/tools/apache-maven-3.9.9/bin/mvn test -f backend/pom.xml
```

This runs all tests and writes the JaCoCo XML report to:
`backend/target/site/jacoco/jacoco.xml`

### 2. Parse the coverage report

Read `backend/target/site/jacoco/jacoco.xml` and extract LINE coverage per package/class. Calculate:

```
covered_ratio = covered / (covered + missed)   for LINE counters
```

Ignore any `<package>` whose name starts with:
- `com/freightclub/dto`
- `com/freightclub/domain`
- `com/freightclub/exception`

Also ignore `FreightclubBackendApplication`.

Report overall covered ratio and list every class below 70%.

### 3. If overall coverage is already ≥ 70%

Report success and stop. Example:

```
Coverage: 74.3% ✓ (gate: 70%)
All classes meet the coverage threshold.
```

### 4. If overall coverage is < 70% — write tests to close the gap

For each class below 70%, prioritise by gap size (largest gap first):

a. **Find the existing test file**, if any, under `backend/src/test/java/`. The test class mirrors the source path — e.g. `src/main/java/com/freightclub/load/LoadService.java` → `src/test/java/com/freightclub/load/LoadServiceTest.java`.

b. **Read the source class** to understand what needs covering.

c. **Read the existing test file** (if present) to understand what is already tested and avoid duplication.

d. **Write targeted tests** that cover the uncovered lines. Rules:
   - Use JUnit 5 + Mockito (already on the classpath via `spring-boot-starter-test`).
   - Use `@ExtendWith(MockitoExtension.class)` for unit tests; use `@SpringBootTest` + H2 only when the class genuinely requires the Spring context.
   - Constructor-inject all dependencies — the project uses constructor injection throughout.
   - `LoadService` takes 7 constructor params: `LoadRepository`, `UserRepository`, `DocumentService`, `RatingService`, `ClaimRepository`, `LoadEventRepository`, `NotificationService` — mock all of them.
   - Do NOT test DTOs, domain/entity fields, or exception constructors.
   - Keep tests focused: one behaviour per test method, descriptive names (`should_returnLoad_whenValidIdProvided`).
   - Do not add comments or Javadoc unless the logic is genuinely non-obvious.

e. **Edit or create** the test file using the Edit/Write tool.

### 5. Re-run tests after writing new/updated tests

```bash
/c/tools/apache-maven-3.9.9/bin/mvn test -f backend/pom.xml
```

Re-parse `backend/target/site/jacoco/jacoco.xml` and repeat step 3/4 until overall coverage ≥ 70% or no further progress can be made without touching excluded classes.

### 6. Run the full verify phase to confirm the JaCoCo gate passes

```bash
/c/tools/apache-maven-3.9.9/bin/mvn verify -f backend/pom.xml
```

A `BUILD SUCCESS` here means the 70% gate enforced in `pom.xml` has been met.

### 7. Report final status

Print a summary table:

```
Class                          Before   After
----------------------------------------------
LoadService                    58%      73%
NotificationService            51%      71%
...

Overall coverage: 72.1%  ✓
Gate: BUILD SUCCESS
```

If the build still fails after writing tests, explain which classes remain below threshold and why they cannot be covered without integration infrastructure (e.g. database, external service), and recommend next steps.
