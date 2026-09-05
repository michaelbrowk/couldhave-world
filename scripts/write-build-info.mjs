import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const reviews = readdirSync("data/sources").map((file) => {
  const source = JSON.parse(readFileSync(`data/sources/${file}`, "utf8"));
  return [source.id, source.lastUpdated];
});
writeFileSync("out/build-info.json", `${JSON.stringify({
  revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  builtAt: new Date().toISOString(),
  sourceReviews: Object.fromEntries(reviews),
}, null, 2)}\n`);
