# Provided Unfamiliar Reaction Mode

Use this reference only when the user or JSON asks for `provided_unfamiliar_reaction`.

## Rule

One and only one non-syllabus reaction pattern may appear in a question, and it must be explicitly supplied in the student-facing stem. Everything else in the question must remain inside 9476 boundaries.

The supplied reaction should test pattern recognition, not mechanism recall. The answer key must say what the pattern does in structural terms: atoms added or removed, bonds broken or made, fragments connected, or functional groups converted.

## Stem Format

Use a short teaching section before the unknown compound is introduced:

```text
Reaction X is not required recall. In this question, use the following pattern.

Example:
RCH=CH2  ->  RCOCH3

In this reaction, the terminal C=C bond is converted into a methyl ketone.
No carbon atoms are lost.
```

Then use normal structural elucidation wording:

```text
Compound A, CxHy..., undergoes Reaction X to give B...
Suggest the structures of A to D, explaining the reactions described.
```

## Answer-Key Format

Add a row like:

| Evidence | Deductions | Marks |
|---|---|---|
| Supplied Reaction X converts RCH=CH2 to RCOCH3. | The pattern converts a terminal alkene into a methyl ketone: the C=C is replaced by C=O at the substituted carbon and H becomes CH3 at the terminal carbon. A must contain a terminal alkene fragment matching the product carbon skeleton. | [1] |

## Valid Pattern Examples

These examples are allowed only when supplied in the stem.

### Wacker-Type Terminal Alkene Oxidation

Student-facing pattern:

```text
RCH=CH2 + [O] -> RCOCH3
```

Pattern explanation for answers:

- Converts a terminal alkene into a methyl ketone.
- Keeps the carbon count unchanged.
- The substituted alkene carbon becomes the carbonyl carbon.
- The terminal carbon becomes the methyl group of `-COCH3`.
- Ethene is a special case and should be avoided unless the stem explicitly gives it.

Useful 9476 companion clues:

- 2,4-DNPH confirms carbonyl in the product.
- Iodoform confirms `-COCH3`.
- Hot acidified KMnO4 can still be used separately only if it is a 9476 oxidative-cleavage clue.

### Epoxide Ring Opening

Student-facing pattern:

```text
An epoxide is a three-membered cyclic ether. In acidified water, it opens to form a 1,2-diol.
```

Pattern explanation for answers:

- Breaks one C-O bond in the strained ring.
- Adds H and OH across the ring opening.
- Produces adjacent alcohol groups on the two original epoxide carbons.
- Does not change the carbon skeleton.

Useful 9476 companion clues:

- Sodium metal detects alcohol groups.
- Optical activity can locate or exclude chiral centres.
- Oxidation tests can classify primary or secondary alcohols after opening.

### Organolithium Addition To Carbonyl

Student-facing pattern:

```text
R-Li reacts with a ketone or aldehyde, then H+, to form an alcohol. The R group from R-Li bonds to the carbonyl carbon.
```

Pattern explanation for answers:

- Forms a new C-C bond between the organolithium carbon and the carbonyl carbon.
- Converts C=O into C-OH after acid work-up.
- The original carbonyl carbon becomes the alcohol-bearing carbon.
- Carbon count increases by the number of carbons in R.

Guardrail:

- Do not call this Grignard chemistry unless the stem supplies it as its own pattern.

### Ritter-Type Amide Formation

Student-facing pattern:

```text
In acid, an alcohol and a nitrile can combine to form an N-alkylamide.
```

Pattern explanation for answers:

- Connects the carbon skeleton from the alcohol to nitrogen.
- Converts the nitrile carbon into the amide carbonyl carbon.
- Forms an amide product.
- Use the supplied example to decide which fragment comes from the alcohol and which comes from the nitrile.

Useful 9476 companion clues:

- Nitrile hydrolysis/reduction clues.
- Alcohol oxidation or dehydration clues.
- Amide hydrolysis if clearly inside 9476 scope.

### Wittig-Type Alkene Formation

Student-facing pattern:

```text
A carbonyl compound reacts with an ylide to form an alkene. The C=O oxygen is removed, and the ylide carbon forms a C=C bond to the former carbonyl carbon.
```

Pattern explanation for answers:

- Replaces C=O with C=C.
- Connects the carbonyl carbon to the ylide carbon.
- Removes the oxygen atom from the product organic molecule.
- Use the supplied ylide structure to identify the alkene substituent.

Guardrail:

- Do not require reagent preparation or mechanism beyond the supplied pattern.

### Supplied Ozone/Oxidative Cleavage Pattern

Student-facing pattern:

```text
Ozone can convert a C=C bond into two C=O-containing fragments. The C=C bond is cut.
```

Pattern explanation for answers:

- Breaks the C=C bond.
- Each alkene carbon becomes a carbonyl carbon.
- Products reveal the two groups originally attached to each alkene carbon.
- If the stem says carboxylic acids form under the conditions, apply only that supplied rule.

Guardrail:

- Ozonolysis is not assumed recall. Use it only as supplied data.

## Validation Checklist

Before finalising:

- Exactly one supplied non-syllabus pattern per question.
- The student-facing stem includes a simple pattern example before the unknowns.
- The answer key explains the structural operation of the pattern.
- Every other clue uses 9476 chemistry.
- Formula changes match the supplied pattern and generated structures.
- Carbon counts are conserved or changed exactly as stated by the supplied pattern.
- The question is marked `provided_unfamiliar_reaction` in the JSON or teacher notes.
