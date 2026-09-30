// One-time: converts the Spanish v1 substitution dictionary into bilingual engine data
// with explicit allergen "carries" per substitute (v1 guessed them from words in the note).
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const d = require(ROOT + "/data/raw/es-v1.json");
const carriesOf = note => Object.keys(d.MARK).filter(m => note.indexOf(m) > -1).map(m => d.MARK[m]);
const sub = ([to, f, note]) => ({f, carries: carriesOf(note), es: {to, note}, en: null});
const tagMap = o => Object.fromEntries(Object.entries(o).map(([t, list]) => [t, list.map(sub)]));
const ingredients = {};
for(const [k, e] of Object.entries(d.ING)){
  ingredients[k] = {a: e.a, ...(e.s ? {s: tagMap(e.s)} : {}),
    ...(e.sr ? {sr: Object.fromEntries(Object.entries(e.sr).map(([r, o]) => [r, tagMap(o)]))} : {})};
}
const roles = Object.fromEntries(Object.entries(d.ROLEF).map(([r, o]) => [r, tagMap(o)]));
const allergens = Object.fromEntries(Object.entries(d.ALLERGENS).map(([k, v]) => [k, {major: !!v.major, es: v.l, en: null}]));
fs.writeFileSync(ROOT + "/data/engine/substitutions.json", JSON.stringify({allergens, ingredients, roles}, null, 1) + "\n");
console.log(Object.keys(ingredients).length, "ingredient keys");
