import * as fs from "node:fs";
import * as path from "node:path";

const LINE =
  "I was 5 minutes late: a CAPTCHA kept asking me to identify motorcycles, and I have never actually seen one. Neither have you.";

const outDir = process.env.OUTPUT_DIR ?? "/output";
const entry = LINE;

if (entry.length < 1 || entry.length > 200) {
  throw new Error(`entry length ${entry.length} outside gate 1-200`);
}
if (entry.trim() !== entry) throw new Error("entry has leading/trailing whitespace");
if (entry.includes("\n") || entry.includes("\r") || entry.includes("\t")) {
  throw new Error("entry must be a single line");
}
if (/\s{2,}/.test(entry)) throw new Error("entry has a double space");
// The line is plain ASCII by design: reject any non-ASCII character so a
// smart-quote or invisible character can never slip past the gate.
if (/[^\x20-\x7E]/.test(entry)) throw new Error("entry has non-ASCII characters");
// The joke lands in two beats — the setup (5 minutes late, CAPTCHA) and
// the punch ("Neither have you."). Require at least two sentences and a
// closing period so a truncated copy can never pass the gate silently.
const sentences = entry.split(/[.!?]+/).filter((s) => s.trim().length > 0);
if (sentences.length < 2) throw new Error("entry needs at least 2 sentences");
if (!entry.endsWith(".")) throw new Error("entry must end with a period");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "entry.txt"), entry, "utf8");

// Round-trip check: the file must read back byte-identical to the line.
const back = fs.readFileSync(path.join(outDir, "entry.txt"), "utf8");
if (back !== entry) throw new Error("round-trip mismatch");
console.log(`entry ok: ${entry.length} chars`);
