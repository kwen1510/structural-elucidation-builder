# Input Schema

Use CSV for structure-only rendering and JSON for full worksheet generation.

## Structure CSV

Required columns:

- `question_id`: stable question identifier, e.g. `q001`
- `compound_label`: label used in the question, e.g. `A`
- `name`: compound name or description
- `smiles`: SMILES string
- `role`: `target`, `product`, `intermediate`, `reagent`, or `alternative`

Optional columns:

- `notes`
- `confidence`

Example:

```csv
question_id,compound_label,name,smiles,role,notes
q001,A,butan-2-one,CCC(C)=O,target,
q001,B,ethanoic acid,CC(=O)O,product,
```

## Worksheet JSON

Required top-level fields:

- `title`
- `questions`

Each question requires:

- `id`
- `title`
- `student_prompt`: Markdown string
- `compounds`: list of structures to render
- `clue_map`: list of observation/deduction rows
- `answer_key`: list of Markdown strings

Compound fields:

- `label`
- `name`
- `smiles`
- `role`

Optional compound fields:

- `show_in_question`: boolean, default `false`
- `notes`
- `confidence`

Optional question fields:

- `reasoning_mermaid`: Mermaid graph body including the opening graph declaration.
- `teacher_notes`: Markdown string.
- `question_mode`: `standard_9476` or `provided_unfamiliar_reaction`.
- `provided_reaction`: object with `id`, `label`, `student_pattern`, and `answer_pattern`.
- `uniqueness_mode`: `unique`, `possible_structures`, or `dependent_alternatives`.
- `mark_scheme`: object with `deduction_max`, `structure_marks`, and optional `notes`.

Optional `clue_map` row fields:

- `marks`: string such as `[1]` or `no mark`.
- `note`: short marker note.

Example:

```json
{
  "title": "Structural Elucidation Practice",
  "questions": [
    {
      "id": "q001",
      "title": "Carbonyl And Iodoform",
      "student_prompt": "Compound A has molecular formula C4H8O. A gives an orange precipitate with 2,4-DNPH...",
      "compounds": [
        {
          "label": "A",
          "name": "butan-2-one",
          "smiles": "CCC(C)=O",
          "role": "target"
        }
      ],
      "clue_map": [
        {
          "observation": "Orange precipitate with 2,4-DNPH",
          "deduction": "Aldehyde or ketone present",
          "marks": "[1]"
        }
      ],
      "answer_key": [
        "2,4-DNPH shows that A is an aldehyde or ketone.",
        "The iodoform test shows that A contains CH3CO-."
      ]
    }
  ]
}
```
