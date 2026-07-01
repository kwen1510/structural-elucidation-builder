#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from render_structures import render_record, write_tsv  # noqa: E402


def rel(path: str | Path, base: Path) -> str:
    return Path(path).resolve().relative_to(base.resolve()).as_posix()


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a Markdown 9476 structural elucidation worksheet from JSON.")
    parser.add_argument("--input", required=True, help="Worksheet JSON.")
    parser.add_argument("--out-dir", required=True, help="Output directory.")
    parser.add_argument("--width", type=int, default=420, help="Structure image width.")
    parser.add_argument("--height", type=int, default=300, help="Structure image height.")
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    spec = json.loads(input_path.read_text(encoding="utf-8"))
    out_dir = Path(args.out_dir).expanduser().resolve()
    structures_dir = out_dir / "structures"
    out_dir.mkdir(parents=True, exist_ok=True)
    structures_dir.mkdir(parents=True, exist_ok=True)

    rendered: list[dict] = []
    by_question: dict[str, list[dict]] = {}
    for question in spec.get("questions", []):
        qid = str(question["id"])
        by_question[qid] = []
        for compound in question.get("compounds", []):
            row = {
                "question_id": qid,
                "compound_label": compound["label"],
                "name": compound.get("name", ""),
                "smiles": compound["smiles"],
                "role": compound.get("role", ""),
                "notes": compound.get("notes", ""),
                "confidence": compound.get("confidence", ""),
            }
            record = render_record(row, structures_dir, args.width, args.height)
            record["show_in_question"] = bool(compound.get("show_in_question", False))
            rendered.append(record)
            by_question[qid].append(record)

    write_tsv(structures_dir / "manifest.tsv", rendered)
    (structures_dir / "manifest.json").write_text(json.dumps(rendered, indent=2), encoding="utf-8")

    lines: list[str] = []
    title = spec.get("title") or "Structural Elucidation Practice"
    lines.extend([f"# {title}", ""])
    if spec.get("intro"):
        lines.extend([str(spec["intro"]), ""])

    lines.extend(["## Student Questions", ""])
    for index, question in enumerate(spec.get("questions", []), start=1):
        qid = str(question["id"])
        lines.extend([f"### Question {index}: {question.get('title', qid)}", ""])
        lines.extend([str(question["student_prompt"]).strip(), ""])
        provided = question.get("provided_reaction")
        if provided:
            lines.extend(["**Supplied reaction pattern**", ""])
            if provided.get("student_pattern"):
                lines.extend([str(provided["student_pattern"]).strip(), ""])
            elif provided.get("label"):
                lines.extend([str(provided["label"]).strip(), ""])
        visible = [item for item in by_question[qid] if item.get("show_in_question")]
        if visible:
            lines.extend(["**Structures provided in the question**", ""])
            for item in visible:
                lines.append(f"**{item['compound_label']} - {item['name']}**")
                lines.append("")
                lines.append(f"<img src=\"{rel(item['svg'], out_dir)}\" alt=\"{item['compound_label']} structure\" width=\"330\">")
                lines.append("")

    lines.extend(["## Teacher Answer Key", ""])
    for index, question in enumerate(spec.get("questions", []), start=1):
        qid = str(question["id"])
        lines.extend([f"### Question {index}: {question.get('title', qid)}", ""])

        clue_map = question.get("clue_map", [])
        if clue_map:
            has_marks = any("marks" in clue or "note" in clue for clue in clue_map)
            if has_marks:
                lines.extend(["| Evidence | Deductions | Marks |", "|---|---|---|"])
            else:
                lines.extend(["| Evidence | Deductions |", "|---|---|"])
            for clue in clue_map:
                deduction = str(clue.get("deduction", ""))
                if clue.get("note"):
                    deduction = f"{deduction}<br><em>Note: {clue['note']}</em>"
                if has_marks:
                    lines.append(f"| {clue.get('observation', '')} | {deduction} | {clue.get('marks', '')} |")
                else:
                    lines.append(f"| {clue.get('observation', '')} | {deduction} |")
            lines.append("")

        provided = question.get("provided_reaction")
        if provided and provided.get("answer_pattern"):
            lines.extend(["**Supplied reaction pattern explanation**", "", str(provided["answer_pattern"]).strip(), ""])

        if question.get("answer_key"):
            for item in question["answer_key"]:
                lines.append(f"- {item}")
            lines.append("")

        if question.get("mark_scheme"):
            scheme = question["mark_scheme"]
            lines.extend(["**Mark scheme summary**", ""])
            if "deduction_max" in scheme:
                lines.append(f"- Deductions: max {scheme['deduction_max']}")
            if "structure_marks" in scheme:
                lines.append(f"- Structures: {scheme['structure_marks']}")
            if scheme.get("notes"):
                lines.append(f"- Notes: {scheme['notes']}")
            lines.append("")

        structures = by_question[qid]
        if structures:
            lines.extend(["**Generated structures**", ""])
            for item in structures:
                lines.append(f"**{item['compound_label']} - {item['name']}**")
                lines.append("")
                lines.append(f"<img src=\"{rel(item['svg'], out_dir)}\" alt=\"{item['compound_label']} structure\" width=\"330\">")
                lines.append("")
                lines.append(f"SMILES: `{item['smiles']}`  ")
                lines.append(f"Canonical SMILES: `{item['canonical_smiles']}`  ")
                lines.append(f"Formula: `{item['formula']}`")
                if item.get("notes"):
                    lines.append(f"Notes: {item['notes']}")
                lines.append("")

        if question.get("reasoning_mermaid"):
            lines.extend(["**Reasoning map**", "", "```mermaid", str(question["reasoning_mermaid"]).strip(), "```", ""])
        if question.get("teacher_notes"):
            lines.extend(["**Teacher notes**", "", str(question["teacher_notes"]).strip(), ""])

    worksheet_path = out_dir / "worksheet.md"
    worksheet_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"worksheet": str(worksheet_path), "structures": len(rendered)}, indent=2))


if __name__ == "__main__":
    main()
