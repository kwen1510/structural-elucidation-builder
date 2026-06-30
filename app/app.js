import { catalog } from "./catalog.js";

const state = {
  preset: "balanced",
  chapters: new Set(["alcohols", "carbonyls", "carboxylic-acids"]),
  tests: new Set(["sodium-carbonate", "dichromate", "dnph", "tollens", "iodoform"]),
  skills: new Set(["functional_group_deduction", "oxidation_products", "negative_clue_elimination"]),
  styles: new Set(["paragraph_heavy", "with_product_diagram"])
};

const $ = (id) => document.getElementById(id);
const subscriptDigits = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉"
};
const superscriptChars = {
  "+": "⁺",
  "-": "⁻"
};

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function subscriptNumber(numberText) {
  return String(numberText).split("").map((char) => subscriptDigits[char] || char).join("");
}

function superscriptText(text) {
  return String(text).split("").map((char) => superscriptChars[char] || char).join("");
}

function displayChem(text) {
  return String(text)
    .replace(/(?<=[A-Za-z)])(\d+)/g, (match) => subscriptNumber(match))
    .replace(/(?<=\bAg|O|Na|NH4)([+-])/g, (match) => superscriptText(match));
}

function chemHtml(text) {
  return escapeHtml(text)
    .replace(/(?<=[A-Za-z)])(\d+)/g, "<sub>$1</sub>")
    .replace(/(?<=\bAg|O|Na|NH4)([+-])/g, "<sup>$1</sup>");
}

function decoratedItem(item) {
  return {
    id: item.id,
    label: item.label,
    display_label: displayChem(item.label)
  };
}

function chip(item, group, set) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip ${set.has(item.id) ? "active" : ""}`;
  button.innerHTML = chemHtml(item.label);
  button.title = displayChem(item.deduction || item.chapter || item.label);
  button.setAttribute("aria-label", item.label);
  button.addEventListener("click", () => {
    state.preset = "custom";
    if (set.has(item.id)) set.delete(item.id);
    else set.add(item.id);
    render();
  });
  group.appendChild(button);
}

function selectedTestsFromChapters() {
  const selected = new Set();
  for (const chapter of catalog.chapters) {
    if (state.chapters.has(chapter.id)) {
      chapter.tests.forEach((test) => selected.add(test));
      chapter.skills.forEach((skill) => state.skills.add(skill));
    }
  }
  return selected;
}

function applyPreset(presetId) {
  const preset = catalog.presets.find((item) => item.id === presetId) || catalog.presets[0];
  state.preset = preset.id;
  state.chapters = new Set(preset.chapters);
  state.tests = new Set(preset.tests);
  state.skills = new Set(preset.skills);
  state.styles = new Set(preset.styles);
  $("difficulty").value = String(preset.difficulty);
  $("questionCount").value = String(preset.questionCount);
  $("outputFormat").value = preset.outputFormat;
  $("structureStyle").value = preset.structureStyle;
  render();
}

function makeSpec() {
  const chapters = catalog.chapters.filter((item) => state.chapters.has(item.id));
  const tests = catalog.tests.filter((item) => state.tests.has(item.id));
  const skills = catalog.skills.filter((item) => state.skills.has(item.id));
  const styles = catalog.styles.filter((item) => state.styles.has(item.id));
  const preset = catalog.presets.find((item) => item.id === state.preset);

  return {
    syllabus: "9476",
    recipe: preset ? {
      id: preset.id,
      label: preset.label,
      display_label: displayChem(preset.label)
    } : {
      id: "custom",
      label: "Custom selection",
      display_label: "Custom selection"
    },
    guardrails: {
      allowed_only: true,
      source: "Singapore-Cambridge H2 Chemistry 9476 organic chemistry",
      excluded: catalog.excluded,
      require_answer_key_format: "clue_deduction_table",
      require_generated_structures: true,
      structure_rendering: $("structureStyle").value
    },
    output: {
      format: $("outputFormat").value,
      question_count: Number($("questionCount").value),
      include_answer_key: true,
      include_clue_deduction_tables: true,
      include_rdkit_structures: true,
      style: styles.map((item) => item.id)
    },
    scope: {
      chapters: chapters.map((item) => decoratedItem(item)),
      reasoning_skills: skills.map((item) => decoratedItem(item)),
      reagents_and_tests: tests.map((item) => ({
        ...decoratedItem(item),
        deduction: item.deduction,
        display_deduction: displayChem(item.deduction),
        chapter: item.chapter
      }))
    },
    difficulty: Number($("difficulty").value),
    teacher_notes: $("notes").value.trim(),
    generation_instructions: [
      "Use $structural-elucidation-question-designer.",
      "Generate only 9476-safe chemistry.",
      "Use paragraph-heavy worksheet phrasing where appropriate.",
      "Use black RDKit diagrams for all structures.",
      "Answers must be in clue / deduction table format.",
      "Check molecular formulae against generated structures.",
      "Avoid spectroscopy, ozonolysis, Grignard reagents, E/Z terminology and diastereomer terminology."
    ]
  };
}

function makePrompt(spec) {
  return `Use $structural-elucidation-question-designer to generate a structural elucidation worksheet from this JSON brief.

