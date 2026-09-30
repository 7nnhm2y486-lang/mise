# substitutions.json — allergen tagging review

Candidates where a substitute's `carries` / `may` looks incomplete for an allergy sufferer. Not fixed; for review.

## Clear omissions (the substitute's own text names the allergen)

| Ingredient key | Substitute | What's missing |
|---|---|---|
| mascarpone | mascarpone de anacardo | Note says blend with coconut cream: `carries` lacks `coconut`. |
| egg (sr.set) | tofu sedoso + 1 cdta de fécula de maíz | Contains cornstarch: `carries` lacks `corn`. |
| egg (sr.binder) | puré de papa cocida | Potato is tagged `nightshade` elsewhere (potato, almidón de papa): lacks `nightshade`. |
| apflour (sr.structure) | harina de arroz + almidón de papa + tapioca | Potato starch: lacks `nightshade` (cornstarch.s.corn "almidón de papa" carries it). |
| fishsauce | salsa de soja + lima + una pizca de azúcar | Lacks `sugar` (other "pinch of sugar" subs, e.g. mirin/caldo, carry it). |
| chorizo | pimentón ahumado + hinojo + ajo en aceite | Contains garlic: lacks `allium` (hoisin sub with garlic carries it). |
| chorizo | chorizo de res o de pollo | Commercial chorizo almost always has garlic: at least `may: allium`. |
| palmsugar, jaggery | alulosa + sal + una gota de melaza | Molasses is sugar (brownsugar sub with molasses carries `sugar`): lacks `sugar` (trace). |
| marzipan, almondpaste | mazapán de semillas de girasol | Made with azúcar glas, which usually contains cornstarch (icingsugar sub carries `corn`): add `may: corn`. |
| creamcheese | yogur de coco colado | Note adds 1 cdta fécula de maíz for baking: add `may: corn`. |
| egg (sr.enrich) | fécula de maíz + bebida vegetal | Plant milk unspecified: add `may: soy, treenut, coconut, wheat` (as the sr.glaze sub does). |
| wine, winered, winewhite | caldo + vinagre | `may` has sulphite, celery, wheat but the `stock` ingredient's own may-list also has `soy`, `milk`. |
| mirin, sake, shaoxing | caldo + una pizca de azúcar | `may: celery, wheat` — missing `soy`, `milk` per the `stock` entry. |
| gochujang (s.soy), mustard (s.mustard), peanut/peanutbutter (tahini note) | subs using honey | Honey isn't tracked: the `honey` ingredient has `a: ["honey", ...]` but there is no `honey` key in `allergens`, so it can't be flagged or displayed. Either add an allergen entry or drop it from `a`. |

## Worth considering (cross-reactivity / common formulations)

| Ingredient key | Substitute | Concern |
|---|---|---|
| celery | tallo de hinojo | Fennel is in the celery family (Apiaceae); cross-reactivity in celery allergy is well documented. Sub offered *for celery* — at least a note/`may: celery`. Same family issue for fennel subs used by celery-allergic users elsewhere (onion/shallot/leek/scallion/chive, bellpepper/eggplant, chorizo). |
| mustard | rábano picante fresco | Horseradish is a Brassicaceae relative of mustard; cross-reactivity reported. Paprika/chilli sub notes also suggest horseradish. |
| bread | pan sin gluten con semillas | Seeded GF breads frequently contain sesame: add `may: sesame`. |
| breadflour, puffpastry (GF) | GF bread blend / hojaldre sin gluten | Commercial GF blends often use potato starch: `may: nightshade`. |
| milkchocolate | chocolate 'con leche' vegetal | Many vegan milk chocolates use hazelnut/almond/cashew: `may: treenut`. |
| whitechocolate | chocolate blanco vegetal | Same: often nut-based — `may: treenut`. |

## Ingredient-level oddities (outside the subs)

- `molasses`, `treacle`, `goldensyrup` have `a: ["sugar","corn"]`; molasses/treacle/golden syrup don't normally contain corn (corn syrup does). Check whether corn was intended.
- `oystersauce` lists `wheat` in both `a` and `may` (redundant).
- Existing English notes use UK spelling (flavour, colour, labelled); the new ones are US spelling.
