import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "assets");
const framesDir = path.join(assetsDir, "demo-frames");

const width = 1600;
const height = 900;
const fps = 10;
const framesPerStep = 20;

const steps = [
  {
    label: "Copy skill",
    title: "Copy the Codex skill",
    summary: "Install the bundled skill once. Restart Codex so it can discover the new capability.",
    kind: "install",
    command: ["mkdir -p ~/.codex/skills", "cp -R skills/structural-elucidation-question-designer", "  ~/.codex/skills/"],
  },
  {
    label: "Run app",
    title: "Open the builder app",
    summary: "Start the local app. It is just a small form for choosing syllabus-safe question constraints.",
    kind: "terminal",
    command: ["cd app", "npm start", "open http://127.0.0.1:4317"],
  },
  {
    label: "Choose recipe",
    title: "Choose a ready recipe",
    summary: "Pick a tested question pattern first. You can still adjust chapters, tests and reasoning skills.",
    kind: "recipes",
    command: ["Quick balanced set", "Aromatic side-chain", "Hydrolysis network", "Alkene / isomerism"],
  },
  {
    label: "Export JSON",
    title: "Download the JSON brief",
    summary: "The JSON brief tells Codex what to generate, what to avoid, and how answers should be checked.",
    kind: "json",
    command: ['"syllabus": "9476"', '"format": "pdf"', '"allowed_only": true', '"include_rdkit_structures": true'],
  },
  {
    label: "Paste prompt",
    title: "Paste into Codex",
    summary: "Ask Codex to use the structural-elucidation skill, then paste the generated JSON brief.",
    kind: "prompt",
    command: ["Use $structural-elucidation-question-designer", "Generate a PDF worksheet.", "Use black generated structures.", "Answers: clue / deduction tables."],
  },
  {
    label: "Get PDF",
    title: "Receive a checked worksheet",
    summary: "Codex validates structures, checks formulae, and writes the student question plus answer key.",
    kind: "output",
    command: ["Student question", "Black skeletal structures", "Clue / deduction table", "Formula and uniqueness checks"],
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function wrapWords(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function text(lines, x, y, options = {}) {
  const {
    size = 28,
    weight = 500,
    fill = "#17212b",
    family = "Arial, Helvetica, sans-serif",
    gap = Math.round(size * 1.35),
  } = options;
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * gap}" font-size="${size}" font-weight="${weight}" font-family="${family}" fill="${fill}">${esc(line)}</text>`
  )).join("");
}

