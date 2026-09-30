// Allergy safety tests. These are the ones that matter most: a wrong answer
// here can hurt someone. Run with `npm test`.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"), path = require("path");
const {adaptRecipe, adaptIngredient} = require("../src/engine.js");
const {scan, MAYLEX} = require("./lexicon.js");

const ROOT = path.join(__dirname, "..");
const E = JSON.parse(fs.readFileSync(path.join(ROOT, "data/engine/substitutions.json"), "utf8"));
const EX = JSON.parse(fs.readFileSync(path.join(__dirname, "lexicon-exemptions.json"), "utf8"));
const RECIPES = fs.readdirSync(path.join(ROOT, "data/recipes")).filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(ROOT, "data/recipes", f), "utf8")));
const ALL = Object.keys(E.allergens);

function* allSubs(){
  for(const [k, v] of Object.entries(E.ingredients)){
    for(const [al, l] of Object.entries(v.s || {})) for(const s of l) yield {k, al, s};
    for(const [role, o] of Object.entries(v.sr || {})) for(const [al, l] of Object.entries(o)) for(const s of l) yield {k: k + "@" + role, al, s};
  }
  for(const [role, o] of Object.entries(E.roles)) for(const [al, l] of Object.entries(o)) for(const s of l) yield {k: "role:" + role, al, s};
}

test("every allergen code used anywhere is defined", () => {
  const bad = [];
  const check = (list, where) => { for(const a of list || []) if(!E.allergens[a]) bad.push(`${where}: ${a}`); };
  for(const [k, v] of Object.entries(E.ingredients)){
    check(v.a, k); check(v.may, k);
    for(const al of Object.keys(v.s || {})) check([al], k + ".s");
  }
  for(const {k, al, s} of allSubs()){ check([al], k); check(s.carries, k); check(s.may, k); }
  assert.deepEqual(bad, []);
});

test("every recipe ingredient has a known key (none left untagged)", () => {
  const bad = [];
  for(const r of RECIPES) r.ing.forEach((x, i) => { if(!x.k || !E.ingredients[x.k]) bad.push(`${r.id}#${i} ${r.es.ing[i].n} -> "${x.k}"`); });
  assert.deepEqual(bad, []);
});

test("every substitute is complete and bilingual", () => {
  const bad = [];
  for(const {k, al, s} of allSubs()){
    if(!(s.f >= 0)) bad.push(`${k}[${al}] bad factor`);
    if(s.f === 0 && s.carries.length) bad.push(`${k}[${al}] omit advice with carries`);
    if(!Array.isArray(s.carries)) bad.push(`${k}[${al}] no carries`);
    for(const lang of ["es", "en"]) if(!s[lang] || !s[lang].to || typeof s[lang].note !== "string") bad.push(`${k}[${al}] missing ${lang}`);
    if(s.carries.includes(al) && !k.startsWith("role:")) bad.push(`${k}[${al}] "${s.es.to}" carries the allergen it replaces`);
    for(const a of s.may || []) if(s.carries.includes(a)) bad.push(`${k}[${al}] ${a} in both carries and may`);
  }
  assert.deepEqual(bad, []);
});

test("a substitute never carries the allergen it is offered for", () => {
  const bad = [];
  for(const {k, al, s} of allSubs()) if(s.carries.includes(al)) bad.push(`${k}[${al}] -> ${s.es.to}`);
  assert.deepEqual(bad, []);
});

test("substitute names mention no allergen they don't declare", () => {
  const bad = [];
  for(const {k, al, s} of allSubs()){
    const cov = new Set([...s.carries, ...(s.may || []), al]);
    for(const a of scan(s.es.to)) if(!cov.has(a) && !EX[`sub|${a}|${s.es.to}`]) bad.push(`${k}[${al}] "${s.es.to}" mentions ${a}`);
    for(const a of scan(s.es.to, MAYLEX)) if(!cov.has(a)) bad.push(`${k}[${al}] "${s.es.to}" may contain ${a}`);
  }
  assert.deepEqual(bad, []);
});

test("substitute notes mention no allergen they don't declare (or it is a reviewed exemption)", () => {
  const bad = [];
  for(const {k, al, s} of allSubs()){
    const cov = new Set([...s.carries, ...(s.may || []), al]);
    for(const a of scan(s.es.note)) if(!cov.has(a) && !EX[`sub-note|${a}|${s.es.to}`]) bad.push(`${k}[${al}] "${s.es.to}" note mentions ${a}: ${s.es.note}`);
  }
  assert.deepEqual(bad, []);
});

