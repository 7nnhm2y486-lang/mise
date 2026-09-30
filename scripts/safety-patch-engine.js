// Allergy safety review of the v1 substitution dictionary (2026-09-30).
// Every substitute now lists everything it contains ("carries") and what it
// often contains depending on brand ("may"). Ingredients that are usually
// store-bought get "may" + a label warning.
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "../data/engine/substitutions.json");
const S = JSON.parse(fs.readFileSync(FILE, "utf8"));
const I = S.ingredients;

const T = (es, en) => ({es, en});
const sub = (f, carries, may, es, en) => ({f, carries, ...(may.length ? {may} : {}), es: {to: es[0], note: es[1]}, en: {to: en[0], note: en[1]}});
function subsOf(k){ const e = I[k]; const out = []; for(const l of Object.values(e.s || {})) out.push(...l);
  for(const o of Object.values(e.sr || {})) for(const l of Object.values(o)) out.push(...l); return out; }
function find(k, prefix){ const x = subsOf(k).filter(s => s.es.to.startsWith(prefix));
  if(!x.length) throw new Error(`no sub "${prefix}" on ${k}`); return x; }
function setC(keys, prefix, carries, may){ for(const k of keys.split(" ")) for(const s of find(k, prefix)){
  if(carries) s.carries = carries; if(may) { if(may.length) s.may = may; else delete s.may; } } }
function replaceSubs(keys, tag, list){ for(const k of keys.split(" ")){ I[k].s = I[k].s || {}; I[k].s[tag] = list; } }
function def(keys, a, may, label, s){ for(const k of keys.split(" ")){ if(I[k]) throw new Error("exists " + k);
  I[k] = {a, ...(may.length ? {may} : {}), ...(label ? {label} : {}), ...(s ? {s} : {})}; } }
function addMay(keys, may, label){ for(const k of keys.split(" ")){ I[k].may = [...new Set([...(I[k].may||[]), ...may])]; if(label) I[k].label = label; } }

const OATS = ["wheat"]; // oats are usually cross-contaminated with gluten unless certified

/* ---- dairy ---- */
setC("butter", "mantequilla vegana", [], ["soy", "coconut", "treenut"]);
setC("butter ghee", "aceite de coco", ["coconut"]);
setC("milk", "leche de avena", [], OATS);
setC("cream heavycream", "crema de avena", [], OATS);
setC("buttermilk", "leche de avena", [], OATS);
setC("cheddar mozzarella gruyere cheese cotija queso", "queso vegano", [], ["coconut", "treenut", "soy"]);
setC("condensedmilk", "crema o crema de coco", ["milk"], ["coconut"]);
setC("evaporatedmilk", "leche de avena o de soja", [], ["soy", ...OATS]);
/* ---- egg ---- */
setC("egg", "1 cda de aceite + 1 cda de agua", [], ["corn"]);
setC("egg", "60 g de puré de manzana", [], ["corn"]);
setC("egg", "bebida vegetal + jarabe de arce", ["sugar"], ["soy", "treenut", "coconut", ...OATS]);
setC("mayo", "mayonesa de aquafaba", [], ["soy", "mustard"]);
addMay("mayo", ["mustard"], T("Muchas mayonesas llevan mostaza: revisa la etiqueta.", "Many mayonnaises contain mustard: check the label."));
/* ---- wheat ---- */
setC("apflour", "mezcla sin gluten", [], ["corn", "soy"]);
setC("breadflour", "mezcla panificable", [], ["corn", "soy"]);
S.roles.structure.wheat[0].may = ["corn", "soy"];
replaceSubs("semolina", "wheat", [
  sub(1, [], [], ["sémola de arroz", "Mismo grano y mismo comportamiento al espolvorear."], ["rice semolina", "Same grain size, behaves the same when dusted."]),
  sub(1, ["corn"], [], ["polenta fina", "Mismo comportamiento al espolvorear; algo más dulce."], ["fine polenta", "Behaves the same when dusted; a little sweeter."])]);
replaceSubs("pasta", "wheat", [
  sub(1, [], [], ["pasta de arroz integral", "Cuécela 1 min menos y termínala en la salsa; pasa de firme a papilla en un instante."], ["brown rice pasta", "Cook it 1 minute less and finish it in the sauce; it goes from firm to mush fast."]),
  sub(1, [], [], ["pasta de garbanzo", "La que mejor agarra la salsa y añade proteína."], ["chickpea pasta", "Holds sauce best and adds protein."]),
  sub(1, ["corn"], [], ["pasta de maíz", "Misma regla: 1 min menos y termínala en la salsa."], ["corn pasta", "Same rule: 1 minute less, finish in the sauce."])]);
