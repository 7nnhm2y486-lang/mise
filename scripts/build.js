// Builds the static bilingual site into dist/. No dependencies.
//   node scripts/build.js [--base https://example.com]
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");
const {T, COURSE, REGION, fmtNum, unit} = require("../src/i18n.js");
const {recipeAllergens} = require("../src/engine.js");

const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 ? process.argv[argBase + 1] : process.env.SITE_URL || "https://libreplato.com").replace(/\/$/, "");
const LANGS = ["en", "es"];
// --preview N: build a small, fully relative copy (explicit index.html links) for hosts without clean URLs.
const argPrev = process.argv.indexOf("--preview");
const PREVIEW = argPrev > 0 ? +process.argv[argPrev + 1] : 0;
const SEG = {en: "recipes", es: "recetas"};

const E = JSON.parse(fs.readFileSync(path.join(ROOT, "data/engine/substitutions.json"), "utf8"));
const REF = JSON.parse(fs.readFileSync(path.join(ROOT, "data/reference/reference.json"), "utf8"));
const ALL = fs.readdirSync(path.join(ROOT, "data/recipes")).filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(ROOT, "data/recipes", f), "utf8")));
// Only published recipes go live. Recipes without "publish" (the original 307) are live.
const TODAY = process.env.MISE_TODAY || new Date().toISOString().slice(0, 10);
let RECIPES = ALL.filter(r => !r.publish || r.publish <= TODAY).sort((a, b) => a.en.name.localeCompare(b.en.name));
if(PREVIEW){
  const latam = RECIPES.filter(r => r.region === "latin-america" || r.region === "caribbean");
  const rest = RECIPES.filter(r => !latam.includes(r));
  const nL = Math.ceil(PREVIEW * 0.7), step = latam.length / nL;  // spread across countries, not just A-C
  const latamPick = Array.from({length: Math.min(nL, latam.length)}, (_, i) => latam[Math.floor(i * step)]);
  RECIPES = [...latamPick, ...rest.filter((_, i) => i % Math.max(1, Math.floor(rest.length / (PREVIEW * 0.3))) === 0)].slice(0, PREVIEW);
}

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Recipe text may contain <b>/<i> from the reference data only; recipe fields are plain text.
const slugify = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Stable, unique slugs per language.
const SLUG = {en: {}, es: {}};
for(const lang of LANGS){
  const used = new Map();
  for(const r of RECIPES){
    let s = r.slug && r.slug[lang] || slugify(r[lang].name);
    if(used.has(s)) s = s + "-" + slugify(r.country);
    if(used.has(s)) s = s + "-" + r.id;
    used.set(s, r.id);
    SLUG[lang][r.id] = s;
  }
}
const url = (lang, id) => `/${lang}/${SEG[lang]}/${SLUG[lang][id]}/`;
const COUNTRY_ES = {};
for(const r of ALL) if(r.countryEs) COUNTRY_ES[r.country] = r.countryEs;
const countryName = (r, lang) => lang === "es" ? (r.countryEs || COUNTRY_ES[r.country] || COUNTRY_ES_DEFAULT[r.country] || r.country) : r.country;
const COUNTRY_ES_DEFAULT = {"Nigeria":"Nigeria","Ghana":"Ghana","Ethiopia":"Etiopía","Morocco":"Marruecos","Tunisia":"Túnez","Levant":"Levante","Turkey":"Turquía","Greece":"Grecia","Italy":"Italia","France":"Francia","Spain":"España","Ukraine":"Ucrania","Hungary":"Hungría","Georgia":"Georgia","Sweden":"Suecia","Ireland":"Irlanda","India":"India","Sri Lanka":"Sri Lanka","Thailand":"Tailandia","Laos":"Laos","Vietnam":"Vietnam","Indonesia":"Indonesia","Malaysia":"Malasia","Philippines":"Filipinas","China":"China","Korea":"Corea","Japan":"Japón","Mexico":"México","Peru":"Perú","Brazil":"Brasil","Argentina":"Argentina","Jamaica":"Jamaica","Cuba":"Cuba","United States":"Estados Unidos","Denmark":"Dinamarca","Israel":"Israel","Scotland":"Escocia","United Kingdom":"Reino Unido","Poland":"Polonia","Portugal":"Portugal","Austria":"Austria","Palestine":"Palestina","Australia":"Australia","Belgium":"Bélgica","Netherlands":"Países Bajos","Egypt":"Egipto","Switzerland":"Suiza","Singapore":"Singapur","Pakistan":"Pakistán","Venezuela":"Venezuela","Finland":"Finlandia","United Arab Emirates":"Emiratos Árabes Unidos","Lebanon":"Líbano","Yemen":"Yemen","Syria":"Siria","Colombia":"Colombia","Chile":"Chile","Ecuador":"Ecuador","Bolivia":"Bolivia","Uruguay":"Uruguay","Paraguay":"Paraguay","Guatemala":"Guatemala","Honduras":"Honduras","El Salvador":"El Salvador","Nicaragua":"Nicaragua","Costa Rica":"Costa Rica","Panama":"Panamá","Dominican Republic":"República Dominicana","Puerto Rico":"Puerto Rico","Haiti":"Haití","Trinidad and Tobago":"Trinidad y Tobago","Belize":"Belice"};