function rect(x, y, w, h, options = {}) {
  const {
    fill = "#ffffff",
    stroke = "#d7dde4",
    strokeWidth = 2,
    rx = 22,
  } = options;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function codeBlock(lines, x, y, w, h, active = false) {
  const lineSvg = lines.map((line, index) => (
    `<text x="${x + 30}" y="${y + 37 + index * 28}" font-size="21" font-family="Menlo, Consolas, monospace" fill="${active ? "#d9f4ef" : "#17212b"}">${esc(line)}</text>`
  )).join("");
  return `
    ${rect(x, y, w, h, {
      fill: active ? "#101820" : "#f8fafc",
      stroke: active ? "#0f766e" : "#d7dde4",
      strokeWidth: 3,
      rx: 18,
    })}
    ${lineSvg}
  `;
}

function stepList(activeIndex) {
  const rows = steps.map((step, index) => {
    const active = index === activeIndex;
    const y = 210 + index * 88;
    return `
      ${rect(72, y, 430, 66, {
        fill: active ? "#d9f4ef" : "#ffffff",
        stroke: active ? "#0f766e" : "#d7dde4",
        strokeWidth: active ? 3 : 2,
        rx: 16,
      })}
      <circle cx="112" cy="${y + 33}" r="19" fill="${active ? "#0f766e" : "#eef2f6"}"/>
      <text x="105" y="${y + 41}" font-size="22" font-weight="800" font-family="Arial, Helvetica, sans-serif" fill="${active ? "#ffffff" : "#53616f"}">${index + 1}</text>
      <text x="150" y="${y + 42}" font-size="26" font-weight="${active ? 800 : 650}" font-family="Arial, Helvetica, sans-serif" fill="${active ? "#064e3b" : "#26313b"}">${esc(step.label)}</text>
    `;
  }).join("");

  return `
    ${rect(52, 124, 480, 650, { fill: "#fbfcfd", stroke: "#d7dde4", strokeWidth: 2, rx: 26 })}
    <text x="82" y="174" font-size="34" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#17212b">One clean workflow</text>
    ${rows}
  `;
}

function stepDots(activeIndex) {
  return steps.map((_, index) => {
    const active = index === activeIndex;
    const x = 1060 + index * 54;
    return `
      <circle cx="${x}" cy="796" r="${active ? 17 : 11}" fill="${active ? "#0f766e" : "#cfd8df"}"/>
      <text x="${x - (index >= 9 ? 7 : 5)}" y="804" font-size="17" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="${active ? "#ffffff" : "#64717d"}">${index + 1}</text>
    `;
  }).join("");
}

function miniApp(activeKind) {
  const x0 = 680;
  const y0 = 300;
  const card = (x, y, w, title, detail, active) => `
    ${rect(x, y, w, 86, {
      fill: active ? "#d9f4ef" : "#ffffff",
      stroke: active ? "#0f766e" : "#d7dde4",
      strokeWidth: active ? 3 : 2,
      rx: 16,
    })}
    <text x="${x + 22}" y="${y + 34}" font-size="23" font-weight="850" font-family="Arial, Helvetica, sans-serif" fill="#17212b">${esc(title)}</text>
    <text x="${x + 22}" y="${y + 63}" font-size="17" font-family="Arial, Helvetica, sans-serif" fill="#65717d">${esc(detail)}</text>
  `;

  return `
    ${rect(x0, y0, 760, 326, { fill: "#ffffff", stroke: "#d7dde4", strokeWidth: 2, rx: 28 })}
    <rect x="${x0}" y="${y0}" width="760" height="52" rx="28" fill="#f5f7f9"/>
    <circle cx="${x0 + 38}" cy="${y0 + 27}" r="9" fill="#ef4444"/>
    <circle cx="${x0 + 68}" cy="${y0 + 27}" r="9" fill="#f59e0b"/>
    <circle cx="${x0 + 98}" cy="${y0 + 27}" r="9" fill="#10b981"/>
    <rect x="${x0 + 144}" y="${y0 + 14}" width="460" height="28" rx="14" fill="#ffffff" stroke="#d7dde4" stroke-width="2"/>
    <text x="${x0 + 166}" y="${y0 + 34}" font-size="16" font-family="Arial, Helvetica, sans-serif" fill="#65717d">127.0.0.1:4317</text>
    <text x="${x0 + 38}" y="${y0 + 100}" font-size="34" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#17212b">Structural Elucidation Builder</text>
    <text x="${x0 + 38}" y="${y0 + 134}" font-size="20" font-family="Arial, Helvetica, sans-serif" fill="#65717d">Choose recipe. Export JSON. Paste into Codex.</text>
    ${card(x0 + 38, y0 + 166, 190, "Skill", "9476 safe", activeKind === "install")}
    ${card(x0 + 250, y0 + 166, 220, "Recipe", "Quick set", activeKind === "recipes")}
    ${card(x0 + 492, y0 + 166, 210, "JSON", "Brief ready", activeKind === "json")}
    ${rect(x0 + 38, y0 + 264, 315, 48, {
      fill: activeKind === "json" ? "#0f766e" : "#ffffff",
      stroke: "#0f766e",
      strokeWidth: 3,
      rx: 14,
    })}
    <text x="${x0 + 100}" y="${y0 + 296}" font-size="24" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="${activeKind === "json" ? "#ffffff" : "#0f766e"}">Download JSON</text>
    ${rect(x0 + 386, y0 + 264, 316, 48, {
      fill: activeKind === "prompt" ? "#0f766e" : "#ffffff",
      stroke: "#0f766e",
      strokeWidth: 3,
      rx: 14,
    })}
    <text x="${x0 + 472}" y="${y0 + 296}" font-size="24" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="${activeKind === "prompt" ? "#ffffff" : "#0f766e"}">Copy prompt</text>
  `;
}

function visual(step, activeIndex) {
  if (step.kind === "install") {
    return `
      ${miniApp("install")}
      ${codeBlock(step.command, 680, 632, 760, 124, true)}
    `;
  }
  if (step.kind === "terminal") {
    return `
      ${miniApp("terminal")}
      ${codeBlock(step.command, 680, 632, 760, 124, true)}
    `;
  }
  if (step.kind === "recipes") {
    const names = step.command;
    return `
      ${miniApp("recipes")}
      ${names.map((name, index) => {
        const x = 680 + (index % 2) * 385;
        const y = 632 + Math.floor(index / 2) * 68;
        const active = index === 0;
        return `
          ${rect(x, y, 355, 62, {
            fill: active ? "#d9f4ef" : "#ffffff",
            stroke: active ? "#0f766e" : "#d7dde4",
            strokeWidth: active ? 3 : 2,
            rx: 16,
          })}
          <text x="${x + 24}" y="${y + 39}" font-size="24" font-weight="${active ? 850 : 650}" font-family="Arial, Helvetica, sans-serif" fill="${active ? "#064e3b" : "#26313b"}">${esc(name)}</text>
        `;
      }).join("")}
    `;
  }
  if (step.kind === "json") {
    return `
      ${miniApp("json")}
      ${codeBlock(['{ "syllabus": "9476",', '  "format": "PDF",', '  "allowed_only": true,', '  "structures": "black RDKit" }'], 680, 632, 760, 132)}
    `;
  }
  if (step.kind === "prompt") {
    return `
      ${miniApp("prompt")}
      ${codeBlock(step.command, 680, 632, 760, 132)}
    `;
  }
  return `
    ${rect(680, 300, 760, 430, { fill: "#ffffff", stroke: "#d7dde4", strokeWidth: 2, rx: 28 })}
    <text x="724" y="362" font-size="36" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#17212b">Generated worksheet</text>
    <text x="724" y="402" font-size="22" font-family="Arial, Helvetica, sans-serif" fill="#65717d">Student questions + teacher answers</text>
    ${step.command.map((line, index) => {
      const y = 466 + index * 66;
      return `
        <circle cx="752" cy="${y - 7}" r="18" fill="#d9f4ef" stroke="#0f766e" stroke-width="3"/>
        <path d="M744 ${y - 7} l6 7 l12 -16" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="790" y="${y}" font-size="27" font-weight="750" font-family="Arial, Helvetica, sans-serif" fill="#17212b">${esc(line)}</text>
      `;
    }).join("")}
    ${rect(724, 682, 636, 44, { fill: "#ecfdf5", stroke: "#99d8c9", strokeWidth: 2, rx: 22 })}
    <text x="786" y="711" font-size="23" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#065f46">Ready to share as PDF or Markdown</text>
  `;
}

function frameSvg(activeIndex) {
  const step = steps[activeIndex];
  const summary = wrapWords(step.summary, 62);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f4f6f8"/>
      <circle cx="1460" cy="110" r="170" fill="#d9f4ef" opacity="0.72"/>
      <circle cx="96" cy="826" r="120" fill="#e0f2fe" opacity="0.75"/>
      <text x="60" y="72" font-size="25" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#0f766e">Structural Elucidation Builder</text>
      <text x="60" y="112" font-size="19" font-family="Arial, Helvetica, sans-serif" fill="#65717d">One-shot guide for generating 9476 structural elucidation questions with Codex</text>
      ${stepList(activeIndex)}
      ${rect(585, 124, 910, 650, { fill: "#fbfcfd", stroke: "#d7dde4", strokeWidth: 2, rx: 30 })}
      <text x="628" y="180" font-size="42" font-weight="950" font-family="Arial, Helvetica, sans-serif" fill="#17212b">${esc(step.title)}</text>
      ${text(summary, 630, 224, { size: 24, weight: 550, fill: "#53616f", gap: 32 })}
      ${visual(step, activeIndex)}
      ${stepDots(activeIndex)}
    </svg>
  `;
}

async function main() {
  await mkdir(framesDir, { recursive: true });
  let frameIndex = 0;
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
    const svg = frameSvg(stepIndex);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    for (let i = 0; i < framesPerStep; i += 1) {
      await writeFile(path.join(framesDir, `frame-${String(frameIndex).padStart(4, "0")}.png`), png);
      frameIndex += 1;
    }
  }

  const input = path.join(framesDir, "frame-%04d.png");
  const mp4Path = path.join(assetsDir, "structural-elucidation-builder-guide.mp4");
  const gifPath = path.join(assetsDir, "structural-elucidation-builder-guide.gif");

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
    "-vf", "fps=10,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
    gifPath,
  ], { stdio: "inherit" });

  console.log(`Wrote ${gifPath}`);
  console.log(`Wrote ${mp4Path}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
