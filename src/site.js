// Mise site behaviour: allergy profile, recipe adaptation, filters, units, cook mode.
(function(){
  "use strict";
  const lang = document.body.dataset.lang || "en";
  const I18N = window.MiseI18n, ENG = window.MiseEngine;
  const t = I18N.T[lang];
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d){ try{ const v = localStorage.getItem("mise." + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem("mise." + k, JSON.stringify(v)); }catch(e){} },
  };
  store.set("lang", lang);
  let avoid = store.get("avoid", []);
  let units = store.get("units", lang === "en" ? "us" : "metric");
  let E = null;
  const ROOT = document.body.dataset.root || "/";
  const engineReady = fetch(ROOT + "data/engine.json").then(r => r.json()).then(d => { E = d; return d; });

  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  const alName = a => (E && E.allergens[a] ? E.allergens[a][lang] : a);

  /* ---------- allergy picker ---------- */
  const picker = $("#picker");
  function syncChecks(){
    for(const box of $$('.chip input[type="checkbox"]')) box.checked = avoid.includes(box.value);
    const sum = $("[data-avoid-summary]");
    if(sum) sum.textContent = avoid.length ? avoid.map(alName).join(", ") : t.nothing;
  }
  function setAvoid(list){
    avoid = [...new Set(list)];
    store.set("avoid", avoid);
    syncChecks();
    render();
  }
  document.addEventListener("change", e => {
    const box = e.target.closest('.chip input[type="checkbox"]');
    if(!box) return;
    const next = new Set(avoid);
    box.checked ? next.add(box.value) : next.delete(box.value);
    setAvoid([...next]);
  });
  document.addEventListener("click", e => {
    if(e.target.closest("[data-open-picker]")){ e.preventDefault(); syncChecks(); if(picker.showModal) picker.showModal(); else picker.setAttribute("open", ""); }
    if(e.target.closest("[data-clear]")) setAvoid([]);
  });

  /* ---------- quantities & units ---------- */
  const FRACU = new Set(["tbsp", "tsp", "cup", "", "clove", "can", "pinch", "bunch", "sprig", "stalk", "piece", "leaf", "handful", "head", "slice", "loaf", "ball", "fillet", "thigh", "loin", "pod", "portion", "strip", "cube", "drop", "bottle", "plate", "base", "batch", "bigpinch"]);
  function toUnits(q, u){
    if(q == null || units !== "us") return [q, u];
    if(u === "g"){ if(q < 15) return [q, "g"]; if(q >= 454) return [q / 453.6, "lb"]; return [q / 28.35, "oz"]; }
    if(u === "kg") return [q * 2.2046, "lb"];
    if(u === "ml"){ if(q < 15) return [q / 4.93, "tsp"]; if(q < 60) return [q / 14.79, "tbsp"]; return [q / 240, "cup"]; }
    if(u === "l"){ const c = q * 1000 / 240; return c < 8 ? [c, "cup"] : [q * 1.057, "qt"]; }
    return [q, u];
  }
  function roundQ(v, u){
    if(u === "g" || u === "ml") return v >= 100 ? Math.round(v / 5) * 5 : v >= 10 ? Math.round(v) : Math.round(v * 2) / 2;
    if(u === "oz" || u === "lb" || u === "qt" || u === "kg" || u === "l") return v >= 10 ? Math.round(v) : Math.round(v * 4) / 4;
    return v;
  }
  function qtyStr(q, u, ratio){
    if(q == null) return "";
    let [v, uu] = toUnits(q * ratio, u);
    v = roundQ(v, uu);
    const frac = FRACU.has(uu) || uu === "oz" || uu === "lb" || uu === "qt";
    return I18N.fmtNum(v, lang, frac) + (uu ? " " + I18N.unit(uu, v, lang) : "");
  }
  function fahrenheit(text){
    if(units !== "us") return text;
    return text.replace(/(\d+)(?:\s*[-–]\s*(\d+))?\s*°C/g, (m, a, b) => {
      const f = c => Math.round((c * 9 / 5 + 32) / 5) * 5;
      return b ? `${f(+a)}-${f(+b)} °F` : `${f(+a)} °F`;
    });
  }
  function applyTemps(){
    for(const el of $$("[data-temp]")){
      if(!el.dataset.orig) el.dataset.orig = el.textContent;
      el.textContent = fahrenheit(el.dataset.orig);
    }
  }

  /* ---------- recipe page ---------- */
  const rdataEl = $("#recipe-data");
  const R = rdataEl ? JSON.parse(rdataEl.textContent) : null;
  let serves = R ? R.serves : 0;
  const choice = {};   // ingredient index -> chosen swap index

  function tagList(list, avoidSet, cls = ""){
    if(!list.length) return `<span>${esc(t.containsNone)}</span>`;
    return list.map(a => `<span class="tag ${cls} ${avoidSet.has(a) ? "hit" : ""}">${esc(alName(a))}</span>`).join("");
  }

  function renderRecipe(){
    if(!R || !E) return;
    const avoidSet = new Set(avoid);
    const res = ENG.adaptRecipe(E, R, avoid);
    const ratio = serves / R.serves;
    let swapped = 0;
    res.lines.forEach((line, i) => {
      const li = $(`.ing[data-i="${i}"]`); if(!li) return;
      const ing = R.ing[i];
      $("[data-q]", li).textContent = qtyStr(ing.q, ing.u, ratio);
      li.classList.remove("is-swapped");
      const old = $(".swap", li); if(old) old.remove();
      let html = "";
      if(line.status === "swap"){
        swapped++;
        li.classList.add("is-swapped");
        const idx = Math.min(choice[i] || 0, line.subs.length - 1), s = line.subs[idx];
        const q = s.f === 0 ? "" : qtyStr(ing.q == null ? null : ing.q * s.f, ing.u, ratio);
        const hasNote = s.mayHit.length ? `<div class="has"><b>${esc(t.checkLabel)}:</b> ${esc(t.mayHave)} ${tagList(s.mayHit, avoidSet)}</div>` : "";
        html = `<div class="swap"><div><span class="eyebrow">${esc(t.swapFor)}</span> ${q ? `<span class="sq">${esc(q)}</span>` : ""}<span class="to">${esc(s[lang].to)}</span></div>
          ${s[lang].note ? `<p class="why">${esc(fahrenheit(s[lang].note))}</p>` : ""}
          <div class="has"><span class="eyebrow">${esc(t.subContains)}</span> ${tagList(s.carries, avoidSet)}${s.may && s.may.length ? ` <span class="eyebrow">${esc(t.mayContain)}</span> ${tagList(s.may, avoidSet, "may")}` : ""}</div>
          ${hasNote}
          ${line.subs.length > 1 ? `<select data-choice="${i}" aria-label="${esc(t.otherSwaps)}">${line.subs.map((o, j) => `<option value="${j}" ${j === idx ? "selected" : ""}>${esc(o[lang].to)}${o.mayHit.length ? " ⚠" : ""}</option>`).join("")}</select>` : ""}
        </div>`;
      } else if(line.status === "nosub"){
        html = `<div class="swap nosub"><b>${esc(line.contains.map(alName).join(", "))}.</b> ${esc(t.noSub)}</div>`;
      } else if(line.status === "check"){
        html = `<div class="swap check"><b>${esc(t.checkLabel)}:</b> ${esc(t.mayHave)} ${tagList(line.may, avoidSet)}${line.label ? `<p class="why">${esc(line.label[lang])}</p>` : ""}</div>`;
      }
      if(html) li.insertAdjacentHTML("beforeend", html);
    });
    for(const tag of $$(".altags .tag")) tag.classList.toggle("hit", avoidSet.has(tag.dataset.al));
    const b = $("[data-banner]");
    if(b){
      b.hidden = false;
      b.className = "banner " + (avoid.length ? res.verdict : "none");
      const msg = !avoid.length ? t.setProfile : res.verdict === "safe" ? t.bannerSafe : res.verdict === "adapted" ? t.bannerAdapted(swapped) + (res.lines.some(l => l.status === "check") ? " " + t.bannerCheck : "") : res.verdict === "check" ? t.bannerCheck : t.bannerUnsafe;
      b.innerHTML = `<span>${esc(msg)}</span><button type="button" data-open-picker>${esc(avoid.length ? t.edit : t.pickTitle)}</button>`;
    }
    $("[data-serves-n]").textContent = serves;
    for(const btn of $$("[data-units]")) btn.setAttribute("aria-pressed", String(btn.dataset.units === units));
    applyTemps();
  }
  document.addEventListener("change", e => {
    const sel = e.target.closest("[data-choice]");
    if(sel){ choice[sel.dataset.choice] = +sel.value; renderRecipe(); }
  });
  document.addEventListener("click", e => {
    const sv = e.target.closest("[data-serves]");
    if(sv){ serves = Math.max(1, Math.min(60, serves + +sv.dataset.serves)); renderRecipe(); }
    const un = e.target.closest("[data-units]");
    if(un){ units = un.dataset.units; store.set("units", units); renderRecipe(); }
  });

  /* ---------- cook mode ---------- */
  let step = 0, lock = null;
  const cook = $("[data-cook-view]");
  function showStep(){
    const steps = $$(".steps p").map(p => p.textContent);
    step = Math.max(0, Math.min(steps.length - 1, step));
    $("[data-cook-count]").textContent = `${t.step} ${step + 1} ${t.of} ${steps.length}`;
    $("[data-cook-text]").textContent = steps[step];
    $("[data-cook-prev]").disabled = step === 0;
    $("[data-cook-next]").textContent = step === steps.length - 1 ? t.close : t.next;
  }
  async function openCook(){
    step = 0; cook.hidden = false; document.body.style.overflow = "hidden"; showStep();
    try{ if("wakeLock" in navigator) lock = await navigator.wakeLock.request("screen"); }catch(e){}
  }
  function closeCook(){ cook.hidden = true; document.body.style.overflow = ""; if(lock){ lock.release().catch(() => {}); lock = null; } }
  document.addEventListener("click", e => {
    if(e.target.closest("[data-cook]")) openCook();
    if(e.target.closest("[data-cook-close]")) closeCook();
    if(e.target.closest("[data-cook-prev]")){ step--; showStep(); }
    if(e.target.closest("[data-cook-next]")){ const n = $$(".steps p").length; if(step >= n - 1) closeCook(); else { step++; showStep(); } }
  });
  document.addEventListener("keydown", e => {
    if(!cook || cook.hidden) return;
    if(e.key === "Escape") closeCook();
    if(e.key === "ArrowRight"){ step++; showStep(); }
    if(e.key === "ArrowLeft"){ step--; showStep(); }
  });

  /* ---------- home: verdicts & filters ---------- */
  const grid = $("[data-grid]");
  let RK = null;
  const recipesReady = grid ? fetch(ROOT + "data/recipes.json").then(r => r.json()).then(d => { RK = d; }) : Promise.resolve();
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const verdictCache = {};
  function renderHome(){
    if(!grid || !E || !RK) return;
    const q = norm(($("[data-search]") || {}).value || "").trim().split(/\s+/).filter(Boolean);
    const region = ($("[data-region]") || {}).value, course = ($("[data-course]") || {}).value;
    const hide = ($("[data-hide-unsafe]") || {}).checked;
    let shown = 0;
    for(const card of grid.children){
      const id = card.dataset.id, key = id + "|" + avoid.join(",");
      let v = verdictCache[key];
      if(!v){ v = ENG.adaptRecipe(E, {ing: RK[id].map(([k, role]) => ({k, role}))}, avoid).verdict; verdictCache[key] = v; }
      const badge = $("[data-verdict]", card);
      badge.className = "verdict" + (avoid.length ? " v-" + v : "");
      badge.textContent = avoid.length ? t["v_" + v] : "";
      const ok = (!region || card.dataset.region === region) && (!course || card.dataset.course === course)
        && q.every(w => card.dataset.q.includes(w)) && !(hide && avoid.length && v === "unsafe");
      card.hidden = !ok; if(ok) shown++;
    }
    $("[data-count]").textContent = t.results(shown);
    $("[data-empty]").hidden = shown > 0;
  }
  for(const sel of ["[data-search]", "[data-region]", "[data-course]", "[data-hide-unsafe]"]){
    const el = $(sel); if(el) el.addEventListener("input", renderHome);
  }

  function render(){ renderRecipe(); renderHome(); }
  syncChecks();
  applyTemps();
  Promise.all([engineReady, recipesReady]).then(() => { syncChecks(); render(); }).catch(() => {
    const b = $("[data-banner]"); if(b){ b.hidden = false; b.className = "banner unsafe"; b.textContent = lang === "en" ? "Couldn't load the swap engine. Reload the page." : "No se pudo cargar el motor de cambios. Recarga la página."; }
  });
  if(picker) picker.addEventListener("close", render);
})();
