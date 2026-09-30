// Adds recipes written in the compact authoring format.
//   node scripts/add-recipes.js path/to/batch.js [--force]
// A batch file exports an array of:
//   {id, c: country, ce: country in Spanish (optional), r: region, m: course, t: minutes, s: serves, o: ovenC?,
//    i: [[q, unit, key, role, esName, enName, esNote?, enNote?], ...],
//    es: {n, b, lab?, st: [...], tp: [...], v}, en: {n, b, lab?, st: [...], tp: [...], v}}
// Every recipe is validated; nothing is written unless the whole batch passes.
const fs = require("fs"), path = require("path");
const {validate} = require("./lib/validate.js");
const ROOT = path.join(__dirname, "..");
const E = JSON.parse(fs.readFileSync(path.join(ROOT, "data/engine/substitutions.json"), "utf8"));

function expand(x){
  const text = (lang, t) => ({
    name: t.n, blurb: t.b, ...(t.lab ? {lab: t.lab} : {}),
    ing: x.i.map(i => {
      const n = lang === "es" ? i[4] : i[5], note = lang === "es" ? i[6] : i[7];
      return note ? {n, note} : {n};
    }),
    steps: t.st, tips: t.tp || [], video: t.v,
  });
  return {
    id: x.id, country: x.c, ...(x.ce ? {countryEs: x.ce} : {}), region: x.r, course: x.m, time: x.t, serves: x.s,
    ...(x.o ? {ovenC: x.o} : {}),
    ing: x.i.map(i => ({q: i[0], u: i[1], k: i[2], role: i[3]})),
    es: text("es", x.es), en: text("en", x.en),
    added: new Date().toISOString().slice(0, 10),
  };
}

if(require.main === module){
  const file = path.resolve(process.argv[2]);
  const force = process.argv.includes("--force");
  delete require.cache[file];
  const batch = require(file);
  let bad = 0;
  const out = [];
  const ids = new Set();
  for(const x of batch){
    let r;
    try{ r = expand(x); }catch(e){ console.log(`${x.id}: can't expand: ${e.message}`); bad++; continue; }
    const p = validate(r, E);
    const exists = fs.existsSync(path.join(ROOT, "data/recipes", r.id + ".json"));
    if(exists && !force) p.push("id already exists (use --force to replace)");
    if(ids.has(r.id)) p.push("duplicate id in batch");
    ids.add(r.id);
    if(p.length){ bad++; console.log(`✗ ${r.id}\n  ` + p.join("\n  ")); }
    out.push(r);
  }
  if(bad){ console.log(`\n${bad} of ${batch.length} failed; nothing written.`); process.exit(1); }
  for(const r of out) fs.writeFileSync(path.join(ROOT, "data/recipes", r.id + ".json"), JSON.stringify(r, null, 1) + "\n");
  console.log(`added ${out.length}: ${out.map(r => r.id).join(", ")}`);
}
module.exports = {expand};
