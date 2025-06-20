module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/**/*.test.js"
  ],

  // Setup files to run before tests
  setupFiles: ['<rootDir>/tests/setup/env.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "models/**/*.js"
  ],

  // Ignore these directories
  testPathIgnorePatterns: [
    "/node_modules/"
  ],

  // Display test results with different colors
  verbose: true
}; 