function write(rel, content){
  const file = path.join(OUT, rel);
  if(rel.endsWith(".html")){
    // Make every internal link relative, so the site works from any folder.
    const depth = rel.split("/").length - 1, root = depth ? "../".repeat(depth) : "./";
    content = content.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (m, a, u) => {
      if(PREVIEW && (u === "" || u.endsWith("/"))) u += "index.html";
      return `${a}="${root}${u}"`;
    }).replace("<body ", `<body data-root="${root}" `);
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}

const ICON = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v7a3 3 0 0 0 6 0V9M13 9v14M21 9c-2 2-2 7 0 8v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function page({lang, title, desc, path: p, alt, body, head = "", bodyClass = "", jsonld}){
  const t = T[lang], other = lang === "en" ? "es" : "en";
  const canonical = BASE + p;
  const alts = alt ? LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE + alt[l]}">`).join("") + `<link rel="alternate" hreflang="x-default" href="${BASE + alt.en}">` : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">${alts}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${lang === "en" ? "en_US" : "es_MX"}">
<meta name="theme-color" content="#EAEDE8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F1512" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${VERSION}">
${head}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body class="${bodyClass}" data-lang="${lang}">
<a class="skip" href="#main">${lang === "en" ? "Skip to content" : "Ir al contenido"}</a>
<header class="top">
  <a class="brand" href="/${lang}/">${ICON}<b>LibrePlato</b><span>${esc(t.tagline)}</span></a>
  <nav class="nav"><a href="/${lang}/">${t.home}</a><a href="/${lang}/${lang === "en" ? "guide" : "guia"}/">${t.guide}</a></nav>
  <button class="avoid-pill" type="button" data-open-picker aria-haspopup="dialog"><span class="eyebrow">${t.avoiding}</span> <span data-avoid-summary>${t.nothing}</span></button>
  <a class="lang" href="${alt ? alt[other] : "/" + other + "/"}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
</header>
<main id="main">
${body}
</main>
<footer class="foot"><div class="wrap"><p>${esc(t.footer)}</p><p><a href="/${lang}/${lang === "en" ? "about" : "acerca"}/">${t.about}</a> · <a href="${alt ? alt[other] : "/" + other + "/"}" hreflang="${other}">${t.otherLang}</a></p></div></footer>
${pickerDialog(lang)}
<script src="/assets/i18n.js?v=${VERSION}"></script>
<script src="/assets/engine.js?v=${VERSION}"></script>
<script src="/assets/site.js?v=${VERSION}"></script>
</body>
</html>`;
}

function pickerDialog(lang){
  const t = T[lang];
  const major = Object.entries(E.allergens).filter(([, v]) => v.major), minor = Object.entries(E.allergens).filter(([, v]) => !v.major);
  const chip = ([k, v]) => `<label class="chip"><input type="checkbox" value="${k}"><span>${esc(v[lang])}</span></label>`;
  return `<dialog class="picker" id="picker" aria-labelledby="picker-title">
