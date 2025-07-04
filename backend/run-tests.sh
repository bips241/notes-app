#!/bin/bash

# Notes App - Comprehensive Test Runner
# This script runs all tests and generates reports

echo "🧪 Notes App - Running Comprehensive Tests"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create test results directory
mkdir -p test-results

print_status "Starting test execution..."

# Run unit tests
print_status "Running unit tests..."
npm run test:unit -- --reporters=default --reporters=jest-junit --outputFile=test-results/unit-test-results.xml
UNIT_EXIT_CODE=$?

if [ $UNIT_EXIT_CODE -eq 0 ]; then
    print_success "Unit tests passed!"
else
    print_error "Unit tests failed!"
fi

# Run integration tests
print_status "Running integration tests..."
npm run test:integration -- --reporters=default --reporters=jest-junit --outputFile=test-results/integration-test-results.xml
INTEGRATION_EXIT_CODE=$?

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    print_success "Integration tests passed!"
else
    print_error "Integration tests failed!"
fi

# Run E2E tests
print_status "Running E2E tests..."
npm run test:e2e -- --reporters=default --reporters=jest-junit --outputFile=test-results/e2e-test-results.xml
E2E_EXIT_CODE=$?

if [ $E2E_EXIT_CODE -eq 0 ]; then
    print_success "E2E tests passed!"
else
    print_error "E2E tests failed!"
fi

# Run coverage tests
print_status "Generating test coverage report..."
npm run test:coverage -- --reporters=default --coverageReporters=html --coverageReporters=text --coverageDirectory=test-results/coverage
COVERAGE_EXIT_CODE=$?

if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
    print_success "Coverage report generated!"
else
    print_error "Coverage report generation failed!"
fi

# Generate summary
echo ""
echo "📊 Test Results Summary"
echo "======================="

if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo "✅ Unit Tests: PASSED"
else
    echo "❌ Unit Tests: FAILED"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo "✅ Integration Tests: PASSED"
else
    echo "❌ Integration Tests: FAILED"
fi

if [ $E2E_EXIT_CODE -eq 0 ]; then
    echo "✅ E2E Tests: PASSED"
else
    echo "❌ E2E Tests: FAILED"
fi

if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
    echo "✅ Coverage Report: GENERATED"
else
    echo "❌ Coverage Report: FAILED"
fi

# Overall result
TOTAL_FAILURES=$((UNIT_EXIT_CODE + INTEGRATION_EXIT_CODE + E2E_EXIT_CODE))

if [ $TOTAL_FAILURES -eq 0 ]; then
    print_success "All tests passed! 🎉"
    echo ""
    echo "📁 Test artifacts saved to: test-results/"
    echo "   • Unit test results: test-results/unit-test-results.xml"
    echo "   • Integration test results: test-results/integration-test-results.xml"
    echo "   • E2E test results: test-results/e2e-test-results.xml"
    echo "   • Coverage report: test-results/coverage/index.html"
    exit 0
else
    print_error "Some tests failed. Please check the output above."
    exit 1
fi
