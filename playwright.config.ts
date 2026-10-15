import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { tmpdir } from "node:os";

const area = process.env.MIAPLACIDUS_TEST_AREA;
const browserChannel = process.env.MIAPLACIDUS_BROWSER_CHANNEL;
const demoBuildPreview = process.env.MIAPLACIDUS_E2E_DEMO_PREVIEW === "1";
const captureVideo = process.env.MIAPLACIDUS_DISABLE_VIDEO !== "1";
const workerCount = Number(process.env.MIAPLACIDUS_E2E_WORKERS ?? (process.env.CI ? "2" : "1"));
if (!Number.isInteger(workerCount) || workerCount < 1) {
  throw new Error("MIAPLACIDUS_E2E_WORKERS must be a positive integer");
}
const testPort = Number(process.env.MIAPLACIDUS_TEST_PORT ?? "4174");
if (!Number.isInteger(testPort) || testPort < 1 || testPort > 65_535) {
  throw new Error("MIAPLACIDUS_TEST_PORT must be an integer from 1 to 65535");
}
const testBaseUrl = `http://127.0.0.1:${testPort}`;
const runId = new Date().toISOString().replaceAll(/[:.]/g, "-");
const defaultArtifactDir = path.join(tmpdir(), `miaplacidus-playwright-${runId}`);
const testOutputDir = process.env.MIAPLACIDUS_TEST_OUTPUT_DIR ?? path.join(defaultArtifactDir, "test-results");
const reportDir = process.env.MIAPLACIDUS_TEST_REPORT_DIR ?? path.join(defaultArtifactDir, "report");

export default defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  updateSnapshots: "none",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: workerCount,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: path.resolve(testOutputDir),
  grep: area ? new RegExp(`@${area}`) : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: path.resolve(reportDir, "html"), open: "never" }],
    ["json", { outputFile: path.resolve(reportDir, "e2e-results.json") }],
  ],
  use: {
    baseURL: testBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: captureVideo ? "retain-on-failure" : "off",
    actionTimeout: 8_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: browserChannel ?? "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(browserChannel ? { channel: browserChannel } : {}),
      },
    },
  ],
  webServer: {
    command: demoBuildPreview
      ? `npm run preview -- --host 127.0.0.1 --port ${testPort} --strictPort`
      : `npm run dev:test -- --host 127.0.0.1 --port ${testPort} --strictPort`,
    url: testBaseUrl,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
