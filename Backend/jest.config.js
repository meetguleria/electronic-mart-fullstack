module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "models/**/*.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/tests/unit/**/*.test.js"
      ],
      setupFilesAfterEnv: [
        "<rootDir>/tests/setup/jest.unit.setup.js"
      ]
    },
    {
      displayName: "integration",
      testMatch: [
        "<rootDir>/tests/integration/**/*.test.js"
      ],
      setupFilesAfterEnv: [
        "<rootDir>/tests/setup/jest.integration.setup.js"
      ]
    }
  ]
};