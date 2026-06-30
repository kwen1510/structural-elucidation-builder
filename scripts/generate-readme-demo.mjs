import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "assets");
const framesDir = path.join(assetsDir, "demo-frames");
const width = 1280;
const height = 720;
const fps = 8;

const steps = [
  {
    eyebrow: "Step 1",
    title: "Copy the Codex skill",
    body: "Put the skill folder into ~/.codex/skills, then restart Codex.",
    focus: "skill",
    code: "cp -R skills/structural-elucidation-question-designer ~/.codex/skills/",
  },
  {
    eyebrow: "Step 2",
    title: "Open the builder app",
    body: "Start the tiny local app. It only shows 9476-safe chapters, tests and reasoning skills.",
    focus: "terminal",
    code: "cd app\nnpm start\nopen http://127.0.0.1:4317",
  },
  {
    eyebrow: "Step 3",
    title: "Choose a ready recipe",
    body: "Pick a pattern such as Quick balanced set, Aromatic side-chain, Hydrolysis network or Alkene/isomerism.",
    focus: "recipe",
    code: "Quick balanced set\n2 questions | Level 3 | PDF\nblack RDKit structures",
  },
  {
    eyebrow: "Step 4",
    title: "Download the JSON brief",
    body: "The brief tells Codex the syllabus boundary, selected tests, difficulty and output format.",
    focus: "json",
    code: '{\n  "syllabus": "9476",\n  "output": { "format": "pdf" },\n  "guardrails": { "allowed_only": true }\n}',
  },
  {
    eyebrow: "Step 5",
    title: "Paste the prompt into Codex",
    body: "Ask Codex to use the structural-elucidation skill and generate the worksheet from the JSON.",
    focus: "codex",
    code: "Use $structural-elucidation-question-designer\nGenerate a PDF worksheet.\nUse black generated structures.\nAnswers must use clue/deduction tables.",
  },
  {
    eyebrow: "Step 6",
    title: "Get the worksheet and answer key",
    body: "Codex validates SMILES, draws structures, checks formulae and writes clue/deduction tables.",
    focus: "pdf",
    code: "Student questions\nGenerated skeletal structures\nTeacher answer key\nClue / deduction tables",
  },
];

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function wrap(text, max = 54) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function codeLines(code) {
  return code.split("\n").map((line) => esc(line));
}

