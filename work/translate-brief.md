# Translation + allergen audit brief (recipes)

Each recipe is a JSON file in /mnt/project-files/mise/data/recipes/<id>.json with a filled "es" block and "en": null.

For every id in your batch file:
1. Read the recipe file.
2. Write natural, idiomatic US-English into "en", with EXACTLY the same shape as "es":
   {"name", "blurb", "lab"? (only if es has it), "ing": [{"n", "note"?}] (same length and order as es.ing), "steps": [...] (same count), "tips": [...] (same count), "video": "<English YouTube search query for this dish/technique>"}
   - Translate meaning and voice (confident, technical, a little dry). Do not add or drop facts, quantities, temperatures or times.
   - Use the dish's usual English name (e.g. "Arroz Jollof" -> "Jollof Rice"; keep native names like "Misir Wot", "Toum").
   - Mexican/Latin terms: jitomate -> tomato, cacahuate -> peanut, chile -> chile, cdta -> tsp, cda -> tbsp.
   - Temperatures in steps stay as written (°C); do not convert.
3. Do not change ANY other field (ids, quantities, units, keys "k", roles, es text). Only replace "en": null.
4. Write the file back as JSON with 1-space indent and a trailing newline. Validate with `node -e 'JSON.parse(require("fs").readFileSync(F))'`.
5. Re-read the file ~10 seconds later to confirm your write landed (other sessions share this folder; only touch your own batch's files).

Allergen audit (important, people with allergies will rely on this):
While translating, look at each ingredient (es.ing[i].n with ing[i].k). The engine only knows an ingredient contains an allergen through its key "k". Flag any ingredient where the key is empty or seems wrong but the ingredient contains, or commonly contains, one of: milk, egg, wheat/gluten (incl. barley, rye, malt, oats not certified GF), soy, peanut, tree nuts, sesame, fish, crustacean shellfish, molluscs, mustard, celery, sulphites, corn, coconut, pork, alcohol, gelatin. Include store-bought products whose labels often contain them (stock, sauces, spice blends, pickles, vinegars made from wine or malt).
Also flag any step or tip text that would be unsafe or misleading for someone who swapped that ingredient out.
Append flags as JSON lines to /mnt/project-files/mise/work/audit/<your batch name>.jsonl, one per issue:
{"id":"<recipe id>","ing":<index or null>,"name":"<es name>","issue":"<short description>","suggest":"<allergen tags or fix>"}
Do NOT edit keys yourself; just flag.

Finish by printing: number of recipes translated, number of flags, and any files you could not complete.
Do not call any mcp__hearthbot__ tools. Do not install packages.
