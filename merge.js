import fs from "bun:fs";
import { fileURLToPath } from "bun:url";
import path from "bun:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// config
const inputDir = path.join(__dirname, "raw");
const outputDir = path.join(__dirname, "labels");
fs.mkdirSync(outputDir, { recursive: true });

// list
const lang = {
  en: "american",
  zh: "chinese",
  "zh-CN": "chinesesimp",
  fr: "french",
  de: "german",
  it: "italian",
  ja: "japanese",
  ko: "korean",
  "es-MX": "mexican",
  pl: "polish",
  pt: "portuguese",
  ru: "russian",
  es: "spanish",
};
const list = fs.readFileSync("./list_out.txt", "utf8").split("\n");

Object.entries(lang).forEach(([ k, v ]) => {
  console.log(`Merging ${k} labels`);
  let result = {};
  list.forEach(d => {
    const dir = path.join(path.join(inputDir, d), v);
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isFile() && d.name.endsWith(".json"))
        .forEach(d => {
          const content = fs.readFileSync(path.join(d.parentPath, d.name), "utf8");
          const parsed = JSON.parse(content);
          result = {
            ...result,
            ...parsed,
          };
        });
    }
  });
  fs.writeFileSync(path.join(outputDir, `${k}.json`), JSON.stringify(result, undefined, 2));
  console.log(`Done merging ${k} labels`);
});
