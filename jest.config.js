const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    ...tsJestTransformCfg,
  },

  roots: ["./src", "./tests"],

  testMatch: [
    "**/__tests__/**/*.+(ts|js)",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],

  clearMocks: true,
};