<form method="dialog">
  <h2 id="picker-title">${t.pickTitle}</h2>
  <p class="lead">${esc(t.pickLead)}</p>
  <p class="eyebrow">${t.pickMajor}</p><div class="chips">${major.map(chip).join("")}</div>
  <p class="eyebrow">${t.pickOther}</p><div class="chips">${minor.map(chip).join("")}</div>
  <div class="picker-actions"><button type="button" class="btn ghost" data-clear>${t.clear}</button><button class="btn" value="done">${t.done}</button></div>
</form>
</dialog>`;
}

function chips(list, lang, cls){
  return list.map(a => `<span class="tag ${cls}" data-al="${a}">${esc(E.allergens[a][lang])}</span>`).join("");
}

function qtyText(ing, lang){
  const frac = ["tbsp", "tsp", "cup", "", "clove", "can", "pinch", "bunch", "sprig", "stalk", "piece", "leaf", "handful", "head", "slice", "loaf", "ball", "fillet", "thigh", "loin", "pod", "portion", "strip", "cube", "drop", "bottle", "plate", "base", "batch", "bigpinch"].includes(ing.u);
  if(ing.q == null) return "";
  return `${fmtNum(ing.q, lang, frac)}${ing.u ? " " + unit(ing.u, ing.q, lang) : ""}`;
}

/* ---------------- recipe pages ---------------- */
function recipePage(r, lang){
  const t = T[lang], x = r[lang], other = lang === "en" ? "es" : "en";
  const al = recipeAllergens(E, r);
  const alt = {en: url("en", r.id), es: url("es", r.id)};
  const related = RECIPES.filter(o => o.id !== r.id && o.region === r.region).slice(0, 60);
  const pick = [];
  for(let i = 0; i < related.length && pick.length < 4; i++) pick.push(related[(hash(r.id) + i * 7) % related.length]);
  const uniq = [...new Map(pick.map(o => [o.id, o])).values()];
  const ingList = r.ing.map((ing, i) => {
    const n = x.ing[i];
    return `<li class="ing" data-i="${i}"><span class="q mono" data-q>${esc(qtyText(ing, lang))}</span><span class="n"><span data-name>${esc(n.n)}</span>${n.note ? ` <span class="note">${esc(n.note)}</span>` : ""}</span></li>`;
  }).join("\n");
  const steps = x.steps.map((s, i) => `<li><span class="stepno mono">${String(i + 1).padStart(2, "0")}</span><p data-temp>${esc(s)}</p></li>`).join("\n");
  const tips = x.tips.length ? `<section class="tips"><h2>${t.tips}</h2><ul>${x.tips.map(s => `<li data-temp>${esc(s)}</li>`).join("")}</ul></section>` : "";
  const meta = [countryName(r, lang), COURSE[lang][r.course], t.minutes(r.time), `${t.serves} ${r.serves}`];
  if(r.ovenC) meta.push(`<span data-temp>${t.oven} ${r.ovenC} °C</span>`);
  const desc = `${x.blurb}`.slice(0, 155);
  const body = `<article class="recipe wrap" data-recipe="${r.id}">
<header class="rhead">
  <p class="eyebrow">${meta.map(m => m.startsWith("<") ? m : esc(m)).join(" · ")}</p>
  <h1>${esc(x.name)}</h1>
  ${x.lab ? `<p class="lab">${esc(x.lab)}</p>` : ""}
  <p class="blurb">${esc(x.blurb)}</p>
  <div class="altags">
    <p><span class="eyebrow">${t.contains}</span> ${al.a.length ? chips(al.a, lang, "contains") : `<span class="muted">${t.containsNone}</span>`}</p>
    ${al.may.length ? `<p><span class="eyebrow">${t.mayContain}</span> ${chips(al.may, lang, "may")}</p>` : ""}
  </div>
</header>
<div class="banner" data-banner hidden></div>
<div class="controls">
  <div class="stepper" role="group" aria-label="${t.serves}"><button type="button" data-serves="-1" aria-label="−">−</button><span><b class="mono" data-serves-n>${r.serves}</b> ${t.serves.toLowerCase()}</span><button type="button" data-serves="1" aria-label="+">+</button></div>
  <div class="seg" role="group" aria-label="${t.units}"><button type="button" data-units="metric">${t.metric}</button><button type="button" data-units="us">${t.us}</button></div>
  <button type="button" class="btn" data-cook>${t.cook}</button>
