export const catalog = {
  syllabus: "Singapore-Cambridge H2 Chemistry 9476",
  excluded: [
    "IR/NMR/MS spectroscopy",
    "ozonolysis",
    "Grignard reagents",
    "E/Z nomenclature",
    "diastereomer terminology",
    "advanced named reactions outside 9476"
  ],
  presets: [
    {
      id: "balanced",
      label: "Quick balanced set",
      badge: "Recommended",
      description: "A safe first worksheet covering functional-group tests, oxidation and elimination by negative clues.",
      chapters: ["alcohols", "carbonyls", "carboxylic-acids"],
      tests: ["sodium-carbonate", "dichromate", "dnph", "tollens", "iodoform"],
      skills: ["functional_group_deduction", "negative_clue_elimination", "oxidation_products"],
      styles: ["paragraph_heavy", "with_product_diagram"],
      difficulty: 3,
      questionCount: 2,
      outputFormat: "pdf",
      structureStyle: "black_rdkit_with_product_diagrams"
    },
    {
      id: "aromatic-side-chain",
      label: "Aromatic side-chain",
      description: "Uses 9476-safe arene clues, phenol/alcohol behaviour and side-chain oxidation products.",
      chapters: ["arenes", "alcohols", "phenol"],
      tests: ["formula-aromatic", "kmno4-side-chain", "sodium-metal", "dichromate", "iodoform", "fecl3"],
      skills: ["side_chain_mapping", "negative_clue_elimination", "oxidation_products"],
      styles: ["paragraph_heavy", "with_product_diagram"],
      difficulty: 4,
      questionCount: 2,
      outputFormat: "pdf",
      structureStyle: "black_rdkit_with_product_diagrams"
    },
    {
      id: "hydrolysis-network",
      label: "Hydrolysis network",
      description: "Builds a multi-compound question around ester, halogenoalkane, amide or nitrile hydrolysis.",
      chapters: ["esters", "halogenoalkanes", "amines-amides-nitriles", "carboxylic-acids"],
      tests: ["ester-hydrolysis", "naoh-hydrolysis-agno3", "amide-hydrolysis", "nitrile-hydrolysis", "sodium-carbonate"],
      skills: ["hydrolysis_reconstruction", "multi_compound_network", "negative_clue_elimination"],
      styles: ["network", "paragraph_heavy", "with_product_diagram"],
      difficulty: 5,
      questionCount: 1,
      outputFormat: "pdf",
      structureStyle: "black_rdkit_with_product_diagrams"
    },
    {
      id: "alkene-isomerism",
      label: "Alkene and isomerism",
      description: "Tests unsaturation, oxidative cleavage and 9476 cis-trans or optical-activity reasoning.",
      chapters: ["alkenes", "halogenoalkanes"],
      tests: ["bromine-organic", "bromine-aqueous", "kmno4-cleavage", "ethanolic-koh"],
      skills: ["isomerism", "negative_clue_elimination", "multi_compound_network"],
      styles: ["paragraph_heavy", "with_product_diagram"],
      difficulty: 4,
      questionCount: 2,
      outputFormat: "pdf",
      structureStyle: "black_rdkit_with_product_diagrams"
    }
  ],
  chapters: [
    {
      id: "alkenes",
      label: "Alkenes",
      tests: ["bromine-organic", "bromine-aqueous", "kmno4-cleavage"],
      skills: ["unsaturation", "cis-trans", "cleavage-location"]
    },
    {
      id: "arenes",
      label: "Arenes and side-chain oxidation",
      tests: ["formula-aromatic", "kmno4-side-chain", "bromine-arene-context"],
      skills: ["aromaticity", "side-chain-position", "product-diagram"]
    },
    {
      id: "halogenoalkanes",
      label: "Halogenoalkanes",
      tests: ["naoh-hydrolysis-agno3", "ethanolic-koh"],
      skills: ["substitution", "elimination", "halide-identity"]
    },
    {
      id: "alcohols",
      label: "Alcohols",
      tests: ["sodium-metal", "pcl5", "dichromate", "iodoform"],
      skills: ["oh-detection", "alcohol-class", "oxidation-products", "chirality"]
    },
    {
      id: "phenol",
      label: "Phenol",
      tests: ["naoh-aq", "fecl3", "bromine-aqueous"],
      skills: ["phenol-vs-alcohol", "activated-ring"]
    },
    {
      id: "carbonyls",
      label: "Aldehydes and ketones",
      tests: ["dnph", "tollens", "fehlings", "iodoform", "nabh4"],
      skills: ["carbonyl-class", "methyl-carbonyl", "reduction-product"]
    },
    {
      id: "carboxylic-acids",
      label: "Carboxylic acids",
      tests: ["sodium-carbonate", "esterification"],
      skills: ["acid-detection", "salt-acid-workup"]
    },
    {
      id: "esters",
      label: "Esters",
      tests: ["ester-hydrolysis"],
      skills: ["hydrolysis-products", "reconstruct-ester"]
    },
    {
      id: "acyl-chlorides",
      label: "Acyl chlorides",
      tests: ["agno3-direct", "acyl-condensation"],
      skills: ["reactive-acid-derivative"]
    },
    {
      id: "amines-amides-nitriles",
      label: "Amines, amides and nitriles",
      tests: ["acid-base-amine", "amide-hydrolysis", "nitrile-hydrolysis", "nitrile-reduction"],
      skills: ["nitrogen-functional-group", "nh3-evolution", "chain-length"]
    }
  ],
  tests: [
    { id: "formula-aromatic", label: "C:H ratio near 1:1", chapter: "arenes", deduction: "benzene ring likely" },
    { id: "bromine-organic", label: "Br2 in organic solvent", chapter: "alkenes", deduction: "C=C present if decolourised" },
    { id: "bromine-aqueous", label: "Br2(aq)", chapter: "alkenes/phenol", deduction: "alkene or activated aromatic ring" },
    { id: "kmno4-cleavage", label: "hot acidified KMnO4", chapter: "alkenes", deduction: "oxidative cleavage locates C=C" },
    { id: "kmno4-side-chain", label: "hot alkaline KMnO4 then acidification", chapter: "arenes", deduction: "oxidises aromatic side chains to -CO2H" },
    { id: "sodium-metal", label: "Na metal", chapter: "alcohols/acids/phenol", deduction: "-OH or -CO2H group" },
    { id: "pcl5", label: "PCl5", chapter: "alcohols/acids", deduction: "alcohol or carboxylic acid" },
    { id: "dichromate", label: "acidified K2Cr2O7", chapter: "alcohols/carbonyls", deduction: "oxidation of 1°/2° alcohol or aldehyde" },
    { id: "iodoform", label: "alkaline I2", chapter: "alcohols/carbonyls", deduction: "CH3CH(OH)- or CH3CO-" },
    { id: "dnph", label: "2,4-DNPH", chapter: "carbonyls", deduction: "aldehyde or ketone" },
    { id: "tollens", label: "Tollens'", chapter: "carbonyls", deduction: "aldehyde" },
    { id: "fehlings", label: "Fehling's", chapter: "carbonyls", deduction: "aliphatic aldehyde" },
    { id: "nabh4", label: "NaBH4", chapter: "carbonyls", deduction: "reduction of aldehyde/ketone to alcohol" },
    { id: "sodium-carbonate", label: "Na2CO3(aq)", chapter: "carboxylic acids", deduction: "carboxylic acid, CO2 evolved" },
    { id: "naoh-aq", label: "NaOH(aq), room temperature", chapter: "phenol/acids", deduction: "acidic functional group" },
    { id: "fecl3", label: "neutral FeCl3", chapter: "phenol", deduction: "phenol" },
    { id: "ester-hydrolysis", label: "ester hydrolysis", chapter: "esters", deduction: "acid/alcohol fragments" },
    { id: "naoh-hydrolysis-agno3", label: "NaOH hydrolysis then HNO3/AgNO3", chapter: "halogenoalkanes", deduction: "halogenoalkane and halide identity" },
    { id: "ethanolic-koh", label: "ethanolic KOH", chapter: "halogenoalkanes", deduction: "elimination to alkene" },
    { id: "amide-hydrolysis", label: "amide hydrolysis", chapter: "amides", deduction: "carboxylate/acid and NH3 or amine product" },
    { id: "nitrile-hydrolysis", label: "nitrile hydrolysis", chapter: "nitriles", deduction: "carboxylic acid product" },
    { id: "nitrile-reduction", label: "nitrile reduction", chapter: "nitriles", deduction: "amine product" }
  ],
  skills: [
    { id: "functional_group_deduction", label: "Functional group deduction" },
    { id: "negative_clue_elimination", label: "Using negative clues" },
    { id: "oxidation_products", label: "Oxidation products" },
    { id: "hydrolysis_reconstruction", label: "Hydrolysis reconstruction" },
    { id: "isomerism", label: "cis-trans / optical activity" },
    { id: "side_chain_mapping", label: "Aromatic side-chain mapping" },
    { id: "multi_compound_network", label: "Multi-compound network" },
    { id: "possible_structures", label: "Possible structures / ambiguity" }
  ],
  styles: [
    { id: "paragraph_heavy", label: "Paragraph-heavy exam style" },
    { id: "with_product_diagram", label: "Include product diagram" },
    { id: "one_unknown", label: "Single unknown" },
    { id: "network", label: "A-D / H-J-K-L network" },
    { id: "scaffolded", label: "Scaffolded with subparts" }
  ]
};