setC("noodles udon ramennoodles", "soba de trigo sarraceno", [], ["wheat"]);
replaceSubs("breadcrumbs panko", "wheat", [
  sub(1, [], ["egg", "soy"], ["panko sin gluten certificado", "Cambio directo."], ["certified gluten-free panko", "Direct swap."]),
  sub(1, [], [], ["galletas de arroz trituradas", "Más grueso y crujiente; dora antes, así que baja el horno 10 °C."], ["crushed rice crackers", "Coarser and crunchier; browns faster, so drop the oven 10 °C."]),
  sub(1, ["corn"], [], ["hojuelas de maíz certificadas sin gluten, trituradas", "Las hojuelas de maíz normales llevan malta de cebada, que tiene gluten: solo las certificadas."], ["certified gluten-free cornflakes, crushed", "Regular cornflakes contain barley malt, which has gluten: certified ones only."])]);
setC("bread", "pan sin gluten", [], ["egg", "milk", "soy"]);
setC("phyllo", "masa filo sin gluten", [], ["egg", "corn"]);
/* ---- soy ---- */
setC("soysauce", "tamari", ["soy"], ["wheat"]);
setC("miso", "miso de garbanzo", [], ["wheat", "soy"]);
setC("gochujang", "miso de garbanzo", ["nightshade", "sugar"], ["wheat", "soy"]);
setC("gochujang", "gochujang certificado", ["soy", "nightshade", "sugar"]);
setC("doubanjiang", "miso de garbanzo", ["nightshade"], ["wheat", "soy"]);
setC("hoisin", "pasta de dátil", ["coconut", "allium", "sugar"]);
addMay("oystersauce", ["wheat"]); I.oystersauce.a = [...new Set([...I.oystersauce.a, "wheat"])];
setC("oystersauce", "salsa vegetariana", ["soy", "wheat", "sugar"]);
setC("oystersauce", "polvo de hongos", ["coconut", "sugar"]);
/* ---- nuts / seeds ---- */
setC("peanut peanutbutter", "tahini", ["sesame"]);
replaceSubs("almondflour", "treenut", [
  subsOf("almondflour")[0],
  sub(.9, ["corn"], [], ["polenta fina", "Más seca: añade 1 cdta de aceite por cada 50 g."], ["fine polenta", "Drier: add 1 tsp oil per 50 g."]),
  sub(.9, [], OATS, ["harina de avena certificada sin gluten", "Más seca: añade 1 cdta de aceite por cada 50 g."], ["certified gluten-free oat flour", "Drier: add 1 tsp oil per 50 g."])]);
/* ---- fish ---- */
setC("fishsauce", "sazonador de hongos", [], ["soy", "wheat"]);
setC("anchovy", "miso blanco", ["soy"], ["wheat"]);
setC("anchovy", "alcaparras", [], ["sulphite"]);
setC("shrimppaste", "miso blanco", ["soy"], ["wheat"]);
S.roles.umami.fish[0].may = ["wheat"];
/* ---- other ---- */
setC("mustard", "1/2 cdta de miel", ["sugar"]);
setC("wine winered winewhite", "caldo + 1 cdta", [], ["sulphite", "celery", "wheat"]);
setC("wine winered winewhite", "verjus o jugo", [], ["sulphite"]);
replaceSubs("wine winered winewhite", "sulphite", [
  sub(1, [], ["sulphite"], ["verjus etiquetado sin sulfitos añadidos", "Los sulfitos del vino dan más problemas de los que se suele pensar. Muchos vinagres (jerez, vino, a menudo manzana) también los llevan."], ["verjuice labelled no added sulphites", "Wine sulphites cause more trouble than people think. Many vinegars (sherry, wine, often cider) contain them too."]),
  sub(1, [], [], ["caldo casero + jugo de limón", "1 cdta de limón por cada 60 ml. Sin sulfitos y sin alcohol."], ["homemade stock + lemon juice", "1 tsp lemon per 60 ml. No sulphites, no alcohol."])]);
replaceSubs("beer", "alcohol", [
  sub(1, ["wheat"], ["sulphite"], ["cerveza sin alcohol", "Sigue llevando cebada (gluten)."], ["non-alcoholic beer", "Still made from barley (gluten)."]),
  sub(1, ["sugar"], ["celery", "wheat"], ["caldo + 1 cdta de melaza", "La melaza repone la malta."], ["stock + 1 tsp molasses", "The molasses stands in for the malt."])]);
