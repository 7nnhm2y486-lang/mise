// LibrePlato swap engine. Shared by the site (browser) and the tests (Node).
// Given a recipe and the allergens someone avoids, it decides for every
// ingredient: fine as is, needs a label check, swap (with the safe options),
// or no safe swap. A substitute is only ever offered if nothing it contains
// ("carries") is on the avoid list. Substitutes that only *may* contain an
// avoided allergen (brand-dependent) are offered with a label warning, after
// the ones that don't.
(function(root, factory){
  if(typeof module === "object" && module.exports) module.exports = factory();
  else root.MiseEngine = factory();
})(typeof self !== "undefined" ? self : this, function(){

  const hit = (list, avoid) => (list || []).filter(a => avoid.has(a));

  // All substitutes that are candidates for replacing allergen `al` in
  // ingredient `k` used in role `role`, most specific first.
  function candidates(E, k, role, al){
    const info = E.ingredients[k] || {}, out = [];
    const push = (list, from) => { for(const s of list || []) out.push({s, from}); };
    if(info.sr && info.sr[role]) push(info.sr[role][al], "role");
    if(info.s) push(info.s[al], "ingredient");
    if(E.roles[role] && (E.generic[role] || []).includes(k)) push(E.roles[role][al], "generic");
    return out;
  }

  function adaptIngredient(E, ing, avoid){
    const info = E.ingredients[ing.k];
    if(!info) return {status: "unknown", contains: [], may: [], subs: []};
    const contains = hit(info.a, avoid), may = hit(info.may, avoid);
    if(!contains.length){
      return {status: may.length ? "check" : "ok", contains, may, subs: [], label: may.length ? info.label || null : null};
    }
    const seen = new Set(), subs = [];
    for(const al of contains){
      for(const {s, from} of candidates(E, ing.k, ing.role, al)){
        const id = s.en.to + "|" + s.f;
        if(seen.has(id)) continue;
        seen.add(id);
        if(hit(s.carries, avoid).length) continue;      // never offer a swap that contains an avoided allergen
        subs.push({...s, from, mayHit: hit(s.may, avoid)});
      }
    }
    // Swaps from one allergen's list must also be free of the ingredient's other
    // avoided allergens: guaranteed above, since `carries` lists everything a swap contains.
    subs.sort((x, y) => x.mayHit.length - y.mayHit.length);
    return {status: subs.length ? "swap" : "nosub", contains, may, subs, label: info.label || null};
  }

  function adaptRecipe(E, r, avoidList){
    const avoid = new Set(avoidList);
    const lines = r.ing.map(ing => adaptIngredient(E, ing, avoid));
    const st = new Set(lines.map(l => l.status));
    const verdict = st.has("nosub") || st.has("unknown") ? "unsafe" : st.has("swap") ? "adapted" : st.has("check") ? "check" : "safe";
    return {verdict, lines};
  }

  // Allergens a recipe contains / may contain, as written (no swaps).
  function recipeAllergens(E, r){
    const a = new Set(), may = new Set();
    for(const ing of r.ing){
      const info = E.ingredients[ing.k]; if(!info) continue;
      (info.a || []).forEach(x => a.add(x));
      (info.may || []).forEach(x => may.add(x));
    }
    for(const x of a) may.delete(x);
    return {a: [...a], may: [...may]};
  }

  // Scale a quantity by servings ratio and swap factor; keep it readable.
  function scaleQty(q, ratio){
    if(q == null) return null;
    const v = q * ratio;
    if(v >= 100) return Math.round(v / 5) * 5;
    if(v >= 10) return Math.round(v);
    if(v >= 1) return Math.round(v * 4) / 4;
    return Math.round(v * 8) / 8 || v;
  }

  return {adaptIngredient, adaptRecipe, recipeAllergens, scaleQty, candidates};
});
