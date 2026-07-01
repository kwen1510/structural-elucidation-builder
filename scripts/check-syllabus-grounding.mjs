import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = path.join(root, "skills", "structural-elucidation-question-designer");
const skillPath = path.join(skillDir, "SKILL.md");
const boundaryPath = path.join(skillDir, "references", "9476-boundaries.md");
const suppliedPatternPath = path.join(skillDir, "references", "provided-unfamiliar-reactions.md");
const extractPath = path.join(skillDir, "references", "syllabus", "9476-organic-chemistry-extract.md");
const pdfPath = path.join(skillDir, "references", "syllabus", "9476_y26_sy.pdf");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return readFileSync(file, "utf8");
}

const skill = read(skillPath);
const boundary = read(boundaryPath);
const suppliedPattern = read(suppliedPatternPath);
const boundaryLower = boundary.toLowerCase();

assert(skill.includes("references/syllabus/9476-organic-chemistry-extract.md"), "SKILL.md must mention the optional detailed syllabus extract.");
assert(skill.includes("references/9476-boundaries.md"), "SKILL.md must reference the compact boundary checklist.");
assert(skill.includes("references/provided-unfamiliar-reactions.md"), "SKILL.md must reference the supplied unfamiliar reaction guide.");
assert(boundary.includes("Official PDF URL:"), "Boundary checklist should cite the official syllabus URL instead of bundling the document.");
assert(boundary.includes("9476-organic-chemistry-extract.md"), "Boundary checklist should mention the optional local extract path.");
assert(boundary.includes("provided-unfamiliar-reactions.md"), "Boundary checklist should link supplied unfamiliar reaction rules.");
assert(suppliedPattern.includes("One and only one non-syllabus reaction pattern"), "Supplied-pattern guide must enforce one unfamiliar pattern.");
assert(suppliedPattern.includes("answer key must say what the pattern does"), "Supplied-pattern guide must require answer-pattern explanations.");

const requiredGrounding = [
  "2,4-DNPH",
  "alkaline I2",
  "acidified KMnO4",
  "halogenoalkanes",
  "nucleophilic substitution",
  "elimination",
  "phenol",
  "carboxylic acids",
  "acyl chlorides",
  "esters",
  "amines",
  "amides",
  "nitriles",
  "unsaturation",
  "carbonyl",
];

for (const phrase of requiredGrounding) {
  assert(boundaryLower.includes(phrase.toLowerCase()), `Missing compact grounding phrase: ${phrase}`);
}

const controlledItems = ["grignard", "ozonolysis", "nmr", "diastereomer"];
for (const phrase of controlledItems) {
  assert(boundaryLower.includes(phrase), `Boundary checklist should explicitly control or exclude: ${phrase}`);
}

if (existsSync(extractPath)) {
  const extract = read(extractPath);
  assert(extract.length > 20000, "Optional local syllabus Markdown extract is unexpectedly short.");
  console.log("Optional local syllabus extract found and checked.");
} else {
  console.log("No optional local syllabus extract found; using compact non-verbatim boundary checklist.");
}

console.log("Syllabus grounding check passed.");
console.log(`Skill: ${path.relative(root, skillPath)}`);
console.log(`Boundary: ${path.relative(root, boundaryPath)}`);
console.log(`Supplied pattern guide: ${path.relative(root, suppliedPatternPath)}`);
console.log(`Optional extract path: ${path.relative(root, extractPath)}`);
console.log(`Optional PDF path: ${path.relative(root, pdfPath)}`);
