// Recipe validation. Every recipe must pass before it is added or published.
// Returns a list of problems (empty = valid).
const {scan, scanEn} = require("../../test/lexicon.js");
const EX = require("../../test/lexicon-exemptions.json");

const REGIONS = ["latin-america", "caribbean", "north-america", "mediterranean", "western-europe", "central-europe", "eastern-europe", "nordic",
  "middle-east", "north-africa", "west-africa", "east-africa", "south-asia", "southeast-asia", "east-asia", "oceania"];
const COURSES = ["main", "sweet", "sauce", "cookie", "starter", "bread", "soup", "pastry", "side", "drink", "breakfast", "snack"];
const UNITS = ["", "g", "kg", "ml", "l", "tbsp", "tsp", "clove", "pinch", "bigpinch", "sprig", "stalk", "bunch", "can", "piece", "leaf", "handful",
  "batch", "strip", "pod", "loaf", "fillet", "thigh", "loin", "cube", "slice", "ball", "head", "drop", "bottle", "plate", "base", "portion"];
const ROLES = ["protein", "acid", "umami", "aromatic", "liquid", "sweet", "fat", "structure", "crunch", "salt", "set", "binder", "leaven", "garnish",
  "moisture", "dredge", "enrich", "aerate", "caramel", "thicken", "glaze", "spread", "sauce", "serve", "preserve"];

const COMPOSITE = /\b(salsa (verde|roja|de tomatillo|taquera|criolla)|hogao|sofrito|recaito|en adobo|chimichurri|pico de gallo)\b/i;
const RAW = ["tomato", "tomatillo", "chilli", "chipotle", "ancho", "onion", "garlic", "herb", "bellpepper", "scallion", "veg"];

function validate(r, E){
  const p = [];
  const need = (cond, msg) => { if(!cond) p.push(msg); };
  need(/^[a-z0-9-]{2,40}$/.test(r.id || ""), "id must be lower-case letters, digits, dashes");
  need(typeof r.country === "string" && r.country.length > 1, "country");
  need(REGIONS.includes(r.region), "region " + r.region);
  need(COURSES.includes(r.course), "course " + r.course);
  need(Number.isInteger(r.time) && r.time >= 2 && r.time <= 86400, "time (minutes)");
  need(Number.isInteger(r.serves) && r.serves >= 1 && r.serves <= 48, "serves");
  if(r.ovenC != null) need(r.ovenC >= 50 && r.ovenC <= 300, "ovenC");
  need(Array.isArray(r.ing) && r.ing.length >= 2 && r.ing.length <= 32, "ingredient count");
  for(const lang of ["es", "en"]){
    const x = r[lang];
    if(!x){ p.push("missing " + lang); continue; }
    need(x.name && x.name.length <= 80, `${lang}.name`);
    need(x.blurb && x.blurb.length >= 30 && x.blurb.length <= 400, `${lang}.blurb length`);
    need(Array.isArray(x.ing) && x.ing.length === r.ing.length, `${lang}.ing count`);
    need(Array.isArray(x.steps) && x.steps.length >= 2 && x.steps.length <= 16, `${lang}.steps count`);
    need(Array.isArray(x.tips) && x.tips.length <= 6, `${lang}.tips`);
    need(typeof x.video === "string" && x.video.length > 3, `${lang}.video`);
    for(const s of [...(x.steps || []), ...(x.tips || []), x.blurb || ""]){
      need(typeof s === "string" && s.trim().length > 3, `${lang}: empty text`);
      need(!/[<>]/.test(s), `${lang}: no HTML in text`);
      need(!/\d\s?º|\d°C|\d ° C|\d°F/.test(s), `${lang}: write temperatures as "180 °C": ${s.slice(0, 50)}`);
      need(!/°F/.test(s), `${lang}: use °C only (the site converts): ${s.slice(0, 50)}`);
    }
  }
  if(r.es && r.en){
    need(r.es.steps.length === r.en.steps.length, "steps count differs between es and en");
    need(r.es.tips.length === r.en.tips.length, "tips count differs between es and en");
    need(!!r.es.lab === !!r.en.lab, "lab in one language only");
    // Numbers in steps should match across languages (catches translation drift).
    const nums = s => (s.match(/\d+(?:[.,]\d+)?/g) || []).map(n => n.replace(",", ".")).sort().join(" ");
    r.es.steps.forEach((s, i) => { if(nums(s) !== nums(r.en.steps[i] || "")) p.push(`step ${i + 1}: numbers differ es/en (${nums(s)} | ${nums(r.en.steps[i] || "")})`); });
  }
  (r.ing || []).forEach((ing, i) => {
    const info = E.ingredients[ing.k];
    need(!!info, `ing ${i}: unknown key "${ing.k}"`);
    need(UNITS.includes(ing.u), `ing ${i}: unit "${ing.u}"`);
    need(ROLES.includes(ing.role), `ing ${i}: role "${ing.role}"`);
    need(ing.q === null || (typeof ing.q === "number" && ing.q > 0 && ing.q < 20000), `ing ${i}: quantity`);
    if(!info || !r.es || !r.en || !r.es.ing[i] || !r.en.ing[i]) return;
    const cov = new Set([...info.a, ...(info.may || [])]);
    const es = r.es.ing[i].n, en = r.en.ing[i].n;
    need(es && en, `ing ${i}: name`);
    for(const a of scan(es)) if(!cov.has(a) && !EX[`ing|${a}|${es.toLowerCase()}`]) p.push(`ing ${i} "${es}" mentions ${a} but key ${ing.k} doesn't have it`);
    for(const a of scanEn(en)) if(!cov.has(a) && !EX[`ing-en|${a}|${en.toLowerCase()}`]) p.push(`ing ${i} "${en}" mentions ${a} but key ${ing.k} doesn't have it`);
    // A prepared mixture (salsa, sofrito, adobo) under a single raw ingredient's key hides its other allergens.
    if(COMPOSITE.test(es) && RAW.includes(ing.k)) p.push(`ing ${i} "${es}" is a prepared mixture; use a composite key (salsa, chipotleadobo…) or list its parts`);
  });
  return p;
}
module.exports = {validate, REGIONS, COURSES, UNITS, ROLES};
