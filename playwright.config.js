import { defineConfig } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    headless: true,
    channel: process.platform === "win32" ? "msedge" : undefined,
    actionTimeout: 10_000,
    navigationTimeout: 15_000
  }
});
