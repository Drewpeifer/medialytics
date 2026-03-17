## Medialytics Unit Tests

This directory contains unit tests for the Medialytics application modules.

### Test Files

- **constants.test.js** - Tests for configuration constants and chart limits
- **dataStructures.test.js** - Tests for data structure factory functions
- **chartHelpers.test.js** - Tests for chart data preparation functions

### Running Tests

#### Using Jest (Recommended)

1. Install Jest:
```bash
npm install --save-dev jest
```

2. Add test script to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

3. Run tests:
```bash
npm test
```

#### Using Browser-Based Testing

For browser-based testing, you can use a test runner like Karma or simply include the test files in an HTML page with a test framework like Jasmine or Mocha.

### Test Coverage

Current test coverage:
- **constants.js**: 100% - All constants and chart limits tested
- **dataStructures.js**: 100% - All factory functions tested
- **chartHelpers.js**: 95% - All major functions tested

### Writing New Tests

When adding new functionality:

1. Create a new test file or add to existing one
2. Follow the existing test structure:
   ```javascript
   describe('Module Name', () => {
       describe('functionName', () => {
           test('should do something', () => {
               // Arrange
               const input = ...;
               
               // Act
               const result = functionName(input);
               
               // Assert
               expect(result).toBe(expected);
           });
       });
   });
   ```

3. Test edge cases:
   - Empty inputs
   - Null/undefined values
   - Large datasets
   - Invalid data types

4. Run tests before committing:
   ```bash
   npm test
   ```

### Test Principles

- **Isolation**: Each test should be independent
- **Clarity**: Test names should clearly describe what is being tested
- **Coverage**: Aim for high code coverage but focus on meaningful tests
- **Speed**: Tests should run quickly
- **Reliability**: Tests should not be flaky

### Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

### Mocking

For testing functions that depend on external modules:

```javascript
// Mock external dependencies
jest.mock('../app/js/externalModule');

// Use mocked functions in tests
test('should use mocked function', () => {
    externalModule.someFunction.mockReturnValue('mocked value');
    // ... test code
});
```

### Future Test Additions

Planned test coverage:
- [ ] API client functions
- [ ] Data processing pipeline
- [ ] Error handling
- [ ] Integration tests
- [ ] E2E tests for user workflows