Requirements:
- Stay strictly within Singapore-Cambridge H2 Chemistry 9476.
- Use the selected chapters, reagents/tests and reasoning skills only.
- Make questions chemically correct and exam-style.
- Use paragraph-heavy phrasing when requested.
- Generate all structures from SMILES with black RDKit diagrams.
- Provide answer keys as clue / deduction tables.
- Verify formulas, products and answer uniqueness.
- Export the requested format in this workspace.

JSON brief:
\`\`\`json
${JSON.stringify(spec, null, 2)}
\`\`\`
`;
}

function presetCard(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `preset-card ${state.preset === item.id ? "active" : ""}`;
  button.setAttribute("aria-label", `Use ${item.label}`);
  const titleRow = document.createElement("span");
  titleRow.className = "preset-title";

  const title = document.createElement("strong");
  title.textContent = item.label;
  titleRow.appendChild(title);

  if (item.badge) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.badge;
    titleRow.appendChild(badge);
  }

  const description = document.createElement("span");
  description.className = "preset-description";
  description.textContent = item.description;

  const meta = document.createElement("span");
  meta.className = "preset-meta";
  meta.textContent = `${item.questionCount} question${item.questionCount === 1 ? "" : "s"} · Level ${item.difficulty} · ${item.outputFormat.toUpperCase()}`;

  button.append(titleRow, description, meta);
  button.addEventListener("click", () => applyPreset(item.id));
  return button;
}

function renderChips() {
  $("presets").replaceChildren(...catalog.presets.map((item) => presetCard(item)));
  $("chapters").replaceChildren();
  $("tests").replaceChildren();
  $("skills").replaceChildren();
  $("styles").replaceChildren();
  catalog.chapters.forEach((item) => chip(item, $("chapters"), state.chapters));
  catalog.tests.forEach((item) => chip(item, $("tests"), state.tests));
  catalog.skills.forEach((item) => chip(item, $("skills"), state.skills));
  catalog.styles.forEach((item) => chip(item, $("styles"), state.styles));
  $("excluded").replaceChildren(...catalog.excluded.map((text) => {
    const span = document.createElement("span");
    span.className = "exclusion";
    span.textContent = text;
    return span;
  }));
}

function renderSummary(spec) {
  const summaryItems = [
    ["Questions", String(spec.output.question_count)],
    ["Level", String(spec.difficulty)],
    ["Output", spec.output.format.toUpperCase()],
    ["Chapters", String(spec.scope.chapters.length)],
    ["Tests", String(spec.scope.reagents_and_tests.length)],
    ["Structures", "Black RDKit"]
  ];

  $("briefSummary").replaceChildren(...summaryItems.map(([label, value]) => {
    const item = document.createElement("div");
    item.className = "summary-item";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    item.append(strong, span);
    return item;
  }));
}

function render() {
  renderChips();
  const spec = makeSpec();
  const prompt = makePrompt(spec);
  renderSummary(spec);
  $("jsonPreview").textContent = JSON.stringify(spec, null, 2);
  $("promptPreview").textContent = prompt;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function post(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return response.json();
}

function bind() {
  ["difficulty", "questionCount", "outputFormat", "structureStyle", "notes"].forEach((id) => {
    $(id).addEventListener("input", () => {
      state.preset = "custom";
      render();
    });
  });
  $("selectRecommended").addEventListener("click", () => {
    state.preset = "custom";
    state.tests = selectedTestsFromChapters();
    render();
  });
  $("clearTests").addEventListener("click", () => {
    state.preset = "custom";
    state.tests.clear();
    render();
  });
  $("copyJson").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("jsonPreview").textContent);
  });
  $("copyPrompt").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptPreview").textContent);
  });
  $("downloadJson").addEventListener("click", () => {
    download("structural-elucidation-brief.json", $("jsonPreview").textContent, "application/json");
  });
  $("saveSpec").addEventListener("click", async () => {
    const result = await post("/api/save", { spec: makeSpec(), prompt: $("promptPreview").textContent });
    $("serverResult").textContent = result.error ? result.error : `Saved: ${result.jsonPath}`;
  });
  $("runCodex").addEventListener("click", async () => {
    $("serverResult").textContent = "Running Codex CLI...";
    const result = await post("/api/run-codex", { spec: makeSpec(), prompt: $("promptPreview").textContent });
    $("serverResult").textContent = result.error
      ? result.error
      : `Codex exited ${result.code}. Saved JSON: ${result.jsonPath}. ${result.stderr || result.stdout.slice(-500)}`;
  });
}

bind();
applyPreset(state.preset);
