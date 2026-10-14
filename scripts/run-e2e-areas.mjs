import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(repoRoot, "tests", "e2e", "functional-areas.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const areas = manifest.areas;
const requested = process.argv[2] ?? "--all";
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");

if (requested === "--list") {
  process.stdout.write(`${areas.join("\n")}\n`);
  process.exit(0);
}

if (requested !== "--all" && requested !== "--populated" && !areas.includes(requested)) {
  process.stderr.write(`Unknown E2E area: ${requested}\nUse --list to see the canonical areas.\n`);
  process.exit(2);
}

const runId = new Date().toISOString().replaceAll(/[:.]/g, "-");
const artifactRoot = path.join(tmpdir(), `miaplacidus-e2e-${runId}`);
mkdirSync(artifactRoot, { recursive: true });

function countSpecs(directory) {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return 0;
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "_harness") continue;
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) count += countSpecs(child);
    else if (entry.isFile() && entry.name.endsWith(".spec.ts")) count += 1;
  }
  return count;
}

const selected = requested === "--all" || requested === "--populated"
  ? areas
  : [requested];
const rows = [];
let failures = 0;
const testRoot = path.join(repoRoot, "tests", "e2e");
const rootSpecs = readdirSync(testRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".spec.ts"))
  .map((entry) => entry.name);
if (rootSpecs.length > 0) {
  process.stderr.write(`E2E specs must be inside an area folder; found at tests/e2e root: ${rootSpecs.join(", ")}\n`);
  failures += 1;
}
if (requested === "--all") {
  const unlisted = readdirSync(testRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_harness" && !areas.includes(entry.name))
    .filter((entry) => countSpecs(path.join(testRoot, entry.name)) > 0)
    .map((entry) => entry.name);
  if (unlisted.length > 0) {
    process.stderr.write(`Populated E2E folders missing from the canonical manifest: ${unlisted.join(", ")}\n`);
    failures += 1;
  }
}

for (const area of selected) {
  const areaDirectory = path.join(repoRoot, "tests", "e2e", area);
  const specCount = countSpecs(areaDirectory);
  if (specCount === 0) {
    const status = requested === "--populated" ? "MISSING" : "FAIL (no specs)";
    process.stdout.write(`${status}: ${area}\n`);
    rows.push({ area, specCount, status });
    if (requested !== "--populated") failures += 1;
    continue;
  }

  process.stdout.write(`\n=== ${area}: ${specCount} spec files ===\n`);
  const areaArtifacts = path.join(artifactRoot, area);
  const result = spawnSync(
    process.execPath,
    [playwrightCli, "test", `tests/e2e/${area}`, "--pass-with-no-tests"],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        MIAPLACIDUS_TEST_AREA: "",
        MIAPLACIDUS_TEST_OUTPUT_DIR: path.join(areaArtifacts, "test-results"),
        MIAPLACIDUS_TEST_REPORT_DIR: path.join(areaArtifacts, "report"),
      },
      stdio: "inherit",
      windowsHide: true,
    },
  );
  const status = result.error ? "FAIL (runner error)" : result.status === 0 ? "PASS" : "FAIL";
  const resultPath = path.join(areaArtifacts, "report", "e2e-results.json");
  const stats = existsSync(resultPath) ? JSON.parse(readFileSync(resultPath, "utf8")).stats : null;
  rows.push({ area, specCount, status, exitCode: result.status ?? null, stats });
  if (status !== "PASS") failures += 1;
}

writeFileSync(
  path.join(artifactRoot, "area-results.json"),
  JSON.stringify({ runId, selected, rows, failures }, null, 2),
);
process.stdout.write(`\nArea results: ${rows.filter((row) => row.status === "PASS").length}/${rows.length} passed.\n`);
const totals = rows.reduce((sum, row) => {
  sum.expected += row.stats?.expected ?? 0;
  sum.unexpected += row.stats?.unexpected ?? 0;
  sum.flaky += row.stats?.flaky ?? 0;
  sum.skipped += row.stats?.skipped ?? 0;
  return sum;
}, { expected: 0, unexpected: 0, flaky: 0, skipped: 0 });
process.stdout.write(`Tests: ${totals.expected} passed, ${totals.unexpected} failed, ${totals.flaky} flaky, ${totals.skipped} skipped.\n`);
process.stdout.write(`Artifacts: ${artifactRoot}\n`);
process.exit(failures === 0 ? 0 : 1);
