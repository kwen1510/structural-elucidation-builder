import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = path.join(root, "skills", "structural-elucidation-question-designer");
const skillPath = path.join(skillDir, "SKILL.md");
const boundaryPath = path.join(skillDir, "references", "9476-boundaries.md");
const extractPath = path.join(skillDir, "references", "syllabus", "9476-organic-chemistry-extract.md");
const pdfPath = path.join(skillDir, "references", "syllabus", "9476_y26_sy.pdf");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  return readFileSync(file, "utf8");
}

const skill = read(skillPath);
const boundary = read(boundaryPath);
const extract = read(extractPath);
const extractLower = extract.toLowerCase();

assert(skill.includes("references/syllabus/9476-organic-chemistry-extract.md"), "SKILL.md must reference the detailed syllabus extract.");
assert(skill.includes("references/9476-boundaries.md"), "SKILL.md must still reference the compact boundary checklist.");
assert(boundary.includes("9476-organic-chemistry-extract.md"), "Boundary checklist must point to the detailed syllabus extract.");
assert(statSync(pdfPath).size > 100000, "Official syllabus PDF should be present and non-empty.");
assert(extract.length > 20000, "Syllabus Markdown extract is unexpectedly short.");

const requiredGrounding = [
  "2,4-dinitrophenylhydrazine",
  "alkaline i2",
  "acidified kmno4",
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
  "qualitative organic analysis",
  "unsaturation",
  "carbonyl",
];

for (const phrase of requiredGrounding) {
  assert(extractLower.includes(phrase), `Missing syllabus grounding phrase: ${phrase}`);
}

const boundaryLower = boundary.toLowerCase();
const explicitlyExcluded = ["grignard", "ozonolysis", "nmr", "diastereomer"];
for (const phrase of explicitlyExcluded) {
  assert(boundaryLower.includes(phrase), `Boundary checklist should explicitly control or exclude: ${phrase}`);
}
assert(extractLower.includes("diastereomers is not required"), "Syllabus extract should preserve the diastereomer terminology boundary.");

console.log("Syllabus grounding check passed.");
console.log(`Skill: ${path.relative(root, skillPath)}`);
console.log(`Extract: ${path.relative(root, extractPath)}`);
console.log(`PDF: ${path.relative(root, pdfPath)}`);
