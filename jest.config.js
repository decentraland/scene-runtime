module.exports = {
  moduleFileExtensions: ["ts", "js", "tsx", "jsx"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@dcl)/)",
  ],
  transform: {
    '^.+\\.m?[tj]sx?$': ["ts-jest", {
      tsconfig: "test/tsconfig.json",
      "useESM": true
    }]
  },
  coverageDirectory: "coverage",
  verbose: true,
  testMatch: ["**/*.spec.(ts)"],
  testEnvironment: "node",
}