</div>
<div class="rbody">
  <section class="ings"><h2>${t.ingredients}</h2><ul class="ledger">${ingList}</ul></section>
  <section class="method"><h2>${t.method}</h2><ol class="steps">${steps}</ol>${tips}
  ${x.video ? `<p class="video"><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(x.video)}" rel="nofollow noopener" target="_blank">${t.video} ↗</a></p>` : ""}
  </section>
</div>
<p class="disclaimer">${esc(t.disclaimerShort)}</p>
${uniq.length ? `<section class="related"><h2>${t.related} ${esc(REGION[lang][r.region])}</h2><div class="grid">${uniq.map(o => card(o, lang)).join("")}</div></section>` : ""}
<script type="application/json" id="recipe-data">${JSON.stringify({id: r.id, serves: r.serves, ovenC: r.ovenC || null, ing: r.ing.map(({q, u, k, role}) => ({q, u, k, role}))})}</script>
</article>
<div class="cook" data-cook-view hidden role="dialog" aria-modal="true" aria-label="${t.cook}">
  <div class="cook-top"><span class="mono" data-cook-count></span><button type="button" class="btn ghost" data-cook-close>${t.close}</button></div>
  <p class="cook-step" data-cook-text data-temp></p>
  <div class="cook-nav"><button type="button" class="btn ghost" data-cook-prev>${t.prev}</button><button type="button" class="btn" data-cook-next>${t.next}</button></div>
</div>`;
  const diets = [];
  if(!al.a.includes("wheat") && !al.may.includes("wheat")) diets.push("https://schema.org/GlutenFreeDiet");
  if(!al.a.some(a => ["milk", "egg", "fish", "shellfish", "mollusc", "pork", "gelatin", "honey"].includes(a)) && !r.ing.some(i => ["beef", "chicken", "lamb", "duck", "veal", "rabbit", "pork", "porkbelly", "porkmince", "stock", "whitefish", "salmon", "tuna", "anchovy"].includes(i.k))) diets.push("https://schema.org/VeganDiet");
  const jsonld = {
    "@context": "https://schema.org", "@type": "Recipe", name: x.name, description: x.blurb, inLanguage: lang,
    image: [`${BASE}/img/${r.id}.svg`], author: {"@type": "Organization", name: "LibrePlato"},
    totalTime: `PT${r.time}M`, recipeYield: String(r.serves), recipeCategory: COURSE[lang][r.course], recipeCuisine: countryName(r, lang),
    recipeIngredient: r.ing.map((ing, i) => `${qtyText(ing, lang)} ${x.ing[i].n}${x.ing[i].note ? ", " + x.ing[i].note : ""}`.trim()),
    recipeInstructions: x.steps.map(s => ({"@type": "HowToStep", text: s})),
    keywords: [x.name, countryName(r, lang), ...al.a.length ? [] : [lang === "en" ? "allergy friendly" : "apto para alergias"]].join(", "),
    ...(diets.length ? {suitableForDiet: diets} : {}),
  };
  return page({lang, title: `${x.name} · LibrePlato`, desc, path: alt[lang], alt, body, jsonld, bodyClass: "is-recipe"});
}

function hash(s){ let h = 0; for(const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

function card(r, lang){
  const x = r[lang], al = recipeAllergens(E, r);
  const hay = [x.name, r.country, countryName(r, lang), ...x.ing.map(i => i.n)].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `<a class="card r-${r.region}" href="${url(lang, r.id)}" data-id="${r.id}" data-region="${r.region}" data-course="${r.course}" data-q="${esc(hay)}">
