# Notes App - Testing Documentation

## Overview

This document describes the comprehensive testing structure for the Notes App backend. The testing suite includes unit tests, integration tests, and end-to-end (E2E) tests to ensure code quality and functionality.

## Testing Structure

```
tests/
├── unit/                   # Unit tests for individual components
│   ├── user.model.test.js  # User model tests
│   └── note.model.test.js  # Note model tests
├── integration/            # Integration tests for API endpoints
│   ├── auth.routes.test.js # Authentication routes tests
│   └── notes.routes.test.js# Notes routes tests
├── e2e/                    # End-to-end workflow tests
│   └── user-journey.test.js# Complete user journey tests
└── helpers/                # Test utilities and helpers
    ├── setup.js           # Global test setup and teardown
    └── factory.js         # Test data factory
```

## Test Categories

### Unit Tests
- **Purpose**: Test individual components in isolation
- **Scope**: Models, services, utilities
- **Database**: In-memory MongoDB
- **Coverage**: Business logic, validation, methods

### Integration Tests
- **Purpose**: Test API endpoints and their interactions
- **Scope**: Controllers, routes, middleware
- **Database**: In-memory MongoDB
- **Coverage**: HTTP requests/responses, authentication, authorization

### End-to-End Tests
- **Purpose**: Test complete user workflows
- **Scope**: Full application stack
- **Database**: In-memory MongoDB
- **Coverage**: User journeys, complex scenarios

## Test Configuration

### Jest Configuration
- **Environment**: Node.js
- **Timeout**: 30 seconds
- **Coverage**: Source files in `src/` directory
- **Setup**: Automated database setup/teardown
- **Mocking**: Automatic mock clearing between tests

### Database Setup
- **Type**: MongoDB Memory Server
- **Isolation**: Each test gets a clean database
- **Connection**: Automatic setup and teardown
- **Data**: Test factories for consistent data creation

## Running Tests

### Individual Test Types
```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Comprehensive Test Runner
```bash
# Run all tests with detailed reporting
./run-tests.sh
```

This script will:
- Run all test categories
- Generate coverage reports
- Create test result files
- Provide a summary of results

## Test Data Management

### Test Factories
The `TestFactory` class provides methods to create consistent test data:

```javascript
// Create test user with token
const user = await testFactory.createUser();

// Create test admin
const admin = await testFactory.createAdmin();

// Create test note
const note = await testFactory.createNote(userId);

// Create multiple users/notes
const users = await testFactory.createMultipleUsers(3);
const notes = await testFactory.createMultipleNotes(userId, 5);
```

### Test Helpers
Global test helpers are available in all tests:

```javascript
// Generate JWT token
const token = testHelpers.generateToken(userId, 'admin');

// Create test user data
const userData = testHelpers.createTestUser();

// Create test note data
const noteData = testHelpers.createTestNote(userId);
```

## Test Coverage

### Coverage Targets
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage Reports
Coverage reports are generated in multiple formats:
- **Console**: Summary in terminal
- **HTML**: Detailed interactive report
- **LCOV**: For CI/CD integration

## Test Scenarios

### Authentication Tests
- User registration with validation
- User login with various scenarios
- Profile management
- Token-based authentication
- Role-based access control

### Notes Management Tests
- CRUD operations for notes
- Search and filtering
- Tag management
- Archive/unarchive functionality
- Pagination and sorting

### Sharing Tests
- Note sharing with permissions
- Sharing restrictions
- Access control validation
- Shared notes retrieval

### Admin Tests
- User management
- Analytics data retrieval
- System administration functions
- Sharing restrictions management

### User Journey Tests
- Complete registration-to-usage flows
- Multi-user collaboration scenarios
- Admin management workflows
- Complex sharing scenarios

## Best Practices

### Test Writing
1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear sections
3. **Isolation**: Each test should be independent
4. **Data Cleanup**: Use beforeEach/afterEach for clean state
5. **Error Testing**: Test both success and failure cases

### Test Data
1. **Factories**: Use factories for consistent test data
2. **Realistic Data**: Use realistic but safe test data
3. **Edge Cases**: Test boundary conditions
4. **Invalid Data**: Test validation with invalid inputs

### Performance
1. **Fast Tests**: Keep tests fast and focused
2. **Parallel Execution**: Tests run in parallel when possible
3. **Memory Management**: Clean up resources properly
4. **Timeouts**: Use appropriate timeouts for async operations

## Continuous Integration

### CI/CD Integration
The test suite is designed for CI/CD integration:
- **Exit Codes**: Proper exit codes for success/failure
- **XML Reports**: JUnit-compatible XML output
- **Coverage Data**: LCOV format for coverage tools
- **Artifacts**: Test results and coverage reports

### Pre-commit Hooks
Recommended pre-commit hooks:
```bash
# Run tests before commit
npm test

# Run linting
npm run lint

# Check test coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB Memory Server starts correctly
2. **Port Conflicts**: Tests use port 3001 by default
3. **Memory Issues**: Clean up large test data sets
4. **Timeouts**: Increase timeout for slow operations

### Debug Mode
Run tests with debugging:
```bash
# Enable verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/user.model.test.js

# Run with debugging
NODE_ENV=test DEBUG=* npm test
```

## Contributing

### Adding New Tests
1. Follow the existing test structure
2. Use appropriate test category (unit/integration/e2e)
3. Use test factories for data creation
4. Include both positive and negative test cases
5. Update this documentation if needed

### Test Review Checklist
- [ ] Tests are categorized correctly
- [ ] Test names are descriptive
- [ ] Both success and failure cases are covered
- [ ] Test data is created using factories
- [ ] Tests are independent and isolated
- [ ] Documentation is updated if needed

---

**Last Updated**: 7/4/2025
**Test Framework**: Jest
**Database**: MongoDB Memory Server
**Coverage Tool**: Istanbul/NYC
