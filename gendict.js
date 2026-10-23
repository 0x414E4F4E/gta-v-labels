import fs from "bun:fs";

function joaat(name, audio = false) {
  let hash = 0;
  const lowerStr = name.toLowerCase();
  for (let i = 0; i < lowerStr.length; i++) {
    hash += lowerStr.charCodeAt(i);
    hash += (hash << 10);
    hash ^= (hash >>> 6);
  }
  hash += (hash << 3);
  hash ^= (hash >>> 11);
  hash += (hash << 15);
  if (audio) {
    hash = (((hash >>> 28) === 0xf ? 0x1 : 0x0) << 28 | hash & 0x0ffffff) >>> 0;
  }
  const str = `0x${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
  return str;
}

const list = fs.readFileSync("./keys.txt", "utf8").split("\n");
const dict = {};
list.forEach(k => {
  const hash = joaat(k);
  dict[hash] = dict[hash] ?? [];
  dict[hash].push(k);
});
for (const h in dict) {
  if (dict[h].length != 1) {
    console.log(`Found hash collision: ${h}: ${dict[h].join(", ")}`);
  }
}
fs.writeFileSync("./dict.json", JSON.stringify(dict, undefined, 2));