<span class="eyebrow">${esc(countryName(r, lang))} · ${esc(COURSE[lang][r.course])}</span>
<b class="cname">${esc(x.name)}</b>
<span class="cmeta mono">${T[lang].minutes(r.time)}</span>
<span class="verdict" data-verdict></span>
</a>`;
}

/* ---------------- home ---------------- */
function homePage(lang){
  const t = T[lang];
  const regions = [...new Set(RECIPES.map(r => r.region))].sort((a, b) => a === "latin-america" ? -1 : b === "latin-america" ? 1 : REGION[lang][a].localeCompare(REGION[lang][b]));
  const courses = [...new Set(RECIPES.map(r => r.course))];
  const major = Object.entries(E.allergens).filter(([, v]) => v.major);
  const body = `<section class="hero wrap">
  <h1>${t.pickTitle}</h1>
  <p class="lead">${esc(t.pickLead)}</p>
  <div class="chips hero-chips" data-inline-picker>${major.map(([k, v]) => `<label class="chip"><input type="checkbox" value="${k}"><span>${esc(v[lang])}</span></label>`).join("")}<button type="button" class="chip more" data-open-picker>${t.pickOther} +</button></div>
</section>
<section class="browse wrap">
  <div class="filters">
    <input class="search" type="search" placeholder="${esc(t.search)}" aria-label="${esc(t.search)}" data-search>
    <select data-region aria-label="${t.allRegions}"><option value="">${t.allRegions}</option>${regions.map(g => `<option value="${g}">${esc(REGION[lang][g])}</option>`).join("")}</select>
    <select data-course aria-label="${t.allCourses}"><option value="">${t.allCourses}</option>${courses.map(c => `<option value="${c}">${esc(COURSE[lang][c])}</option>`).join("")}</select>
    <label class="toggle"><input type="checkbox" data-hide-unsafe> ${t.hideUnsafe}</label>
  </div>
  <p class="count mono" data-count>${t.results(RECIPES.length)}</p>
  <div class="grid" data-grid>${RECIPES.slice().sort((a, b) => (a.region === "latin-america" ? 0 : 1) - (b.region === "latin-america" ? 0 : 1) || a[lang].name.localeCompare(b[lang].name, lang)).map(r => card(r, lang)).join("\n")}</div>
  <p class="empty" data-empty hidden>${t.noResults}</p>
</section>`;
  const jsonld = {"@context": "https://schema.org", "@type": "WebSite", name: "LibrePlato", url: `${BASE}/${lang}/`, inLanguage: lang, description: t.tagline};
  return page({lang, title: `LibrePlato · ${t.tagline}`, desc: t.pickLead, path: `/${lang}/`, alt: {en: "/en/", es: "/es/"}, body, jsonld, bodyClass: "is-home"});
}

/* ---------------- guide & about ---------------- */
const GUIDE = {en: "/en/guide/", es: "/es/guia/"}, ABOUT = {en: "/en/about/", es: "/es/acerca/"};
function guidePage(lang){
  const t = T[lang], R = REF[lang];
  const safe = s => esc(s).replace(/&lt;(\/?)(b|i|em|strong)&gt;/g, "<$1$2>");
  const tech = R.technique.map(g => `<section><h2>${esc(g.g)}</h2>${g.items.map(i => `<article class="note-card"><p class="eyebrow">${esc(i.w)}</p><h3>${esc(i.n)}</h3><p data-temp>${safe(i.d)}</p></article>`).join("")}</section>`).join("");
  const ratios = `<section><h2>${t.ratios}</h2><dl class="ratios">${R.ratios.map(x => `<div><dt>${esc(x.n)} <span class="mono">${esc(x.r)}</span></dt><dd>${safe(x.d)}</dd></div>`).join("")}</dl></section>`;
  const temps = `<section><h2>${t.temps}</h2><dl class="ratios">${R.temps.map(x => `<div><dt>${esc(x.k)} <span class="mono">${esc(x.v)}</span></dt><dd>${safe(x.n)}</dd></div>`).join("")}</dl></section>`;
  const rescue = `<section><h2>${t.rescue}</h2>${R.rescue.map(x => `<details class="rescue"><summary>${esc(x.q)}</summary><p>${safe(x.a)}</p></details>`).join("")}</section>`;
  const body = `<div class="wrap prose-page"><h1>${t.guideTitle}</h1>${tech}${ratios}${temps}${rescue}</div>`;
  return page({lang, title: `${t.guideTitle} · LibrePlato`, desc: lang === "en" ? "Why cooking techniques work, key ratios, safe temperatures and how to rescue common mistakes." : "Por qué funcionan las técnicas de cocina, proporciones clave, temperaturas seguras y cómo rescatar errores comunes.", path: GUIDE[lang], alt: GUIDE, body});
}
const ABOUT_TEXT = {
  en: `<p>LibrePlato is a recipe library built for people who can't eat everything. Tell it what you avoid, and every recipe adapts: each ingredient you can't have is swapped for one that does the same job in that dish, and every swap lists exactly what it contains.</p>
