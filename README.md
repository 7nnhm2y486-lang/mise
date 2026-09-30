# LibrePlato

Allergy-first recipes in English and Spanish. Every recipe can be adapted to what you can't eat, and every substitute lists exactly what it contains.

## Layout

- `data/recipes/<id>.json`: one recipe per file, with `es` and `en` text blocks and ingredient keys (`k`) that the swap engine uses.
- `data/engine/substitutions.json`: allergens, ingredient keys (`a` = always contains, `may` = often contains depending on brand) and substitutes (`carries` / `may`).
- `data/reference/reference.json`: technique and reference notes (both languages).
- `data/raw/`: the original Spanish engine (v1), kept for provenance.
- `scripts/`: one-time converters and the allergy safety patch.
- `work/audit/`: allergen audit flags from the translation pass.
