import fs from "bun:fs";
import { fileURLToPath } from "bun:url";
import path from "bun:path";
import dict from "./dict.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// config
const inputDir = path.join(__dirname, "raw");

// convert
fs.readdirSync(inputDir, { withFileTypes: true, recursive: true })
  .filter(d => d.isFile() && d.name.endsWith(".gxt2"))
  .forEach(d => {
    const inputFile = path.join(d.parentPath, d.name);
    const outputFile = path.join(d.parentPath, d.name.replace(/\.gxt2(?!.*\.gxt2)/, ".json"));
    if (!fs.existsSync(outputFile)) {
      console.log(`Converting ${path.relative(inputDir, inputFile)}`)
      const data = fs.readFileSync(inputFile);
      const result = jsonFromGXT2(data);
      fs.writeFileSync(outputFile, JSON.stringify(result, undefined, 2));
    }
  });

// function
function jsonFromGXT2(data) {
  // Validate global "2TXG" magic header
  if (data.length < 8 || data.toString("utf8", 0, 4) !== "2TXG") {
    throw new Error("Not a valid GXT2 file");
  }

  // Read total number of entry strings
  const numEntries = data.readUInt32LE(4);
  let pos = 8;
  const entries = [];

  // Parse out entry table structures (Hash + Offset pair)
  for (let i = 0; i < numEntries; i++) {
    const hash = data.readUInt32LE(pos);
    const offset = data.readUInt32LE(pos + 4);
    pos += 8;
    entries.push({ hash, offset });
  }

  // Validate the second embedded "2TXG" header block
  if (data.toString("utf8", pos, pos + 4) !== "2TXG") {
    throw new Error("Malformed file structure: Missing secondary 2TXG marker");
  }
  pos += 8; // Advance past magic word + padding uint32

  const result = {};

  // Extract null-terminated strings using relative absolute mapping offsets
  for (const entry of entries) {
    let end = entry.offset;
    const stringBytes = [];

    while (end < data.length) {
      const byteChar = data[end];
      end++;
      if (byteChar === 0) {
        break; // Break out on null-terminator
      }
      stringBytes.push(byteChar);
    }

    const bufferSlice = Buffer.from(stringBytes);
    let textStr = "";

    try {
      textStr = bufferSlice.toString("utf8");
    } catch {
      // Fallback decoding handler
      textStr = bufferSlice.toString("binary");
    }

    // Map key format as uniform 8-character uppercase hex strings for JSON
    const hexKey = `0x${entry.hash.toString(16).toUpperCase().padStart(8, "0")}`;
    const keys = dict[hexKey];
    if (keys?.length == 1) {
      result[keys[0]] = textStr;
    } else {
      result[hexKey] = textStr;
    }
  }

  return result;
}
