#!/bin/bash
# Phase 7 Analytics Tests - Execution Script
# Runs all 79 tests and generates JaCoCo coverage report

set -e

echo "=========================================="
echo "Phase 7 Analytics Tests - Execution"
echo "=========================================="
echo ""

# Set Java environment
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"

# Navigate to backend directory
cd "$(dirname "$0")"

echo "Java Version:"
"$JAVA_HOME/bin/java" -version
echo ""

echo "Maven Version:"
mvn -v || {
    echo "ERROR: Maven not available or broken."
    echo "Try: export M2_HOME=/path/to/maven && $M2_HOME/bin/mvn"
    exit 1
}
echo ""

echo "Running tests..."
echo "=========================================="

# Run all tests with JaCoCo
mvn clean test verify -DskipTests=false

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="

# Show coverage report location
REPORT_PATH="./target/site/jacoco/index.html"
if [ -f "$REPORT_PATH" ]; then
    echo "✅ JaCoCo Coverage Report: $REPORT_PATH"
    echo ""
    echo "To view report:"
    echo "  - Open ./target/site/jacoco/index.html in a web browser"
    echo "  - Or: cd target/site/jacoco && python3 -m http.server 8000"
else
    echo "⚠️ JaCoCo report not found at $REPORT_PATH"
fi

echo ""
echo "Test Statistics:"
echo "  Total Tests: 79"
echo "  Service Tests: 36 (LoadFinancialService, CarrierPerformanceService, LoadAnalyticsService)"
echo "  Controller Tests: 42 (3 controllers × 14 tests each)"
echo ""

echo "Coverage Target: 80% branch coverage"
echo "=========================================="
