// CI Audit gate. Reads `npm audit --omit=dev --json` on stdin and fails when
// a high or critical runtime advisory isn't in .github/audit-allowlist.json,
// or when an allowlist entry is no longer reported (so stale entries get
// removed).
import { readFileSync } from "node:fs";

const BLOCKING = new Set(["high", "critical"]);

const report = JSON.parse(readFileSync(0, "utf8"));
if (report.error) {
  console.error(`npm audit failed: ${report.error.summary ?? JSON.stringify(report.error)}`);
  process.exit(1);
}
const allowlist = JSON.parse(
  readFileSync(new URL("../audit-allowlist.json", import.meta.url), "utf8"),
).advisories;

const reported = new Map();
for (const [pkg, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via !== "object") continue;
    const id = via.url.split("/").pop();
    reported.set(id, { pkg, severity: via.severity, title: via.title });
  }
}

const allowed = new Set(allowlist.map((entry) => entry.id));
const blocking = [...reported].filter(
  ([id, a]) => BLOCKING.has(a.severity) && !allowed.has(id),
);
const stale = allowlist.filter((entry) => !reported.has(entry.id));

for (const [id, a] of blocking) {
  console.error(`Not allowlisted: ${id} (${a.severity}) in ${a.pkg}: ${a.title}`);
}
for (const entry of stale) {
  console.error(`No longer reported, remove from the allowlist: ${entry.id} (${entry.package})`);
}

if (blocking.length || stale.length) process.exit(1);
console.log(
  `Audit gate passed: ${reported.size} advisories reported, ${allowed.size} allowlisted, none blocking.`,
);
