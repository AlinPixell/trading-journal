import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "build/icon.png");

if (!fs.existsSync(source)) {
  console.error("Missing build/icon.png");
  process.exit(1);
}

const copies = [
  path.join(root, "public/icon.png"),
  path.join(root, "public/apple-icon.png"),
  path.join(root, "src/app/icon.png"),
  path.join(root, "src/app/apple-icon.png"),
];

for (const target of copies) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

console.log("Synced build/icon.png to app and public icon assets");