setC("beer", "cerveza sin gluten o sidra", ["alcohol"], ["sulphite"]);
I.shaoxing.a = [...new Set([...I.shaoxing.a, "wheat"])];
setC("mirin sake shaoxing", "jugo de uva blanca", ["sugar"], ["sulphite"]);
setC("mirin sake shaoxing", "caldo + una pizca", ["sugar"], ["celery", "wheat"]);
addMay("mirin", ["corn"]);
setC("chorizo", "chorizo de res", ["nightshade"]);
replaceSubs("lard", "pork", [
  sub(1, [], [], ["sebo de res", "Misma solidez para masas quebradas."], ["beef tallow", "Same firmness for short pastry."]),
  sub(1, ["coconut"], [], ["aceite de coco refinado", "Misma solidez; el refinado no sabe a coco."], ["refined coconut oil", "Same firmness; refined doesn't taste of coconut."])]);
setC("honey", "jarabe de arce", ["sugar"]);
setC("cornstarch", "almidón de papa", ["nightshade"]);
replaceSubs("cornmeal polenta", "corn", [
  sub(1, [], [], ["harina de mijo", "Misma textura de grano, sabor más suave."], ["millet flour", "Same grainy texture, milder flavour."]),
  sub(1, ["wheat"], [], ["sémola fina de trigo", "Misma textura de grano. Lleva trigo."], ["fine wheat semolina", "Same grainy texture. Contains wheat."])]);
replaceSubs("masa corntortilla", "corn", [
  sub(1, [], [], ["tortillas o masa de harina de yuca", "La yuca da una tortilla flexible sin maíz ni trigo. Caliéntalas bien en comal seco."], ["cassava flour tortillas or dough", "Cassava makes a pliable tortilla with no corn or wheat. Heat them well on a dry pan."]),
  sub(1, ["wheat"], [], ["tortillas de harina de trigo", "Otro plato, pero el mismo uso."], ["wheat flour tortillas", "A different result, same job."])]);
replaceSubs("corn", "corn", [sub(1, [], [], ["chícharos", "Mismo dulzor y mismo color alegre en el plato."], ["green peas", "Same sweetness and the same pop of colour."])]);
setC("coconutmilk coconutcream", "crema de avena", ["sesame"], OATS);
replaceSubs("coconutoil", "coconut", [
  sub(1, [], ["soy"], ["manteca vegetal", "Sólida a temperatura ambiente, que suele ser el motivo de usar coco."], ["vegetable shortening", "Solid at room temperature, which is usually why coconut oil was used."]),
  sub(1, [], ["soy", "treenut", "coconut"], ["mantequilla vegana en bloque", "Revisa que no sea a base de coco."], ["vegan block butter", "Check it isn't coconut-based."])]);
setC("desiccatedcoconut", "avena molida", [], OATS);
setC("onion shallot leek scallion chive garlic", "1/", ["wheat"]);
setC("garlic", "aceite infusionado", [], ["allium"]);
for(const s of find("garlic", "aceite infusionado")){
  s.es.note += " Apto para dieta baja en FODMAP, NO para alergia al ajo.";
  s.en = {to: "garlic-infused oil", note: "The flavour compounds are fat-soluble and the fructans aren't, so infused oil is low-FODMAP and still tastes of garlic. Fine for low-FODMAP, NOT for a garlic allergy."}; }
setC("tomato tomatopaste", "remolacha asada", [], ["sulphite"]);
replaceSubs("potato", "nightshade", [
  sub(1, [], [], ["nabo o chirivía", "Se asa y se hace puré igual, algo más dulce."], ["turnip or parsnip", "Roasts and mashes the same, a little sweeter."]),
  sub(1, ["celery"], [], ["apionabo", "Muy buen puré. Es de la familia del apio."], ["celeriac", "Makes a great mash. It is a type of celery."])]);
/* chocolate */
addMay("darkchocolate cocoanibs", ["milk"], T("Casi todo el chocolate negro se hace en líneas con leche: revisa el aviso de trazas.", "Most dark chocolate is made on lines shared with milk: check the 'may contain' note."));
setC("darkchocolate cocoanibs", "chocolate negro", ["sugar"], ["milk"]);
setC("milkchocolate", "chocolate 'con leche'", ["sugar"], ["soy", ...OATS]);
setC("milkchocolate", "chocolate sin azúcar", ["milk"], ["soy"]);
setC("chocolatechips", "chispas de chocolate sin lácteos", ["sugar"], ["milk", "soy"]);
setC("chocolatechips", "chispas de chocolate sin azúcar", ["milk"], ["soy"]);
setC("whitechocolate", "chocolate blanco", ["sugar"], ["soy", "coconut", ...OATS]);
setC("puffpastry", "hojaldre sin gluten", [], ["milk", "egg", "corn"]);
setC("puffpastry", "hojaldre hecho", ["wheat"], ["soy", "coconut"]);
setC("marzipan almondpaste", "mazapán", ["sugar"]);

