const sharedConfig = {
  preset: "react-native",
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@env$": "<rootDir>/__mocks__/env.js",
    "^@fortawesome/react-native-fontawesome$":
      "<rootDir>/__mocks__/fontawesome.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|react-native-.*|@react-native|@react-navigation|@fortawesome|@ptomasroos)/)",
  ],
};

module.exports = {
  projects: [
    {
      ...sharedConfig,
      displayName: "unit",
      testMatch: ["<rootDir>/__tests__/**/*.test.[jt]s?(x)"],
      testPathIgnorePatterns: [
        "/__tests__/integration/",
        "/__tests__/accessibility/",
        "/__tests__/performance/",
        "/__tests__/security/",
      ],
    },
    {
      ...sharedConfig,
      displayName: "integration",
      testMatch: ["<rootDir>/__tests__/integration/**/*.test.[jt]s?(x)"],
    },
    {
      ...sharedConfig,
      displayName: "accessibility",
      testMatch: ["<rootDir>/__tests__/accessibility/**/*.test.[jt]s?(x)"],
    },
    {
      ...sharedConfig,
      displayName: "performance",
      testMatch: ["<rootDir>/__tests__/performance/**/*.test.[jt]s?(x)"],
    },
    {
      ...sharedConfig,
      displayName: "security",
      testMatch: ["<rootDir>/__tests__/security/**/*.test.[jt]s?(x)"],
    },
  ],
};