test("ingredient names mention no allergen their key doesn't declare (or reviewed exemption)", () => {
  const bad = [];
  for(const r of RECIPES) r.ing.forEach((x, i) => {
    const info = E.ingredients[x.k], n = r.es.ing[i].n, cov = new Set([...info.a, ...(info.may || [])]);
    for(const a of scan(n)) if(!cov.has(a) && !EX[`ing|${a}|${n.toLowerCase()}`]) bad.push(`${r.id}#${i} "${n}" [${x.k}] mentions ${a}`);
  });
  assert.deepEqual(bad, []);
});

test("exhaustive: no recipe ever offers a swap containing something you avoid (all single allergens and all pairs)", () => {
  const sets = [];
  for(let i = 0; i < ALL.length; i++){ sets.push([ALL[i]]); for(let j = i + 1; j < ALL.length; j++) sets.push([ALL[i], ALL[j]]); }
  let checks = 0;
  const bad = [];
  for(const r of RECIPES) for(const avoid of sets){
    const A = new Set(avoid), res = adaptRecipe(E, r, avoid);
    res.lines.forEach((l, i) => {
      const info = E.ingredients[r.ing[i].k];
      const contains = info.a.filter(a => A.has(a));
      if(contains.length && !["swap", "nosub"].includes(l.status)) bad.push(`${r.id}#${i} contains ${contains} but status ${l.status}`);
      if(!contains.length && ["swap", "nosub"].includes(l.status)) bad.push(`${r.id}#${i} flagged without cause`);
      for(const s of l.subs){ checks++; if(s.carries.some(a => A.has(a))) bad.push(`${r.id}#${i} avoid ${avoid}: offered ${s.en.to}`); }
      if(l.status === "check" && !(info.may || []).some(a => A.has(a))) bad.push(`${r.id}#${i} check without cause`);
    });
    if(res.verdict === "safe" && res.lines.some(l => l.status !== "ok")) bad.push(`${r.id} safe verdict with issues`);
  }
  assert.deepEqual(bad.slice(0, 20), []);
  assert.ok(checks > 1000, "exercised the substitutes");
});

test("swaps flagged 'may contain' come after clean ones", () => {
  for(const r of RECIPES) for(const a of ALL){
    for(const l of adaptRecipe(E, r, [a]).lines){
      for(let i = 1; i < l.subs.length; i++) assert.ok(l.subs[i - 1].mayHit.length <= l.subs[i].mayHit.length);
    }
  }
});

// Regression cases from the safety reviews.
const ing = (k, role = "structure") => ({k, role, q: 1, u: ""});
const offered = (k, role, avoid) => adaptIngredient(E, ing(k, role), new Set(avoid)).subs.map(s => s.en.to);

test("regressions: generic swaps only apply to plain ingredients", () => {
  assert.ok(!offered("pasta", "structure", ["wheat"]).some(t => /blend/.test(t)), "no flour blend for pasta");
  assert.ok(!offered("parmesan", "fat", ["milk"]).includes("olive oil"), "no olive oil for parmesan");
  assert.ok(!offered("choux", "structure", ["wheat"]).some(t => /^1:1/.test(t)));
  assert.ok(offered("apflour", "structure", ["wheat"]).length > 0);
});

test("regressions: previously mis-tagged items", () => {
  const a = k => E.ingredients[k].a, may = k => E.ingredients[k].may || [];
  assert.ok(a("chinkiang").includes("wheat"));
  assert.ok(a("tonkatsu").includes("wheat") && a("tonkatsu").includes("soy"));
  assert.ok(a("shaoxing").includes("wheat"));
  assert.ok(a("porkmince").includes("pork"));
  assert.ok(a("vanilla").includes("alcohol"));
  assert.ok(a("worcestershire").includes("fish"));
  assert.ok(a("currypaste").includes("shellfish"));
  assert.ok(a("kimchi").includes("fish"));
  assert.ok(a("maltvinegar").includes("wheat"));
  assert.ok(may("oats").includes("wheat"));
  assert.ok(may("stock").includes("celery"));
  assert.ok(may("icingsugar").includes("corn"));
  assert.ok(a("darkchocolate").includes("sugar"));
  // cornflakes swap must be the certified GF kind
  assert.ok(!offered("breadcrumbs", "crunch", ["wheat"]).some(t => /cornflakes/.test(t) && !/gluten-free/.test(t)));
  // with egg + corn avoided, the tofu + cornstarch set swap must not appear
  assert.ok(!offered("egg", "set", ["egg", "corn"]).some(t => /cornstarch/.test(t)));
  // celeriac is celery
  assert.ok(!offered("potato", "structure", ["nightshade", "celery"]).includes("celeriac"));
  // sherry vinegar isn't a sulphite-free swap
  for(const k of ["wine", "winered", "winewhite"]) assert.ok(!offered(k, "liquid", ["sulphite"]).some(t => /sherry/.test(t)));
});