/* ---- new keys for ingredients v1 left untagged ---- */
def("porkmince", ["pork"], [], null, {pork: [
  sub(1, [], [], ["carne molida de res o de pollo, con 1 cda de aceite por cada 250 g", "Menos grasa que el cerdo: el aceite la compensa."], ["ground beef or chicken, with 1 tbsp oil per 250 g", "Leaner than pork: the oil makes up for it."])]});
def("cookedwheat", ["wheat"], [], null, {wheat: [
  sub(1, [], [], ["sorgo perlado o arroz integral cocido", "Misma mordida entera."], ["cooked pearled sorghum or brown rice", "Same whole-grain chew."])]});
def("chinkiang", ["wheat", "sugar"], ["sulphite"], null, {wheat: [
  sub(1, ["sugar"], [], ["vinagre de arroz + una pizca de azúcar morena", "Pierdes el fondo malteado, conservas la acidez suave."], ["rice vinegar + a pinch of brown sugar", "Loses the malty depth, keeps the soft acidity."])]});
def("tonkatsu okonomi", ["wheat", "soy", "sugar"], ["celery", "sulphite"], T("Las salsas japonesas comerciales varían mucho: revisa la etiqueta.", "Commercial Japanese sauces vary a lot: check the label."), {
  wheat: [sub(1, ["nightshade", "coconut", "sugar"], [], ["kétchup + aminos de coco + un poco de azúcar (2:1)", "Dulce, ácido y oscuro, sin trigo ni soja."], ["ketchup + coconut aminos + a little sugar (2:1)", "Sweet, tangy and dark, with no wheat or soy."])],
  soy: [sub(1, ["nightshade", "coconut", "sugar"], [], ["kétchup + aminos de coco + un poco de azúcar (2:1)", "Dulce, ácido y oscuro, sin trigo ni soja."], ["ketchup + coconut aminos + a little sugar (2:1)", "Sweet, tangy and dark, with no wheat or soy."])]});
def("winevinegar", ["sulphite"], [], null, {sulphite: [
  sub(1, [], [], ["jugo de limón", "La misma acidez, sin sulfitos."], ["lemon juice", "Same acidity, no sulphites."]),
  sub(1, [], ["sulphite"], ["vinagre de arroz", "Normalmente sin sulfitos añadidos; revisa la etiqueta."], ["rice vinegar", "Usually no added sulphites; check the label."])]});
def("almondextract", ["treenut"], [], null, {treenut: [
  sub(1, [], [], ["extracto de vainilla", "Otro aroma, mismo papel."], ["vanilla extract", "A different aroma doing the same job."])]});
def("asafoetida", ["wheat"], [], T("Casi toda la asafétida va cortada con harina de trigo: busca una certificada sin gluten.", "Most asafoetida is cut with wheat flour: look for a certified gluten-free one."), {wheat: [
  sub(1, [], [], ["asafétida certificada sin gluten", "Cortada con harina de arroz en vez de trigo."], ["certified gluten-free asafoetida", "Cut with rice flour instead of wheat."])]});
def("stock", [], ["celery", "wheat", "soy", "milk"], T("El caldo comprado suele llevar apio, trigo o soja: revisa la etiqueta o hazlo en casa.", "Store-bought stock often contains celery, wheat or soy: check the label or make your own."));
def("currypowder", [], ["mustard", "wheat", "celery"], T("Algunas mezclas de curry llevan mostaza, trigo o apio: revisa la etiqueta.", "Some curry powders contain mustard, wheat or celery: check the label."));
def("pickles", [], ["mustard", "sulphite"], T("Los encurtidos comerciales suelen llevar semilla de mostaza o sulfitos.", "Commercial pickles often contain mustard seed or sulphites."));
def("oats", [], OATS, T("La avena casi siempre tiene trazas de gluten: usa avena certificada sin gluten.", "Oats almost always carry gluten traces: use certified gluten-free oats."));
def("bakingpowder", [], ["corn"], T("La mayoría del polvo de hornear lleva fécula de maíz; hay versiones con almidón de papa.", "Most baking powder contains cornstarch; potato-starch versions exist."));
def("achiote", [], ["wheat", "corn"], T("La pasta de achiote comercial a veces lleva harina de trigo o de maíz.", "Commercial achiote paste sometimes contains wheat or corn flour."));
def("risotto", ["milk"], ["wheat"], null, {milk: [
  sub(1, [], [], ["risotto hecho con aceite de oliva y levadura nutricional", "Sin mantequilla ni queso; queda algo menos cremoso."], ["risotto made with olive oil and nutritional yeast", "No butter or cheese; a little less creamy."])]});

fs.writeFileSync(FILE, JSON.stringify(S, null, 1) + "\n");
console.log("patched;", Object.keys(I).length, "ingredient keys");
