module.exports = {
  moduleFileExtensions: ["ts", "js"],
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