<h2>How the swaps work</h2><p>Every ingredient in every recipe is tagged with what it contains and what it often contains depending on the brand. A swap is only ever shown if nothing it contains is on your list. When a swap or an ingredient often includes something on your list (stock, spice blends, chocolate, oats), you'll see a "check the label" note. When no safe swap exists, the recipe says so instead of guessing.</p>
<h2>Please read labels</h2><p>Swaps are guidance, not medical advice. Brands change their recipes, and many foods are made on shared equipment. If you have a severe allergy, check every label and follow your doctor's advice.</p>
<h2>Where the recipes come from</h2><p>Every recipe is original: written for LibrePlato, in English and Spanish, and checked by automated tests for allergen tagging, quantities and both translations. We never copy recipes from other sites.</p>`,
  es: `<p>LibrePlato es un recetario para quienes no pueden comer de todo. Dile qué evitas y cada receta se adapta: cada ingrediente que no puedes comer se cambia por otro que cumple la misma función en ese plato, y cada cambio dice exactamente qué contiene.</p>
<h2>Cómo funcionan los cambios</h2><p>Cada ingrediente de cada receta está marcado con lo que contiene y con lo que suele contener según la marca. Un cambio solo aparece si nada de lo que contiene está en tu lista. Cuando un cambio o un ingrediente suele llevar algo de tu lista (caldo, mezclas de especias, chocolate, avena), verás un aviso para revisar la etiqueta. Si no existe un cambio seguro, la receta lo dice en vez de adivinar.</p>
<h2>Lee las etiquetas</h2><p>Los cambios son una guía, no un consejo médico. Las marcas cambian sus recetas y muchos alimentos se elaboran en equipos compartidos. Si tienes una alergia grave, revisa cada etiqueta y sigue las indicaciones de tu médico.</p>
<h2>De dónde salen las recetas</h2><p>Todas las recetas son originales: escritas para LibrePlato, en español e inglés, y revisadas con pruebas automáticas de alérgenos, cantidades y ambas traducciones. Nunca copiamos recetas de otros sitios.</p>`,
};
function aboutPage(lang){
  const t = T[lang];
  return page({lang, title: `${t.aboutTitle}`, desc: t.pickLead, path: ABOUT[lang], alt: ABOUT, body: `<div class="wrap prose-page"><h1>${t.aboutTitle}</h1>${ABOUT_TEXT[lang]}</div>`});
}

/* ---------------- cover art ---------------- */
const REGION_HUE = {"latin-america": 18, caribbean: 170, "north-america": 210, mediterranean: 42, "western-europe": 230, "central-europe": 260, "eastern-europe": 300,
  nordic: 195, "middle-east": 30, "north-africa": 12, "west-africa": 90, "east-africa": 60, "south-asia": 340, "southeast-asia": 140, "east-asia": 0, oceania: 185};
function cover(r){
  const h = REGION_HUE[r.region] ?? 40, n = r.en.name, lines = [];
  let cur = "";
  for(const w of n.split(" ")){ if((cur + " " + w).trim().length > 16){ lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  lines.push(cur.trim());
  const y0 = 470 - (lines.length - 1) * 50;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
<rect width="1200" height="900" fill="hsl(${h} 30% 90%)"/>
<circle cx="600" cy="450" r="330" fill="hsl(${h} 35% 97%)" stroke="hsl(${h} 25% 70%)" stroke-width="6"/>
<circle cx="600" cy="450" r="270" fill="none" stroke="hsl(${h} 25% 80%)" stroke-width="3"/>
<text x="600" y="${y0 - 90}" text-anchor="middle" font-family="Georgia, serif" font-size="34" letter-spacing="6" fill="hsl(${h} 30% 35%)">${esc(r.country.toUpperCase())}</text>
${lines.map((l, i) => `<text x="600" y="${y0 + i * 100}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="92" fill="hsl(${h} 30% 18%)">${esc(l)}</text>`).join("")}
<text x="600" y="${y0 + lines.length * 100 + 10}" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="8" fill="#8E6410">LIBREPLATO</text>
</svg>`;
}

/* ---------------- build ---------------- */
const VERSION = hash(JSON.stringify([fs.readFileSync(path.join(ROOT, "src/site.css"), "utf8"), fs.readFileSync(path.join(ROOT, "src/site.js"), "utf8"), fs.readFileSync(path.join(ROOT, "src/engine.js"), "utf8"), fs.readFileSync(path.join(ROOT, "src/i18n.js"), "utf8")])).toString(36);

fs.rmSync(OUT, {recursive: true, force: true});
for(const f of ["site.css", "site.js", "engine.js", "i18n.js", "icon.svg"]) write("assets/" + f, fs.readFileSync(path.join(ROOT, "src", f)));
// Engine data for the browser: allergens, ingredient tags and swaps, generic rules.
write("data/engine.json", JSON.stringify({allergens: E.allergens, ingredients: E.ingredients, roles: E.roles, generic: E.generic}));
// Per-recipe keys for the home page verdicts.
write("data/recipes.json", JSON.stringify(Object.fromEntries(RECIPES.map(r => [r.id, r.ing.map(i => [i.k, i.role])]))));

const sitemap = [];
for(const lang of LANGS){
  write(`${lang}/index.html`, homePage(lang));
  write(GUIDE[lang].slice(1) + "index.html", guidePage(lang));
  write(ABOUT[lang].slice(1) + "index.html", aboutPage(lang));
  sitemap.push({en: "/en/", es: "/es/"}, GUIDE, ABOUT);
}
for(const r of RECIPES){
  for(const lang of LANGS) write(url(lang, r.id).slice(1) + "index.html", recipePage(r, lang));
  write(`img/${r.id}.svg`, cover(r));
  sitemap.push({en: url("en", r.id), es: url("es", r.id)});
}
// Root: send people to their language; crawlers get links.
write("index.html", `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LibrePlato</title>
<link rel="alternate" hreflang="en" href="${BASE}/en/"><link rel="alternate" hreflang="es" href="${BASE}/es/"><link rel="alternate" hreflang="x-default" href="${BASE}/en/">
<script>try{var l=localStorage.getItem("mise.lang")||((navigator.language||"en").slice(0,2)==="es"?"es":"en");location.replace(l+"/${PREVIEW ? "index.html" : ""}")}catch(e){location.replace("en/${PREVIEW ? "index.html" : ""}")}</script>
<style>body{font:16px Georgia,serif;display:grid;place-items:center;min-height:90vh;background:#EAEDE8;color:#161D1A}a{margin:0 12px}</style></head>
<body><p><a href="/en/">English</a><a href="/es/">Español</a></p></body></html>`);
write("404.html", page({lang: "en", title: "Not found · LibrePlato", desc: "Page not found", path: "/404.html", body: `<div class="wrap prose-page"><h1>${T.en.notFound}</h1><p>${T.en.notFoundLead} <a href="/en/">${T.en.backHome}</a> · <a href="/es/">${T.es.backHome}</a></p></div>`}));
const seen = new Set();
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.filter(a => !seen.has(a.en) && seen.add(a.en)).flatMap(a => LANGS.map(l => `<url><loc>${BASE + a[l]}</loc>${LANGS.map(o => `<xhtml:link rel="alternate" hreflang="${o}" href="${BASE + a[o]}"/>`).join("")}</url>`)).join("\n")}
</urlset>`);
if(PREVIEW) fs.copyFileSync(path.join(ROOT, "src/preview-main.html"), path.join(OUT, "preview-main.html"));
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
write("_headers", `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/data/*\n  Cache-Control: public, max-age=3600\n`);
console.log(`built ${RECIPES.length} recipes (${ALL.length - RECIPES.length} scheduled) x ${LANGS.length} languages -> dist/`);
module.exports = {SLUG, RECIPES};
