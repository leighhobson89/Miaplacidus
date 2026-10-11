import { defineConfig, devices } from "@playwright/test";

const area = process.env.MIAPLACIDUS_TEST_AREA;
const browserChannel = process.env.MIAPLACIDUS_BROWSER_CHANNEL;
const captureVideo = process.env.MIAPLACIDUS_DISABLE_VIDEO !== "1";
const testPort = Number(process.env.MIAPLACIDUS_TEST_PORT ?? "4174");
if (!Number.isInteger(testPort) || testPort < 1 || testPort > 65_535) {
  throw new Error("MIAPLACIDUS_TEST_PORT must be an integer from 1 to 65535");
}
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  grep: area ? new RegExp(`@${area}`) : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
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
    command: `npm run dev:test -- --host 127.0.0.1 --port ${testPort} --strictPort`,
    url: testBaseUrl,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
