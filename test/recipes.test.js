// Every recipe (published or scheduled) must pass the validator.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"), path = require("path");
const {validate} = require("../scripts/lib/validate.js");
const ROOT = path.join(__dirname, "..");
const E = JSON.parse(fs.readFileSync(path.join(ROOT, "data/engine/substitutions.json"), "utf8"));
const files = fs.readdirSync(path.join(ROOT, "data/recipes")).filter(f => f.endsWith(".json"));

test("every recipe passes validation", () => {
  const bad = [];
  for(const f of files){
    const r = JSON.parse(fs.readFileSync(path.join(ROOT, "data/recipes", f), "utf8"));
    if(r.id + ".json" !== f) bad.push(`${f}: id ${r.id} doesn't match file name`);
    for(const p of validate(r, E)) bad.push(`${r.id}: ${p}`);
  }
  assert.deepEqual(bad, []);
});

test("recipe names are unique per language", () => {
  for(const lang of ["es", "en"]){
    const seen = new Map();
    for(const f of files){
      const r = JSON.parse(fs.readFileSync(path.join(ROOT, "data/recipes", f), "utf8"));
      const n = r[lang].name.toLowerCase() + "|" + r.country;
      assert.ok(!seen.has(n), `${lang} name "${r[lang].name}" used by ${seen.get(n)} and ${r.id}`);
      seen.set(n, r.id);
    }
  }
});
