#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

try:
    from rdkit import Chem
    from rdkit.Chem import rdDepictor, rdMolDescriptors
    from rdkit.Chem.Draw import rdMolDraw2D
except ModuleNotFoundError as exc:
    raise SystemExit(
        "RDKit is required. Create a Python 3.11/3.12 venv and install: "
        "pip install rdkit-pypi 'numpy<2' Pillow"
    ) from exc


def safe_id(value: str) -> str:
    text = re.sub(r"[^A-Za-z0-9_.-]+", "_", str(value).strip())
    return text.strip("._-") or "compound"


def render_svg(mol: Chem.Mol, path: Path, width: int, height: int) -> None:
    drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
    opts = drawer.drawOptions()
    opts.useBWAtomPalette()
    opts.bondLineWidth = 2
    opts.padding = 0.08
    rdMolDraw2D.PrepareAndDrawMolecule(drawer, mol)
    drawer.FinishDrawing()
    path.write_text(drawer.GetDrawingText(), encoding="utf-8")


def render_png(mol: Chem.Mol, path: Path, width: int, height: int) -> None:
    drawer = rdMolDraw2D.MolDraw2DCairo(width, height)
    opts = drawer.drawOptions()
    opts.useBWAtomPalette()
    opts.bondLineWidth = 2
    opts.padding = 0.08
    rdMolDraw2D.PrepareAndDrawMolecule(drawer, mol)
    drawer.FinishDrawing()
    path.write_bytes(drawer.GetDrawingText())


def render_record(row: dict, structures_dir: Path, width: int, height: int) -> dict:
    qid = row.get("question_id") or row.get("id") or row.get("question") or "q"
    label = row.get("compound_label") or row.get("label") or row.get("compound") or "compound"
    smiles = str(row.get("smiles") or "").strip()
    if not smiles:
        raise ValueError(f"Missing SMILES for {qid}/{label}")

    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES for {qid}/{label}: {smiles}")
    rdDepictor.Compute2DCoords(mol)

    filename = f"{safe_id(qid)}_{safe_id(label)}"
    svg_path = structures_dir / f"{filename}.svg"
    png_path = structures_dir / f"{filename}.png"
    render_svg(mol, svg_path, width, height)
    render_png(mol, png_path, width, height)

    formula = rdMolDescriptors.CalcMolFormula(mol)
    canonical = Chem.MolToSmiles(mol, canonical=True, isomericSmiles=True)
    return {
        "question_id": str(qid),
        "compound_label": str(label),
        "name": str(row.get("name") or ""),
        "role": str(row.get("role") or ""),
        "smiles": smiles,
        "canonical_smiles": canonical,
        "formula": formula,
        "svg": str(svg_path),
        "png": str(png_path),
        "notes": str(row.get("notes") or ""),
        "confidence": str(row.get("confidence") or ""),
    }


def write_tsv(path: Path, rows: list[dict]) -> None:
    fields = [
        "question_id",
        "compound_label",
        "name",
        "role",
        "smiles",
        "canonical_smiles",
        "formula",
        "svg",
        "png",
        "confidence",
        "notes",
    ]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, delimiter="\t", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render 9476 structural elucidation compounds from SMILES.")
    parser.add_argument("--input", required=True, help="CSV with question_id, compound_label, name, smiles, role.")
    parser.add_argument("--out-dir", required=True, help="Output directory.")
    parser.add_argument("--width", type=int, default=420, help="Structure image width.")
    parser.add_argument("--height", type=int, default=300, help="Structure image height.")
    args = parser.parse_args()

    out_dir = Path(args.out_dir).expanduser().resolve()
    structures_dir = out_dir / "structures"
    structures_dir.mkdir(parents=True, exist_ok=True)

    input_path = Path(args.input).expanduser().resolve()
    with input_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise SystemExit("Input CSV has no rows.")

    rendered = [render_record(row, structures_dir, args.width, args.height) for row in rows]
    write_tsv(structures_dir / "manifest.tsv", rendered)
    (structures_dir / "manifest.json").write_text(json.dumps(rendered, indent=2), encoding="utf-8")
    print(json.dumps({"structures": len(rendered), "out_dir": str(out_dir)}, indent=2))


if __name__ == "__main__":
    main()
