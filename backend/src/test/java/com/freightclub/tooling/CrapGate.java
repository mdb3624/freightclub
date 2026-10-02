package com.freightclub.tooling;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Build-time gate (not a JUnit test): joins PMD's per-method CyclomaticComplexity
 * report with JaCoCo's per-method branch coverage report and fails the build if
 * any method's CRAP score (Change Risk Anti-Pattern: cc^2 * (1-coverage)^3 + cc)
 * exceeds the configured threshold.
 *
 * Bound to the `test` Maven phase (same phase as JaCoCo's check goal) via
 * exec-maven-plugin so this can never go dead the way the coverage gate did when
 * it was bound to `verify`, a phase nothing ever invoked.
 *
 * Threshold default (100) is set from the real baseline scanned 2026-09-09: every
 * legitimate method in the codebase scored <= 58.5; only a genuinely untested,
 * duplicated state-mapping method scored above it (2162). See CHG-871.
 */
public final class CrapGate {

    private static final Pattern VIOLATION = Pattern.compile(
            "<violation ([^>]*?)>(.*?)</violation>", Pattern.DOTALL);
    private static final Pattern ATTR_METHOD = Pattern.compile("method=\"([^\"]*)\"");
    private static final Pattern ATTR_CLASS = Pattern.compile("class=\"([^\"]*)\"");
    private static final Pattern ATTR_PACKAGE = Pattern.compile("package=\"([^\"]*)\"");
    private static final Pattern ATTR_LINE = Pattern.compile("beginline=\"(\\d+)\"");
    private static final Pattern ATTR_RULE = Pattern.compile("rule=\"([^\"]*)\"");
    private static final Pattern CC_IN_MESSAGE = Pattern.compile("complexity of (\\d+)");

    private static final Pattern CLASS_BLOCK = Pattern.compile(
            "<class name=\"([^\"]+)\"[^>]*>(.*?)</class>", Pattern.DOTALL);
    private static final Pattern METHOD_BLOCK = Pattern.compile(
            "<method name=\"([^\"]*)\"[^>]*line=\"(\\d+)\">(.*?)</method>", Pattern.DOTALL);
    private static final Pattern BRANCH_COUNTER = Pattern.compile(
            "<counter type=\"BRANCH\" missed=\"(\\d+)\" covered=\"(\\d+)\"/>");
    private static final Pattern INSTRUCTION_COUNTER = Pattern.compile(
            "<counter type=\"INSTRUCTION\" missed=\"(\\d+)\" covered=\"(\\d+)\"/>");

    private record ComplexMethod(String fqcn, String method, int line, int cc) {
    }

    private record CrapResult(ComplexMethod method, double coverage, double crap) {
    }

    public static void main(String[] args) throws IOException {
        double threshold = Double.parseDouble(System.getProperty("crap.threshold", "100"));
        Path pmdReport = Path.of(System.getProperty("crap.pmdReport", "target/pmd.xml"));
        Path jacocoReport = Path.of(System.getProperty("crap.jacocoReport", "target/site/jacoco/jacoco.xml"));

        if (!Files.exists(pmdReport) || !Files.exists(jacocoReport)) {
            System.out.println("[CrapGate] Skipping — report(s) not found (pmd=" + Files.exists(pmdReport)
                    + ", jacoco=" + Files.exists(jacocoReport) + "). Nothing to check on this invocation.");
            return;
        }

        String pmdXml = Files.readString(pmdReport);
        String jacocoXml = Files.readString(jacocoReport);

        List<ComplexMethod> flagged = parseComplexMethods(pmdXml);
        List<CrapResult> results = new ArrayList<>();
        List<ComplexMethod> unmatched = new ArrayList<>();

        for (ComplexMethod m : flagged) {
            Double coverage = findCoverage(jacocoXml, m);
            if (coverage == null) {
                unmatched.add(m);
                continue;
            }
            double crap = m.cc() * m.cc() * Math.pow(1 - coverage, 3) + m.cc();
            results.add(new CrapResult(m, coverage, crap));
        }

        results.sort((a, b) -> Double.compare(b.crap(), a.crap()));

        System.out.println("[CrapGate] " + results.size() + " method(s) at/above complexity threshold, CRAP threshold="
                + threshold);
        List<CrapResult> violations = new ArrayList<>();
        for (CrapResult r : results) {
            boolean over = r.crap() > threshold;
            if (over) {
                violations.add(r);
            }
            System.out.printf("  %s CRAP=%.1f  cc=%d  cov=%.1f%%  %s.%s%n",
                    over ? "[FAIL]" : "[ ok ]", r.crap(), r.method().cc(), r.coverage() * 100,
                    r.method().fqcn(), r.method().method());
        }
        for (ComplexMethod m : unmatched) {
            System.out.println("  [warn] no coverage data found for " + m.fqcn() + "." + m.method()
                    + " (excluded class, generated code, or line-number mismatch) — not gated");
        }

        if (!violations.isEmpty()) {
            StringBuilder msg = new StringBuilder("CRAP gate failed — " + violations.size()
                    + " method(s) exceed CRAP threshold " + threshold + ":\n");
            for (CrapResult r : violations) {
                msg.append("  - ").append(r.method().fqcn()).append('.').append(r.method().method())
                        .append(" (CRAP=").append(String.format("%.1f", r.crap()))
                        .append(", cc=").append(r.method().cc())
                        .append(", coverage=").append(String.format("%.1f%%", r.coverage() * 100))
                        .append(")\n");
            }
            msg.append("Fix: low coverage -> add tests first (usually resolves CRAP on its own); ")
                    .append("high coverage + high complexity -> decompose the method. ")
                    .append("Out of scope for the current change? File a CHG-### per the Change Request Protocol ")
                    .append("rather than suppressing.");
            throw new IllegalStateException(msg.toString());
        }
    }

    private static List<ComplexMethod> parseComplexMethods(String pmdXml) {
        List<ComplexMethod> out = new ArrayList<>();
        Matcher m = VIOLATION.matcher(pmdXml);
        while (m.find()) {
            String attrs = m.group(1);
            String message = m.group(2);

            Matcher ruleM = ATTR_RULE.matcher(attrs);
            if (!ruleM.find() || !"CyclomaticComplexity".equals(ruleM.group(1))) {
                continue;
            }
            Matcher methodM = ATTR_METHOD.matcher(attrs);
            if (!methodM.find()) {
                // class-level aggregate violation (no `method` attribute) — not gated here,
                // tracked separately as architecture debt (see CHG-871 notes).
                continue;
            }
            Matcher classM = ATTR_CLASS.matcher(attrs);
            Matcher pkgM = ATTR_PACKAGE.matcher(attrs);
            Matcher lineM = ATTR_LINE.matcher(attrs);
            Matcher ccM = CC_IN_MESSAGE.matcher(message);
            if (!classM.find() || !pkgM.find() || !lineM.find() || !ccM.find()) {
                continue;
            }
            String fqcn = pkgM.group(1) + "." + classM.group(1);
            out.add(new ComplexMethod(fqcn, methodM.group(1), Integer.parseInt(lineM.group(1)),
                    Integer.parseInt(ccM.group(1))));
        }
        return out;
    }

    private static Double findCoverage(String jacocoXml, ComplexMethod target) {
        String slashName = target.fqcn().replace('.', '/');
        Matcher classM = CLASS_BLOCK.matcher(jacocoXml);
        while (classM.find()) {
            if (!classM.group(1).equals(slashName)) {
                continue;
            }
            String classBody = classM.group(2);
            Matcher methodM = METHOD_BLOCK.matcher(classBody);
            Double best = null;
            int bestDelta = Integer.MAX_VALUE;
            while (methodM.find()) {
                if (!methodM.group(1).equals(target.method())) {
                    continue;
                }
                int line = Integer.parseInt(methodM.group(2));
                String methodBody = methodM.group(3);
                Double coverage = coverageFrom(methodBody);
                if (coverage == null) {
                    continue;
                }
                int delta = Math.abs(line - target.line());
                if (delta < bestDelta) {
                    bestDelta = delta;
                    best = coverage;
                }
            }
            return best;
        }
        return null;
    }

    private static Double coverageFrom(String methodBody) {
        Matcher branch = BRANCH_COUNTER.matcher(methodBody);
        if (branch.find()) {
            int missed = Integer.parseInt(branch.group(1));
            int covered = Integer.parseInt(branch.group(2));
            int total = missed + covered;
            return total == 0 ? 1.0 : (double) covered / total;
        }
        Matcher instr = INSTRUCTION_COUNTER.matcher(methodBody);
        if (instr.find()) {
            int missed = Integer.parseInt(instr.group(1));
            int covered = Integer.parseInt(instr.group(2));
            int total = missed + covered;
            return total == 0 ? 1.0 : (double) covered / total;
        }
        return null;
    }

    private CrapGate() {
    }
}