function textBlock(lines, x, y, size, color, weight = 400, gap = size * 1.35) {
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * gap}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`
  )).join("");
}

function pill(x, y, text, active = false) {
  return `
    <rect x="${x}" y="${y}" width="${text.length * 10 + 38}" height="40" rx="20" fill="${active ? "#d9f4ef" : "#ffffff"}" stroke="${active ? "#0f766e" : "#cbd5df"}" stroke-width="2"/>
    <text x="${x + 19}" y="${y + 26}" font-size="18" font-weight="${active ? 700 : 500}" fill="${active ? "#064e3b" : "#1d2329"}">${esc(text)}</text>
  `;
}

function browserMock(step) {
  const active = step.focus;
  return `
    <g transform="translate(590 96)">
      <rect width="585" height="470" rx="18" fill="#ffffff" stroke="#d7dde4" stroke-width="2"/>
      <rect width="585" height="48" rx="18" fill="#f5f7f9"/>
      <circle cx="28" cy="24" r="7" fill="#ef4444"/>
      <circle cx="52" cy="24" r="7" fill="#f59e0b"/>
      <circle cx="76" cy="24" r="7" fill="#10b981"/>
      <rect x="112" y="13" width="360" height="22" rx="11" fill="#ffffff" stroke="#d7dde4"/>
      <text x="128" y="29" font-size="13" fill="#65717d">127.0.0.1:4317</text>
      <text x="28" y="84" font-size="26" font-weight="800" fill="#17212b">Structural Elucidation Builder</text>
      <text x="28" y="114" font-size="15" fill="#65717d">Choose recipe -> export JSON -> paste into Codex</text>
      <rect x="28" y="140" width="162" height="74" rx="10" fill="${active === "skill" ? "#d9f4ef" : "#fbfcfd"}" stroke="${active === "skill" ? "#0f766e" : "#d7dde4"}" stroke-width="2"/>
      <text x="46" y="172" font-size="16" font-weight="800" fill="#17212b">Skill</text>
      <text x="46" y="195" font-size="13" fill="#65717d">9476 guardrails</text>
      <rect x="210" y="140" width="162" height="74" rx="10" fill="${active === "recipe" ? "#d9f4ef" : "#fbfcfd"}" stroke="${active === "recipe" ? "#0f766e" : "#d7dde4"}" stroke-width="2"/>
      <text x="228" y="172" font-size="16" font-weight="800" fill="#17212b">Recipe</text>
      <text x="228" y="195" font-size="13" fill="#65717d">Quick balanced</text>
      <rect x="392" y="140" width="162" height="74" rx="10" fill="${active === "json" ? "#d9f4ef" : "#fbfcfd"}" stroke="${active === "json" ? "#0f766e" : "#d7dde4"}" stroke-width="2"/>
      <text x="410" y="172" font-size="16" font-weight="800" fill="#17212b">JSON</text>
      <text x="410" y="195" font-size="13" fill="#65717d">Brief ready</text>
      ${pill(28, 250, "2,4-DNPH", active === "recipe")}
      ${pill(170, 250, "Tollens'", false)}
      ${pill(292, 250, "alkaline I₂", active === "recipe")}
      ${pill(438, 250, "KMnO₄", false)}
      <rect x="28" y="322" width="250" height="54" rx="9" fill="${active === "json" ? "#0f766e" : "#ffffff"}" stroke="#0f766e" stroke-width="2"/>
      <text x="60" y="356" font-size="20" font-weight="800" fill="${active === "json" ? "#ffffff" : "#0f766e"}">Download JSON</text>
      <rect x="304" y="322" width="250" height="54" rx="9" fill="${active === "codex" ? "#0f766e" : "#ffffff"}" stroke="#0f766e" stroke-width="2"/>
      <text x="335" y="356" font-size="20" font-weight="800" fill="${active === "codex" ? "#ffffff" : "#0f766e"}">Copy prompt</text>
      <rect x="28" y="410" width="526" height="36" rx="18" fill="#ecfdf5" stroke="#99d8c9"/>
      <text x="50" y="433" font-size="15" font-weight="700" fill="#065f46">Black RDKit diagrams + clue/deduction answer tables</text>
    </g>
  `;
}

function terminalMock(active) {
  return `
    <g transform="translate(90 458)">
      <rect width="430" height="118" rx="14" fill="#101418" stroke="${active ? "#0f766e" : "#27313a"}" stroke-width="3"/>
      <text x="22" y="36" font-size="15" font-family="Menlo, Consolas, monospace" fill="#8ef0d3">$ cd app</text>
      <text x="22" y="62" font-size="15" font-family="Menlo, Consolas, monospace" fill="#8ef0d3">$ npm start</text>
      <text x="22" y="88" font-size="15" font-family="Menlo, Consolas, monospace" fill="#d9f4ef">Builder ready: 127.0.0.1:4317</text>
    </g>
  `;
}

function outputMock(active) {
  return `
    <g transform="translate(590 586)">
      <rect width="585" height="66" rx="14" fill="${active ? "#eefbf8" : "#ffffff"}" stroke="${active ? "#0f766e" : "#d7dde4"}" stroke-width="2"/>
      <text x="22" y="28" font-size="17" font-weight="800" fill="#17212b">Final output</text>
      <text x="22" y="51" font-size="15" fill="#53616f">PDF worksheet, generated structures, checked answer key</text>
    </g>
  `;
}

function svg(step, frame, totalFrames) {
  const progress = ((frame + 1) / totalFrames) * 1000;
  const body = wrap(step.body, 46);
  const code = codeLines(step.code);
  const cursorX = 630 + progress * 0.52;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#f4f6f8"/>
    <rect x="0" y="0" width="${width}" height="720" fill="#f8fafb"/>
    <circle cx="1080" cy="88" r="118" fill="#d9f4ef" opacity="0.65"/>
    <circle cx="118" cy="620" r="92" fill="#e0f2fe" opacity="0.75"/>
    <text x="90" y="82" font-size="22" font-weight="800" fill="#0f766e">Structural Elucidation Builder</text>
    <text x="90" y="135" font-size="44" font-weight="900" fill="#17212b">${esc(step.title)}</text>
    ${textBlock(body, 92, 178, 22, "#53616f", 500, 31)}
    <rect x="90" y="276" width="430" height="148" rx="16" fill="#ffffff" stroke="#d7dde4" stroke-width="2"/>
    <text x="118" y="313" font-size="18" font-weight="900" fill="#0f766e">${esc(step.eyebrow)}</text>
    ${code.map((line, index) => `<text x="118" y="${350 + index * 25}" font-size="18" font-family="Menlo, Consolas, monospace" fill="#17212b">${line}</text>`).join("")}
    ${terminalMock(step.focus === "terminal")}
    ${browserMock(step)}
    ${outputMock(step.focus === "pdf")}
    <rect x="90" y="666" width="1090" height="10" rx="5" fill="#d7dde4"/>
    <rect x="90" y="666" width="${progress}" height="10" rx="5" fill="#0f766e"/>
    <circle cx="${cursorX}" cy="375" r="${step.focus === "json" || step.focus === "codex" ? 12 : 0}" fill="#0f766e" opacity="0.85"/>
  </svg>`;
}

async function main() {
  await mkdir(framesDir, { recursive: true });
  const framesPerStep = 18;
  let frameIndex = 0;
  for (const step of steps) {
    for (let i = 0; i < framesPerStep; i += 1) {
      const buffer = await sharp(Buffer.from(svg(step, i, steps.length * framesPerStep)))
        .png()
        .toBuffer();
      await writeFile(path.join(framesDir, `frame-${String(frameIndex).padStart(4, "0")}.png`), buffer);
      frameIndex += 1;
    }
  }

  const mp4Path = path.join(assetsDir, "structural-elucidation-builder-guide.mp4");
  const gifPath = path.join(assetsDir, "structural-elucidation-builder-guide.gif");
  const input = path.join(framesDir, "frame-%04d.png");

  execFileSync("ffmpeg", [
    "-y",
    "-framerate", String(fps),
    "-i", input,
    "-vf", "format=yuv420p",
    "-movflags", "+faststart",
    mp4Path,
  ], { stdio: "inherit" });

  execFileSync("ffmpeg", [
    "-y",
    "-framerate", String(fps),
    "-i", input,
    "-vf", "fps=8,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4",
    gifPath,
  ], { stdio: "inherit" });

  console.log(`Wrote ${gifPath}`);
  console.log(`Wrote ${mp4Path}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
