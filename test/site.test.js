// Builds the site and checks the output: every page links to pages that exist,
// every recipe has both languages, valid structured data and the disclaimer.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"), path = require("path");
const {execFileSync} = require("child_process");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");

execFileSync(process.execPath, [path.join(ROOT, "scripts/build.js"), "--base", "https://example.test"], {stdio: "pipe"});
const pages = [];
(function walk(d){ for(const f of fs.readdirSync(d)){ const p = path.join(d, f); if(fs.statSync(p).isDirectory()) walk(p); else if(f.endsWith(".html")) pages.push(p); } })(OUT);
const rel = p => "/" + path.relative(OUT, p).replace(/index\.html$/, "");

test("internal links all resolve", () => {
  const bad = [];
  for(const p of pages){
    const html = fs.readFileSync(p, "utf8");
    for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
      let target = path.join(OUT, m[1]);
      if(m[1].endsWith("/")) target = path.join(target, "index.html");
      if(!fs.existsSync(target)) bad.push(`${rel(p)} -> ${m[1]}`);
    }
  }
  assert.deepEqual(bad.slice(0, 20), []);
});

test("recipe pages: both languages, structured data, disclaimer", () => {
  const recipePages = pages.filter(p => /\/(recipes|recetas)\//.test(p));
  assert.ok(recipePages.length >= 600);
  for(const p of recipePages){
    const html = fs.readFileSync(p, "utf8");
    assert.match(html, /hreflang="en"/, rel(p));
    assert.match(html, /hreflang="es"/, rel(p));
    assert.match(html, /class="disclaimer"/, rel(p));
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(ld["@type"], "Recipe");
    assert.ok(ld.recipeIngredient.length > 0 && ld.recipeInstructions.length > 0, rel(p));
    const data = JSON.parse(html.match(/<script type="application\/json" id="recipe-data">(.*?)<\/script>/s)[1]);
    assert.equal((html.match(/class="ing"/g) || []).length, data.ing.length, rel(p));
  }
});

test("sitemap lists every recipe in both languages", () => {
  const sm = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
  const n = pages.filter(p => /\/(recipes|recetas)\//.test(p)).length;
  assert.equal((sm.match(/<url>/g) || []).length, n + 6);
});
