import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve(
  process.argv[2] || path.join(process.cwd(), "..", "..", "leetcode-companywise-interview-questions"),
);
const outputRoot = path.join(process.cwd(), "public", "data", "interview-questions");

const entries = await readdir(sourceRoot, { withFileTypes: true });
const companies = [];

await mkdir(outputRoot, { recursive: true });

for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
  if (!entry.isDirectory()) continue;
  const source = path.join(sourceRoot, entry.name, "all.csv");
  try {
    await copyFile(source, path.join(outputRoot, `${entry.name}.csv`));
    companies.push(entry.name);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ companies }, null, 2)}\n`,
);

console.log(`Imported ${companies.length} company question banks into ${outputRoot}`);
