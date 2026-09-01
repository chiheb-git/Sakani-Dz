import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distAssets = join("dist", "public", "assets");
const cssFile = readdirSync(distAssets).find((f) => f.endsWith(".css"));
if (!cssFile) {
  console.error("Aucun fichier CSS trouvé dans dist/public/assets");
  process.exit(1);
}
const cssPath = join(distAssets, cssFile);

console.log("Régénération du CSS via le CLI Tailwind...");
execSync(`npx @tailwindcss/cli -i src/index.css -o "${cssPath}"`, { stdio: "inherit" });

const size = readFileSync(cssPath, "utf8").length;
console.log(`CSS corrigé : ${cssFile} (${size} caractères)`);