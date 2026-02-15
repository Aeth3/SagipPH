module.exports = {
  preset: "react-native",
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@env$": "<rootDir>/__mocks__/env.js",
    "^@fortawesome/react-native-fontawesome$":
      "<rootDir>/__mocks__/fontawesome.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|react-native-.*|@react-native|@react-navigation|@fortawesome|@ptomasroos)/)",
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
