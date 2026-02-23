module.exports = {
  testTimeout: 120000,
  maxWorkers: 1,
  testMatch: ["**/*.e2e.js"],
  reporters: ["detox/runners/jest/reporter"],
  testRunner: "jest-circus/runner",
  setupFilesAfterEnv: ["./init.js"],
};
