import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "artifacts", "mobile", "src");
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".tsx")) files.push(path);
  }
}

walk(root);
const hardcoded = />([^<{\n]*(?:[A-Za-zÀ-ÿ][^<{\n]*))</g;
const results = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const matches = [...source.matchAll(hardcoded)]
    .map((match) => match[1].trim())
    .filter((text) => text.length > 1 && !/^\{.*\}$/.test(text) && !/^(?:Promise|React\.Node)$/.test(text));
  if (matches.length) results.push({ file: relative(process.cwd(), file), strings: [...new Set(matches)] });
}

console.log(JSON.stringify({ filesWithHardcodedText: results }, null, 2));