// Allergy safety pass 2 (2026-09-30): every ingredient line gets a key.
// Before this pass 1 in 9 ingredient lines had no key, so the engine treated
// things like pork, stock, vanilla extract or wine vinegar as allergen-free.
// Rule after this pass: no ingredient may have an empty key (tests enforce it).
// Keys with a: [] are explicitly checked as allergen-free (salt, water, rice...).
// Idempotent: safe to run again.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const EFILE = path.join(ROOT, "data/engine/substitutions.json");
const S = JSON.parse(fs.readFileSync(EFILE, "utf8"));
const I = S.ingredients;

const T = (es, en) => ({es, en});
const sub = (f, carries, may, es, en) => ({f, carries, ...(may.length ? {may} : {}), es: {to: es[0], note: es[1]}, en: {to: en[0], note: en[1]}});
function put(keys, a, may, label, s){ for(const k of keys.split(" ")){
  I[k] = {a, ...(may.length ? {may} : {}), ...(label ? {label} : {}), ...(s ? {s} : {})}; } }
function patch(k, f){ f(I[k]); }
const OATS = ["wheat"];
const PLANTMILK = ["soy", "treenut", "coconut", "wheat"];

/* ---------- allergen list ---------- */
// honey was used in `a` but never defined, so it could not be shown or avoided.
S.allergens.honey = {major: false, es: "Miel", en: "Honey"};

/* ---------- allergen-free basics (checked, a: []) ---------- */
put("salt", [], []);
put("water", [], []);
put("ice", [], []);
put("pepper", [], []);            // black / white / Sichuan pepper, allspice
put("spice", [], []);             // single whole or ground spices (cumin, cinnamon, clove...)
put("herb", [], []);              // fresh or dried herbs
put("citrus", [], []);            // lemon, lime, orange: juice, zest, fruit
put("veg", [], []);               // vegetables with no allergen tag
put("fruit", [], []);
put("rice", [], []);              // rice grains, rice flour, rice noodles
put("legume", [], []);            // beans, lentils, chickpeas, dal
put("mushroom", [], []);
put("seaweed", [], []);
put("beef", [], []);
put("chicken", [], []);
put("lamb", [], []);
put("duck", [], []);
put("veal", [], []);
put("rabbit", [], []);
put("yeast", [], []);
put("bakingsoda", [], []);
put("creamoftartar", [], []);
put("coffee", [], []);
put("flax", [], []);
put("nutyeast", [], []);
put("glycerin", [], []);
put("beeswax", [], []);
put("skewer", [], []);
put("oliveoil", [], []);
put("oil", [], [], T("Usa un aceite neutro como girasol o canola. Si usas aceite de cacahuate o de sésamo, cuenta ese alérgeno.", "Use a neutral oil such as sunflower or canola. If you use peanut or sesame oil, count that allergen."));
put("vanillabean", [], []);
put("cocoa", [], ["milk"], T("Algunos cacaos se procesan en líneas con leche: revisa el aviso de trazas.", "Some cocoa is processed on lines shared with milk: check the 'may contain' note."));
put("xanthan", [], ["corn"], T("La goma xantana suele fermentarse con azúcar de maíz.", "Xanthan gum is usually fermented from corn sugar."));
put("sugarsub", [], ["corn"], T("Muchos sustitutos de azúcar (eritritol) se hacen a partir de maíz.", "Many sugar substitutes (erythritol) are made from corn."));
put("allulose", [], []);
put("foodcolour", [], ["corn"], T("Los colorantes en gel suelen llevar jarabe de maíz o glicerina.", "Gel colours often contain corn syrup or glycerin."));
put("duckfat", [], []);
put("chickenfat", [], []);
put("lambfat", [], []);
put("bonemarrow", [], []);

/* ---------- vanilla, spirits, vinegars ---------- */
put("vanilla", ["alcohol"], [], T("El extracto de vainilla lleva alrededor de 35% de alcohol.", "Vanilla extract is about 35% alcohol."), {alcohol: [
  sub(1, [], [], ["semillas de vaina de vainilla", "Media vaina por cada cucharadita de extracto."], ["vanilla bean seeds", "Half a bean per teaspoon of extract."]),
  sub(1, [], ["corn"], ["vainilla sin alcohol (a base de glicerina) o vainilla en polvo", "Misma cantidad. Revisa la etiqueta: algunas llevan jarabe de maíz."], ["alcohol-free vanilla (glycerin-based) or vanilla powder", "Same amount. Check the label: some contain corn syrup."])]});
put("spirit", ["alcohol"], ["sulphite"], null, {alcohol: [
  sub(1, ["sugar"], ["sulphite"], ["jugo de manzana o de uva blanca", "Aporta el líquido y algo de fruta, no el golpe del alcohol."], ["apple or white grape juice", "Brings the liquid and some fruit, not the kick of the alcohol."]),
  sub(1, [], [], ["agua con unas gotas de jugo de limón", "Para marinadas y salmueras, donde el alcohol solo aporta líquido y acidez."], ["water with a few drops of lemon juice", "For marinades and cures, where the alcohol only adds liquid and acidity."])]});
put("nutliqueur", ["alcohol", "treenut", "sugar"], [], T("El amaretto y los licores de avellana o almendra cuentan como frutos secos.", "Amaretto and hazelnut or almond liqueurs count as tree nuts."), {
  alcohol: [sub(1, ["sugar"], ["sulphite"], ["jugo de uva blanca + unas gotas de vainilla en vaina", "Dulzor y aroma sin alcohol ni frutos secos."], ["white grape juice + a little vanilla bean", "Sweetness and aroma with no alcohol or nuts."])],
  treenut: [sub(1, ["sugar"], ["sulphite"], ["jugo de uva blanca + unas gotas de vainilla en vaina", "Dulzor y aroma sin alcohol ni frutos secos."], ["white grape juice + a little vanilla bean", "Sweetness and aroma with no alcohol or nuts."])]});
put("cidervinegar", [], ["sulphite"], T("Algunos vinagres de manzana llevan sulfitos añadidos.", "Some cider vinegars have added sulphites."), {sulphite: [
  sub(1, [], [], ["jugo de limón", "La misma acidez, sin sulfitos."], ["lemon juice", "Same acidity, no sulphites."])]});
put("whitevinegar", [], ["corn"], T("El vinagre blanco destilado suele hacerse de maíz.", "Distilled white vinegar is often made from corn."), {corn: [
  sub(1, [], ["sulphite"], ["vinagre de manzana", "Misma acidez, algo más afrutado."], ["cider vinegar", "Same acidity, a little fruitier."]),
  sub(1, [], [], ["jugo de limón", "Misma acidez."], ["lemon juice", "Same acidity."])]});
put("vinegar", [], ["sulphite", "corn", "wheat"], T("Según el tipo, el vinagre puede llevar sulfitos (vino), maíz (destilado) o gluten (malta). Usa uno cuyo origen conozcas.", "Depending on the type, vinegar can carry sulphites (wine), corn (distilled) or gluten (malt). Use one whose source you know."), {sulphite: [
  sub(1, [], [], ["jugo de limón", "La misma acidez."], ["lemon juice", "Same acidity."])]});
put("ricevinegar", [], []);
put("canevinegar", [], ["coconut"], T("Si usas vinagre de coco, cuenta el coco.", "If you use coconut vinegar, count coconut."));
put("maltvinegar", ["wheat"], [], T("El vinagre de malta se hace con cebada: tiene gluten.", "Malt vinegar is made from barley: it contains gluten."), {wheat: [
  sub(1, [], ["sulphite"], ["vinagre de manzana", "Menos malteado, misma acidez."], ["cider vinegar", "Less malty, same acidity."])]});

/* ---------- pork and cured meats ---------- */
const PORKSUB = (es, en) => ({pork: [sub(1, [], [], es, en)]});
put("pork", ["pork"], [], null, PORKSUB(["muslo de pollo deshuesado o aguja de res, cortado igual", "El muslo aguanta cocciones largas; la res necesita algo más de tiempo."], ["boneless chicken thigh or beef chuck, cut the same way", "Thigh holds up to long cooking; beef needs a little longer."]));
put("porkbelly", ["pork"], [], null, PORKSUB(["costilla de res deshuesada o muslo de pollo con piel", "Busca la misma proporción de grasa; la costilla de res es lo más parecido."], ["boneless beef short rib or skin-on chicken thigh", "Look for the same fat ratio; beef short rib is closest."]));
put("porktrotter", ["pork"], [], T("La manita da gelatina al caldo.", "The trotter gives the broth its body."), PORKSUB(["pata o alas de pollo", "Mucho colágeno: el caldo cuaja igual al enfriarse."], ["chicken feet or wings", "Lots of collagen: the broth still sets when cold."]));
put("porkskin", ["pork"], [], null, PORKSUB(["omítela", "Solo aporta cuerpo; el plato funciona sin ella."], ["leave it out", "It only adds body; the dish works without it."]));
put("sausage", ["pork"], ["wheat", "milk", "soy", "sulphite", "mustard", "celery"], T("Los embutidos comerciales pueden llevar trigo, leche, soja, sulfitos, mostaza o apio: revisa la etiqueta.", "Commercial sausages can contain wheat, milk, soy, sulphites, mustard or celery: check the label."), PORKSUB(["salchicha de pollo o de res", "Revisa la etiqueta igual que con la de cerdo."], ["chicken or beef sausage", "Check the label just as with pork."]));
patch("pork", e => {});
put("chinesesausage", ["pork", "alcohol", "soy", "sugar"], ["wheat", "sulphite"], T("El lap cheong lleva vino de arroz y salsa de soja.", "Lap cheong contains rice wine and soy sauce."));
put("curedmeat", ["pork"], ["milk", "treenut", "sulphite"], T("La mortadela suele llevar pistachos; algunos embutidos llevan leche.", "Mortadella often contains pistachios; some cured meats contain milk."), PORKSUB(["pechuga de pavo curada o bresaola", "Revisa la etiqueta de la misma forma."], ["cured turkey breast or bresaola", "Check the label the same way."]));
put("chashu", ["pork", "soy", "wheat", "alcohol", "sugar"], [], T("Se hace con salsa de soja, mirin y sake.", "Made with soy sauce, mirin and sake."));
put("ramenegg", ["egg", "soy", "wheat", "alcohol"], [], T("Marinado en salsa de soja y mirin.", "Marinated in soy sauce and mirin."));
put("duckconfit", [], ["pork", "sulphite"], T("Algunos confit se conservan en manteca de cerdo.", "Some confit is kept in pork lard."));
put("driedmeat", [], ["sulphite"], T("La carne seca comercial puede llevar sulfitos o nitritos.", "Commercial dried meat can contain sulphites or nitrites."));

/* ---------- sauces, pastes, blends ---------- */
put("ketchup", ["nightshade", "sugar"], ["corn", "celery", "sulphite"], T("Muchos kétchups llevan jarabe de maíz o vinagre de maíz.", "Many ketchups contain corn syrup or corn vinegar."));
put("worcestershire", ["fish", "sugar"], ["wheat", "soy", "sulphite"], T("Lleva anchoas. Algunas versiones usan vinagre de malta (gluten).", "Contains anchovies. Some versions use malt vinegar (gluten)."), {fish: [
  sub(1, ["soy", "sugar"], ["wheat"], ["salsa de soja + unas gotas de vinagre de manzana y una pizca de azúcar", "Umami y acidez sin pescado."], ["soy sauce + a few drops of cider vinegar and a pinch of sugar", "Umami and acidity without the fish."]),
  sub(1, ["coconut", "sugar"], ["sulphite"], ["aminos de coco + unas gotas de vinagre de manzana", "Sin pescado, soja ni trigo; algo más dulce."], ["coconut aminos + a few drops of cider vinegar", "No fish, soy or wheat; a little sweeter."])]});
put("horseradish", [], ["sulphite", "milk", "egg", "mustard"], T("El rábano picante preparado puede llevar sulfitos, leche o huevo. Es pariente de la mostaza: con alergia a la mostaza, consúltalo.", "Prepared horseradish can contain sulphites, milk or egg. It is related to mustard: with a mustard allergy, check with your doctor."));
put("sriracha", ["nightshade", "allium", "sugar"], ["sulphite"]);
put("hotsauce", ["nightshade"], ["allium", "sulphite"], T("Revisa la etiqueta: muchas salsas picantes llevan ajo.", "Check the label: many hot sauces contain garlic."));
put("harissa", ["nightshade", "allium"], []);
put("chilioil", ["nightshade"], ["soy", "sesame", "peanut", "allium"], T("Los aceites de chile comerciales pueden llevar soja, sésamo o cacahuate.", "Commercial chili oils can contain soy, sesame or peanut."));
put("chilipaste", ["nightshade"], ["shellfish", "fish", "soy", "allium"], T("Las pastas de chile del sudeste asiático suelen llevar camarón seco o pescado.", "Southeast Asian chili pastes often contain dried shrimp or fish."));
put("currypaste", ["nightshade", "allium", "shellfish"], ["fish", "peanut", "soy", "sugar"], T("Casi todas las pastas de curry tailandesas llevan pasta de camarón.", "Almost all Thai curry pastes contain shrimp paste."), {shellfish: [
  sub(1, ["nightshade", "allium"], ["soy", "fish", "peanut"], ["pasta de curry vegana (etiqueta sin camarón)", "Existen marcas sin marisco; revisa la etiqueta completa."], ["vegan curry paste (labelled shrimp-free)", "Shellfish-free brands exist; read the whole label."])]});
put("spiceblend", [], ["nightshade", "mustard", "wheat", "celery"], T("Las mezclas de especias pueden llevar chile, mostaza, apio o asafétida cortada con trigo: revisa la etiqueta.", "Spice blends can contain chili, mustard, celery or asafoetida cut with wheat: check the label."));
put("chilliblend", ["nightshade"], ["allium", "wheat", "celery"], T("Las mezclas de chile a menudo llevan ajo.", "Chili blends often contain garlic."));
put("cajun", ["nightshade"], ["allium", "celery", "mustard", "wheat"], T("Las mezclas cajún suelen llevar ajo y a veces apio o mostaza.", "Cajun blends usually contain garlic and sometimes celery or mustard."));
put("shichimi", ["nightshade", "sesame"], []);
put("kimchi", ["nightshade", "allium", "fish", "shellfish"], ["wheat", "mollusc", "sugar"], T("El kimchi tradicional lleva salsa de pescado y camarón salado.", "Traditional kimchi contains fish sauce and salted shrimp."), {
  fish: [sub(1, ["nightshade", "allium"], ["soy", "wheat"], ["kimchi vegano (etiqueta sin pescado ni marisco)", "Se vende en muchas tiendas coreanas."], ["vegan kimchi (labelled no fish or shellfish)", "Sold in many Korean groceries."])],
  shellfish: [sub(1, ["nightshade", "allium"], ["soy", "wheat"], ["kimchi vegano (etiqueta sin pescado ni marisco)", "Se vende en muchas tiendas coreanas."], ["vegan kimchi (labelled no fish or shellfish)", "Sold in many Korean groceries."])]});
put("fishcake", ["fish", "wheat"], ["soy", "egg", "shellfish", "sugar"]);
put("pesto", ["treenut", "milk", "allium"], [], T("Lleva piñones y parmesano; algunos comerciales usan anacardo.", "Contains pine nuts and parmesan; some store-bought ones use cashew."), {
  treenut: [sub(1, ["milk", "allium"], [], ["pesto hecho con semillas de girasol en vez de piñones", "Tuesta las semillas; mismo cuerpo."], ["pesto made with sunflower seeds instead of pine nuts", "Toast the seeds; same body."])],
  milk: [sub(1, ["treenut", "allium"], [], ["pesto sin queso con 1 cda de levadura nutricional", "Sal un poco más."], ["cheese-free pesto with 1 tbsp nutritional yeast", "Salt it a little more."])]});
put("ragu", ["nightshade", "allium", "milk", "pork", "alcohol", "sulphite", "celery"], [], T("Hazlo con la receta de ragú de Mise aplicando tus sustituciones.", "Make it from Mise's ragù recipe with your swaps applied."));
put("fermentedtofu", ["soy", "alcohol"], ["wheat"]);
put("yeastextract", ["wheat"], [], T("El extracto de levadura se hace con levadura de cerveza (cebada).", "Yeast extract is made from brewer's yeast (barley)."));
put("maltose", ["sugar"], ["wheat"], T("La maltosa se hace a veces con malta de cebada.", "Maltose is sometimes made with barley malt."));
put("ricesyrup", ["sugar"], ["wheat"], T("El jarabe de arroz coreano suele hacerse con malta de cebada.", "Korean rice syrup is often made with barley malt."));
put("pickledmustardgreens", ["mustard"], ["sulphite", "soy", "sugar"], T("Son hojas de mostaza: con alergia a la mostaza, evítalas.", "These are mustard greens: avoid them with a mustard allergy."));
put("chinesesesamepaste", ["sesame"], ["peanut"], T("Algunas pastas de sésamo chinas se mezclan con cacahuate.", "Some Chinese sesame pastes are blended with peanut."));
put("friedshallot", ["allium"], ["wheat"], T("La chalota frita comercial a veces se enharina con trigo.", "Store-bought fried shallots are sometimes dusted with wheat flour."));
put("gingergarlic", ["allium"], ["sulphite"]);
put("sundriedtomato", ["nightshade"], ["sulphite"]);
put("pickledpepper", ["nightshade"], ["sulphite"]);
put("capers", [], ["sulphite"]);
put("olives", [], ["sulphite"]);
put("driedfruit", [], ["sulphite"], T("La fruta seca comercial a menudo lleva sulfitos.", "Commercial dried fruit often contains sulphites."));
put("candiedfruit", ["sugar"], ["sulphite", "corn"], T("La fruta confitada suele llevar sulfitos y jarabe de maíz.", "Candied fruit usually contains sulphites and corn syrup."));
put("jam", ["sugar"], ["sulphite", "corn"]);
put("sprinkles", ["sugar"], ["corn", "soy", "milk", "gelatin", "wheat"], T("Revisa la etiqueta: pueden llevar maíz, soja, leche, gelatina o trigo.", "Check the label: they can contain corn, soy, milk, gelatin or wheat."));
put("caramelsauce", ["sugar"], ["milk"]);
put("farofa", [], ["milk", "pork"], T("La farofa es harina de yuca tostada, a menudo con mantequilla o tocino.", "Farofa is toasted cassava flour, often with butter or bacon."));
put("ricecake", [], ["wheat"], T("Algunos tteok llevan trigo: busca los de 100% arroz.", "Some tteok contain wheat: look for 100% rice ones."));
put("tamarind", [], ["sulphite"]);
put("achiote", [], ["wheat", "corn", "sulphite"], T("La pasta de achiote comercial a veces lleva harina de trigo o de maíz, y vinagre.", "Commercial achiote paste sometimes contains wheat or corn flour, and vinegar."));
put("yuzu", [], []);
put("flowerwater", [], ["alcohol"], T("Algunas aguas de rosas o de azahar llevan alcohol como conservante.", "Some rose and orange-blossom waters use alcohol as a preservative."));

/* ---------- dairy / chocolate composites ---------- */
put("icecream", ["milk", "sugar"], ["egg", "soy", "corn"], T("Muchos helados de vainilla llevan yema de huevo.", "Many vanilla ice creams contain egg yolk."), {milk: [
  sub(1, ["sugar"], ["soy", "coconut", "treenut", "wheat"], ["helado sin lácteos", "Revisa la base (soja, coco, frutos secos o avena)."], ["dairy-free ice cream", "Check the base (soy, coconut, nuts or oat)."])]});
put("dulcedeleche", ["milk", "sugar"], ["corn"], null, {milk: [
  sub(1, ["coconut", "sugar"], [], ["dulce de leche de coco (leche de coco condensada reducida)", "Cocina a fuego bajo hasta que tome color caramelo."], ["coconut dulce de leche (reduced sweetened condensed coconut milk)", "Cook low until it turns caramel-coloured."])]});
put("nutspread", ["treenut", "milk", "sugar"], ["soy"], null, {treenut: [
  sub(1, ["sugar"], ["milk", "soy"], ["crema de semillas de girasol con cacao", "Hay marcas hechas en plantas sin frutos secos."], ["sunflower seed cocoa spread", "Some brands are made in nut-free facilities."])]});
put("maltedmilk", ["milk", "wheat"], [], T("La leche malteada lleva malta de cebada y harina de trigo.", "Malted milk powder contains barley malt and wheat flour."));
put("milkpowder", ["milk"], [], null, {milk: [
  sub(1, ["soy"], [], ["leche de soja en polvo", "Mismo papel: dora y da sabor tostado."], ["soy milk powder", "Same job: browning and toasty flavour."])]});
put("veganbutter", [], ["soy", "coconut", "treenut"], T("Las mantequillas veganas se hacen con coco, soja o anacardo: revisa la etiqueta.", "Vegan butters are made from coconut, soy or cashew: check the label."));
put("dfchocolate", ["sugar"], ["soy", "milk", "treenut"], T("Aunque diga sin lácteos, revisa el aviso de trazas de leche y frutos secos.", "Even when labelled dairy-free, check the 'may contain' note for milk and nuts."));
put("unsweetenedchocolate", [], ["milk", "soy"]);
put("cookiedough", ["wheat", "milk", "egg", "sugar", "soy", "alcohol"], [], T("Hazla con la receta de galletas de Mise aplicando tus sustituciones.", "Make it from Mise's cookie recipe with your swaps applied."));

/* ---------- flour, pastry, bread composites ---------- */
const GFNOTE = T("Revisa que la mezcla sea certificada sin gluten; muchas llevan maíz, soja o avena.", "Check the blend is certified gluten-free; many contain corn, soy or oats.");
put("gfflour", [], ["corn", "soy", "nightshade"], GFNOTE);
put("rye", ["wheat"], [], T("El centeno tiene gluten.", "Rye contains gluten."), {wheat: [
  sub(1, [], [], ["harina de trigo sarraceno", "Mismo sabor terroso y oscuro, sin gluten."], ["buckwheat flour", "Same dark, earthy flavour, no gluten."])]});
put("sourdoughstarter", ["wheat"], [], null, {wheat: [
  sub(1, [], [], ["masa madre sin gluten (de arroz integral o trigo sarraceno)", "Misma hidratación; aliméntala igual."], ["gluten-free starter (brown rice or buckwheat)", "Same hydration; feed it the same way."])]});
put("shortcrust", ["wheat", "milk"], ["egg", "pork"], T("La masa quebrada comprada puede llevar huevo o manteca de cerdo.", "Store-bought shortcrust can contain egg or lard."), {
  wheat: [sub(1, ["milk"], ["egg", "corn"], ["masa quebrada sin gluten", "Más frágil: extiéndela entre dos papeles."], ["gluten-free shortcrust", "More fragile: roll it between two sheets of paper."])],
  milk: [sub(1, ["wheat"], ["soy", "coconut", "treenut"], ["masa quebrada hecha con mantequilla vegana en bloque", "Enfría la masa 30 min más."], ["shortcrust made with vegan block butter", "Chill the dough 30 min longer."])]});
put("sweetshortcrust", ["wheat", "milk", "egg", "sugar"], [], T("Hazla con la receta de pâte sucrée de Mise aplicando tus sustituciones.", "Make it from Mise's pâte sucrée recipe with your swaps applied."));
put("choux", ["wheat", "milk", "egg"], [], T("Hazla con la receta de choux de Mise. No hay sustituto fiable del huevo en la pasta choux.", "Make it from Mise's choux recipe. There is no reliable egg substitute in choux."), {
  wheat: [sub(1, ["milk", "egg"], ["corn"], ["pasta choux con mezcla sin gluten", "Hace menos volumen; hornéala 5 min más."], ["choux made with a gluten-free blend", "Puffs less; bake 5 min longer."])],
  milk: [sub(1, ["wheat", "egg"], ["soy", "coconut", "treenut"], ["pasta choux con agua y mantequilla vegana", "Todo agua en vez de leche; queda más crujiente."], ["choux made with water and vegan butter", "All water instead of milk; crisper shell."])]});
put("croissant", ["wheat", "milk", "egg"], ["sugar"]);
put("enrichedbread", ["wheat", "egg", "milk"], ["sesame", "soy", "sugar"], T("Los panes de hamburguesa pueden llevar sésamo o soja.", "Burger buns can contain sesame or soy."), {
  wheat: [sub(1, [], ["egg", "milk", "soy", "sesame"], ["pan sin gluten", "Tuéstalo antes."], ["gluten-free bread", "Toast it first."])]});
put("eggpasta", ["wheat", "egg"], [], null, {
  egg: [sub(1, ["wheat"], [], ["pasta seca de sémola (sin huevo)", "La mayoría de la pasta seca no lleva huevo; revisa la etiqueta."], ["dried semolina pasta (no egg)", "Most dried pasta has no egg; check the label."])],
  wheat: [sub(1, [], ["egg", "corn"], ["pasta sin gluten", "Cuécela 1 min menos y termínala en la salsa."], ["gluten-free pasta", "Cook it 1 minute less and finish it in the sauce."])]});
put("eggnoodles", ["wheat", "egg"], ["soy"], null, {
  wheat: [sub(1, [], [], ["fideos de arroz", "Mordida más suave."], ["rice noodles", "Softer bite."])],
  egg: [sub(1, [], [], ["fideos de arroz", "Mordida más suave."], ["rice noodles", "Softer bite."])]});
put("ladyfingers", ["wheat", "egg", "sugar"], [], null, {wheat: [
  sub(1, ["egg", "sugar"], ["corn"], ["soletillas sin gluten", "Se venden hechas; se empapan más rápido."], ["gluten-free ladyfingers", "Sold ready-made; they soak faster."])]});
put("amaretti", ["treenut", "egg", "sugar"], ["wheat"], null, {treenut: [
  sub(1, ["wheat", "sugar"], ["milk", "egg", "soy"], ["galletas de jengibre trituradas", "Mismo crujido y especia; no son sin gluten."], ["crushed ginger snaps", "Same crunch and spice; not gluten-free."])]});
put("tenkasu", ["wheat"], ["egg"]);
put("wafer", ["wheat"], ["milk", "soy", "sugar"]);
put("youtiao", ["wheat"], ["egg", "milk"], null, {wheat: [
  sub(1, [], [], ["galletas de arroz troceadas", "Aportan el crujido."], ["broken rice crackers", "They bring the crunch."])]});
put("stuffedpasta", ["wheat", "egg", "milk"], ["pork", "treenut"], T("La pasta rellena comprada suele llevar queso y a veces cerdo o nueces.", "Store-bought filled pasta usually contains cheese and sometimes pork or nuts."));
put("flatbread", ["wheat"], ["milk", "sesame"]);
put("injera", [], ["wheat"], T("La injera 100% teff no tiene gluten, pero muchas mezclan trigo o cebada.", "100% teff injera is gluten-free, but many mix in wheat or barley."));
put("risotto", ["milk"], ["alcohol", "sulphite", "celery", "wheat"], null, I.risotto && I.risotto.s);

/* ---------- fixes to existing keys ---------- */
patch("darkchocolate", e => { e.a = [...new Set([...e.a, "sugar"])]; });
patch("cocoanibs", e => { e.a = []; delete e.s; e.may = ["milk"]; });
for(const k of ["molasses", "treacle", "goldensyrup"]) patch(k, e => { e.a = ["sugar"]; });
patch("oystersauce", e => { e.a = ["mollusc", "soy", "wheat", "sugar"]; delete e.may; });
patch("mayo", e => { e.may = [...new Set([...(e.may || []), "mustard", "soy", "sulphite"])]; });
patch("tuna", e => { e.may = ["soy"]; });
patch("miso", e => { e.may = ["wheat"]; });
patch("currypowder", e => { e.a = ["nightshade"]; });
patch("mirin", e => { e.a = [...new Set([...e.a, "sugar"])]; });
patch("mustard", e => { e.may = ["sulphite"]; });
patch("stock", e => { e.may = ["celery", "wheat", "soy", "milk", "allium"]; });

fs.writeFileSync(EFILE, JSON.stringify(S, null, 1) + "\n");

/* ---------- recipe key assignment ---------- */
// Exact Spanish ingredient names (lower-case) -> key. Applied where the key is
// empty, or where RE_KEY lists a better key for a mis-keyed composite.
const NAME = {};
const add = (k, list) => list.split("|").forEach(n => { NAME[n.trim()] = k; });
add("salt", "sal|sal fina|sal en escamas|sal gruesa|agua para la salmuera");
add("water", "agua|agua tibia|agua hirviendo|agua caliente|agua helada|agua fría");
add("ice", "hielo|cubo de hielo");
add("pepper", "pimienta negra|pimienta blanca|pimienta negra en grano|pimienta en grano|pimienta blanca en grano|pimienta|pimienta de sichuan|pimienta de jamaica|pimienta de jamaica en grano");
add("spice", "canela|comino|nuez moscada|cúrcuma|azafrán|clavo|semilla de cilantro|anís estrellado|cardamomo verde|semilla de hinojo|canela molida|semilla de comino|cardamomo|comino molido|especias enteras|semilla de anís|vainas de cardamomo verde|cilantro molido|cinco especias|semilla de fenogreco|semilla de alcaravea|alcaravea|canela y nuez moscada|fenogreco|clavo y nuez moscada|rama de canela|jengibre molido|semilla de cardamomo|kasuri methi|amchur o limón|comino y orégano|cúrcuma fresca|polvo de filé");
add("herb", "perejil|cilantro|albahaca|laurel|romero|tomillo|eneldo|orégano|orégano seco|orégano mexicano|salvia|hojas de curry|menta|estragón|hojas de laurel|tomillo y laurel|hojas de cilantro|hojas de lima kaffir|citronela|galanga|perifollo|menta y cilantro|hierbas|hierbas frescas|perejil de hoja plana|hoja de pandan|albahaca tailandesa|tomillo seco|lechuga y hierbas|albahaca y perejil|albahaca genovesa|hierbas y germinados|hoja de laurel|mejorana|salvia fresca|cilantro y perejil|hojas de laksa|hojas de plátano|jengibre");
add("citrus", "jugo de limón|ralladura de limón|limón|jugo de lima|lima|ralladura de naranja|limones|cáscara de limón|jugo de naranja agria|naranja|ralladura de naranja y limón|limón en conserva");
add("yuzu", "jugo de yuzu o limón");
add("veg", "zanahoria|col|espinaca|chícharos|aguacate|camote|calabacín|col rizada|zanahoria y colinabo|verduras crudas|remolacha|alcachofas|pepino|pepinos|berza|coliflor|repollo|lechuga iceberg|aguacates|judías verdes|nagaimo|grelos o brócoli rabe|rúcula|col negra|calabaza y ejotes|lechuga|judías verdes planas|col, rábano, cebolla, limón, orégano|plátano maduro");
add("fruit", "piña|granos de granada|plátanos muy maduros|manzanas|pera asiática|mangos maduros|fresas|fresas o uvas");
add("rice", "arroz cocido|arroz basmati|arroz carnaroli|arroz de grano corto|arroz|arroz glutinoso|fideos de arroz|fideos de arroz finos|arroz sancochado|poha|arroz jazmín|arroz de grano largo|arroz largo sancochado|arroz blanco|fideos de arroz gruesos|harina de arroz glutinoso|arroz bomba|harina de arroz|fideos de arroz planos");
add("legume", "garbanzos|frijoles negros|toor dal|lentejas rojas|garbanzos secos|alubias borlotti|alubias blancas secas|urad dal|lentejas pardinas|lentejas pardinas o verdes|frijol mungo tostado|alubias cannellini|garrofón|germinado de soja");
add("mushroom", "hongos secos|champiñones|shiitake|setas frescas|porcini secos|shiitake seco|setas ostra");
add("seaweed", "kombu|alga nori|nori|wakame seca|aonori");
add("beef", "falda de res|aguja de res|lomo de res|jarrete o aguja de res|jarrete de res|res molida|chambarete y costilla de res|costilla de res|morcillo o aguja de res|lomo o entrecot de res|chuletón con hueso|huesos de res y rabo|aguja de res picada|res picada");
add("chicken", "muslos de pollo|muslo de pollo|pollo|muslos y piernas de pollo|piernas de pollo|pollo deshebrado|pollo cocido deshebrado|pollo troceado|pollo entero|muslos de pollo con hueso|pollo picado|pechugas de pollo|gallina|carcasas de pollo");
add("lamb", "paletilla de cordero picada gruesa|cordero picado");
add("veal", "jarrete de ternera|escalopes de ternera|redondo de ternera");
add("rabbit", "conejo");
add("pork", "espaldilla de cerdo|lomo de cerdo|manita de cerdo|costillas de cerdo|costillas de cerdo ahumadas|lomo de ternera o cerdo");
add("porkbelly", "panza de cerdo|panza de cerdo con piel");
add("porkmince", "cerdo picado|panza de cerdo picada");
add("porktrotter", "manita de cerdo");
add("porkskin", "corteza de cerdo");
add("duckconfit", "confit de pato");
add("duckfat", "grasa de pato");
add("chickenfat", "grasa de pollo");
add("lambfat", "grasa de cordero");
add("bonemarrow", "tuétano");
add("driedmeat", "carne seca");
add("chashu", "chashu de panza de cerdo");
add("oliveoil", "aceite de oliva|aceite de oliva virgen extra");
add("oil", "aceite|aceite neutro|aceite de girasol");
add("oliveoil", "aceite de dendê"); // palm oil: no listed allergen
add("yeast", "levadura seca instantánea|levadura fresca");
add("bakingsoda", "bicarbonato de sodio");
add("bakingpowder", "polvo de hornear");
add("creamoftartar", "cremor tártaro");
add("vanilla", "extracto de vainilla|vainilla");
add("vanillabean", "vaina de vainilla");
add("almondextract", "extracto de almendra|extracto de almendra amarga");
add("cocoa", "cacao en polvo");
add("coffee", "café espresso|café espresso instantáneo|café instantáneo|café espresso fuerte");
add("stock", "caldo de pollo|caldo de res|caldo de pollo o cerdo|agua o caldo de res|caldo de pollo o verduras|caldo o agua|agua o caldo|caldo de res o pollo|caldo de verduras|caldo de carne");
add("winevinegar", "vinagre de vino tinto|vinagre de vino blanco|vinagre de jerez|vinagre de estragón");
add("cidervinegar", "vinagre de manzana");
add("whitevinegar", "vinagre blanco");
add("vinegar", "vinagre");
add("ricevinegar", "vinagre de arroz");
add("canevinegar", "vinagre de caña o de coco");
add("maltvinegar", "vinagre de malta");
add("chinkiang", "vinagre de chinkiang");
add("capers", "alcaparras");
add("olives", "aceitunas verdes|aceitunas negras");
add("driedfruit", "pasas|higos secos");
add("pickles", "pepinillos|jengibre encurtido|nabo encurtido");
add("spirit", "coñac|vodka|ron oscuro|kirsch|aquavit o vodka|licor de anís");
add("wine", "vino marsala|ron o marsala");
add("nutliqueur", "licor de avellana o amaretto|licor de almendra");
add("spiceblend", "masala de biryani|mezcla chana masala|garam masala");
add("currypowder", "curry en polvo");
add("asafoetida", "asafétida");
add("achiote", "pasta de achiote");
add("tamarind", "tamarindo|pasta de tamarindo");
add("risotto", "risotto frío");
add("cookedwheat", "trigo cocido");
add("oats", "avena en hojuelas|avena");
add("xanthan", "goma xantana");
add("allulose", "alulosa");
add("glycerin", "glicerina vegetal");
add("flax", "linaza molida");
add("nutyeast", "levadura nutricional");
add("beeswax", "cera de abeja");
add("foodcolour", "colorante en gel|colorante rojo");
add("potato", "almidón de papa");
add("ricecake", "pastelitos de arroz");
add("pickledmustardgreens", "ya cai");
add("tonkatsu", "salsa tonkatsu");
add("okonomi", "salsa okonomi");
add("skewer", "brochetas de bambú");
add("veg", "almidón de tapioca agrio");  // cassava starch: no listed allergen
add("rice", "arroz");
add("flowerwater", "agua de rosas|agua de azahar");
add("mustard", "semilla de mostaza|mostaza en grano");
add("veg", "fideos de batata");

// Mis-keyed composites: [exact name, old key] -> new key.
const RE_KEY = [
  ["tofu rojo fermentado", "soysauce", "fermentedtofu"], ["extracto de levadura", "soysauce", "yeastextract"],
  ["pasta de jengibre y ajo", "garlic", "gingergarlic"],
  ["helado de vainilla", "cream", "icecream"], ["crema de avellanas y chocolate", "hazelnut", "nutspread"],
  ["fettuccine frescos", "pasta", "eggpasta"], ["láminas de lasaña", "pasta", "eggpasta"],
  ["pasta de chile", "chilli", "chilipaste"], ["sriracha", "chilli", "sriracha"], ["kimchi", "chilli", "kimchi"],
  ["kimchi ácido", "chilli", "kimchi"], ["aceite de chile", "chilli", "chilioil"], ["pasta de curry verde", "chilli", "currypaste"],
  ["pasta de curry khao soi o rojo", "chilli", "currypaste"], ["pasta de curry massaman", "chilli", "currypaste"],
  ["nam prik pao", "chilli", "currypaste"], ["pepperoncini", "chilli", "pickledpepper"], ["masala de nihari", "chilli", "spiceblend"],
  ["polvo de sambar", "chilli", "spiceblend"], ["shichimi", "chilli", "shichimi"], ["harissa", "chilli", "harissa"],
  ["salsa picante", "chilli", "hotsauce"], ["berbere", "chilli", "chilliblend"],
  ["rábano picante", "mustard", "horseradish"], ["mostaza china encurtida", "mustard", "pickledmustardgreens"],
  ["mermelada de frambuesa", "sugar", "jam"], ["mermelada de albaricoque", "sugar", "jam"], ["mermelada de grosella", "sugar", "jam"],
  ["mermelada de arándano rojo", "sugar", "jam"], ["fruta confitada", "sugar", "candiedfruit"], ["guindas en almíbar", "sugar", "candiedfruit"],
  ["maltosa", "sugar", "maltose"], ["grageas de colores", "sugar", "sprinkles"], ["salsa de caramelo", "sugar", "caramelsauce"],
  ["masa quebrada dulce", "apflour", "sweetshortcrust"], ["mezcla de harina sin gluten", "apflour", "gfflour"],
  ["harina de centeno oscuro", "apflour", "rye"], ["descarte de masa madre", "apflour", "sourdoughstarter"],
  ["youtiao", "apflour", "youtiao"], ["cruasanes", "apflour", "croissant"], ["pasta choux", "apflour", "choux"],
  ["masa quebrada", "apflour", "shortcrust"], ["tenkasu", "apflour", "tenkasu"], ["masa de croissant", "apflour", "croissant"],
  ["obleas", "apflour", "wafer"], ["savoiardi", "apflour", "ladyfingers"], ["bizcochos de soletilla", "apflour", "ladyfingers"],
  ["mantequilla vegana en bloque", "butter", "veganbutter"], ["dulce de leche", "condensedmilk", "dulcedeleche"],
  ["amaretti", "almondflour", "amaretti"], ["ragú espeso", "tomato", "ragu"], ["ragú a la boloñesa", "tomato", "ragu"],
  ["ragú de carne", "tomato", "ragu"], ["kétchup", "tomato", "ketchup"], ["tomates secos en aceite", "tomato", "sundriedtomato"],
  ["jarabe dorado", "molasses", "goldensyrup"], ["jarabe de arroz", "molasses", "ricesyrup"], ["farofa", "masa", "farofa"],
  ["pastel de pescado", "whitefish", "fishcake"], ["salsa worcestershire", "anchovy", "worcestershire"], ["pesto", "pinenut", "pesto"],
  ["salchicha de toulouse", "chorizo", "sausage"], ["salchicha andouille", "chorizo", "sausage"], ["salchicha", "chorizo", "sausage"],
  ["linguiça", "chorizo", "sausage"], ["salchicha china", "chorizo", "chinesesausage"], ["salchicha o tocino", "bacon", "sausage"],
  ["salami y mortadela", "pancetta", "curedmeat"], ["mortadela", "pancetta", "curedmeat"],
  ["chocolate negro sin lácteos", "darkchocolate", "dfchocolate"], ["masa de galleta con chispas", "chocolatechips", "cookiedough"],
  ["chocolate negro sin azúcar", "chocolatechips", "unsweetenedchocolate"], ["sustituto de azúcar morena", "brownsugar", "sugarsub"],
  ["brioche", "bread", "enrichedbread"], ["pan de hamburguesa", "bread", "enrichedbread"], ["fideos de huevo", "noodles", "eggnoodles"],
  ["leche malteada en polvo", "milk", "maltedmilk"], ["leche en polvo", "milk", "milkpowder"], ["sazonador cajún", "paprika", "cajun"],
  ["pasta de sésamo china", "tahini", "chinesesesamepaste"], ["chalota frita", "onion", "friedshallot"],
];
// Per-recipe overrides: [recipe id, ingredient index, new key].
const PER = [
  ["shoyuramen", 9, "ramenegg"],
];

let changed = 0, files = 0;
const RECIPES = path.join(ROOT, "data/recipes");
for(const f of fs.readdirSync(RECIPES)){
  const file = path.join(RECIPES, f), r = JSON.parse(fs.readFileSync(file, "utf8"));
  let dirty = false;
  r.ing.forEach((x, i) => {
    const n = r.es.ing[i].n.toLowerCase().trim();
    let nk = x.k;
    if(!x.k && NAME[n]) nk = NAME[n];
    for(const [name, old, to] of RE_KEY) if(to && n === name && x.k === old) nk = to;
    for(const [id, idx, to] of PER) if(r.id === id && idx === i) nk = to;
    if(nk !== x.k){ x.k = nk; dirty = true; changed++; }
  });
  if(dirty){ fs.writeFileSync(file, JSON.stringify(r, null, 1) + "\n"); files++; }
}
console.log(`engine: ${Object.keys(I).length} keys; recipes: ${changed} lines re-keyed in ${files} files`);

/* ---------- serving items the steps mention but the list left out ---------- */
// Without a row, the engine can't warn about them (e.g. "serve with flatbread").
const SERVE = [
  ["burrosalvia", "stuffedpasta", 500, "g", "structure", ["pasta rellena", "ravioli, tortellini o similar"], ["stuffed pasta", "ravioli, tortellini or similar"]],
  ["baccalamantecato", "bread", null, "", "serve", ["pan tostado", "para servir"], ["toast", "to serve"]],
  ["kofte", "flatbread", null, "", "serve", ["pan plano", "para servir"], ["flatbread", "to serve"]],
  ["misirwot", "injera", null, "", "serve", ["injera", "para servir"], ["injera", "to serve"]],
  ["moqueca", "rice", null, "", "serve", ["arroz blanco", "para servir"], ["white rice", "to serve"]],
  ["moqueca", "farofa", null, "", "serve", ["farofa", "para servir"], ["farofa", "to serve"]],
  ["ccc-skillet", "icecream", null, "", "serve", ["helado de vainilla", "opcional, para servir"], ["vanilla ice cream", "optional, to serve"]],
];
for(const [id, k, q, u, role, es, en] of SERVE){
  const file = path.join(RECIPES, id + ".json"), r = JSON.parse(fs.readFileSync(file, "utf8"));
  if(r.ing.some(x => x.k === k && x.role === role)) continue;
  r.ing.push({q, u, k, role});
  r.es.ing.push({n: es[0], note: es[1]});
  r.en.ing.push({n: en[0], note: en[1]});
  fs.writeFileSync(file, JSON.stringify(r, null, 1) + "\n");
  console.log("added", k, "to", id);
}

/* ---------- where the generic role swaps are allowed ---------- */
// The generic swaps (e.g. "1:1 gluten-free blend" for anything wheat in a
// structure role) only make sense for plain ingredients. Before this, the
// engine offered GF flour blend for pasta and olive oil for parmesan.
const S2 = JSON.parse(fs.readFileSync(EFILE, "utf8"));
const SUGARS = "sugar brownsugar icingsugar palmsugar jaggery maple honey goldensyrup molasses treacle cornsyrup mirin ricesyrup maltose".split(" ");
S2.generic = {
  fat: ["butter", "ghee"],
  thicken: ["apflour", "breadflour", "breadcrumbs", "bread"],
  structure: ["apflour", "breadflour"],
  binder: ["egg", "eggyolk", "eggwhite"],
  umami: ["soysauce", "oystersauce", "hoisin", "fermentedtofu", "anchovy", "worcestershire", "katsuobushi", "fishsauce", "dashi"],
  crunch: ["peanut", "almond", "cashew", "walnut", "pistachio", "pinenut", "hazelnut", "pecan"],
  sweet: SUGARS,
  caramel: SUGARS,
};
fs.writeFileSync(EFILE, JSON.stringify(S2, null, 1) + "\n");

/* ---------- substitute tag fixes found by the lexicon check ---------- */
// test/lexicon.js scans every substitute's text for allergen words; each of
// these was a real omission (several were listed in work/audit/substitutions-review.md).
const S3 = JSON.parse(fs.readFileSync(EFILE, "utf8"));
function subsOf3(k){ const e = S3.ingredients[k], out = [];
  for(const l of Object.values(e.s || {})) out.push(...l);
  for(const o of Object.values(e.sr || {})) for(const l of Object.values(o)) out.push(...l); return out; }
function fix(keys, prefix, carries, may){
  const list = keys === "ROLES" ? Object.values(S3.roles).flatMap(o => Object.values(o).flat()) : keys.split(" ").flatMap(subsOf3);
  const hits = list.filter(s => s.es.to.startsWith(prefix));
  if(!hits.length) throw new Error(`no sub "${prefix}" on ${keys}`);
  for(const s of hits){
    if(carries) s.carries = [...new Set([...s.carries, ...carries])];
    if(may) s.may = [...new Set([...(s.may || []), ...may])].filter(a => !s.carries.includes(a));
    if(s.may && !s.may.length) delete s.may;
  }
}
fix("buttermilk", "leche de soja + 1 cda de vinagre", null, ["sulphite"]);
fix("egg", "puré de papa", ["nightshade"]);
fix("egg", "1 cda de fécula de maíz + 60 ml de bebida vegetal", null, PLANTMILK);
fix("egg", "tofu sedoso triturado + 1 cdta de fécula", ["corn"]);
fix("apflour", "harina de arroz fina + almidón de papa", ["nightshade"]);
fix("gochujang", "miso de garbanzo + gochugaru + miel", ["honey"]);
fix("doubanjiang", "miso de garbanzo + hojuelas de chile", null, ["sulphite"]);
fix("fishsauce", "salsa de soja + jugo de lima", ["sugar"]);
fix("mustard", "1/2 cdta de miel", ["honey"]);
fix("wine winered winewhite", "caldo casero + jugo de limón", null, ["celery"]);
fix("chorizo", "pimentón ahumado + hinojo + ajo", ["allium"]);
fix("worcestershire", "salsa de soja + unas gotas", null, ["sulphite"]);
fix("creamcheese", "yogur de coco espeso", null, ["corn"]);
fix("condensedmilk", "leche condensada de coco", ["sugar"]);
fix("mascarpone", "mascarpone de anacardo", ["coconut"]);
fix("peanut peanutbutter", "tahini", null, ["sugar", "honey"]);
fix("paprika cayenne gochugaru chipotle ancho chilli", "remolacha en polvo", null, ["mustard"]);
fix("marzipan almondpaste", "mazapán de semillas de girasol", null, ["corn"]);
fix("vanilla", "vainilla sin alcohol", null, ["sugar"]);
// Only the cookie-spread swap tells you to add flour.
for(const [role, o] of Object.entries(S3.ingredients.sugar.sr)) for(const s of o.sugar || []){
  if(s.es.to.startsWith("alulosa")) { if(role === "spread" && s.es.to === "alulosa") s.may = [...new Set([...(s.may || []), "wheat"])]; else if(s.may){ s.may = s.may.filter(a => a !== "wheat"); if(!s.may.length) delete s.may; } continue; }
  if(false) { if(role === "spread") s.may = [...new Set([...(s.may || []), "wheat"])]; else if(s.may){ s.may = s.may.filter(a => a !== "wheat"); if(!s.may.length) delete s.may; } } }
for(const s of S3.ingredients.sugar.s.sugar) if(s.es.to === "alulosa" && s.may && !/harina/.test(s.es.note)){ s.may = s.may.filter(a => a !== "wheat"); if(!s.may.length) delete s.may; }
// Dead swaps: they carry the very allergen they are offered for.
S3.ingredients.brownsugar.s.sugar = S3.ingredients.brownsugar.s.sugar.filter(s => !s.carries.includes("sugar"));
S3.ingredients.sugar.sr.caramel.sugar = S3.ingredients.sugar.sr.caramel.sugar.filter(s => s.f > 0);
// Almond extract is alcohol-based too, and so is the vanilla extract offered for it.
S3.ingredients.almondextract.a = ["treenut", "alcohol"];
fix("almondextract", "extracto de vainilla", ["alcohol"]);
// "mantequilla o semillas de girasol" read as dairy butter: say sunflower seed butter.
for(const k of ["tahini", "sesameseed"]) for(const s of subsOf3(k)) if(s.es.to === "mantequilla o semillas de girasol tostadas") s.es.to = "mantequilla de girasol o semillas de girasol tostadas";
fs.writeFileSync(EFILE, JSON.stringify(S3, null, 1) + "\n");
// Erythritol is usually made from corn.
{ const S4 = JSON.parse(fs.readFileSync(EFILE, "utf8"));
  const all = [...Object.values(S4.ingredients).flatMap(e => [...Object.values(e.s || {}), ...Object.values(e.sr || {}).flatMap(Object.values)].flat()),
               ...Object.values(S4.roles).flatMap(o => Object.values(o).flat())];
  for(const s of all) if(/eritritol/.test(s.es.to) && !s.carries.includes("corn")) s.may = [...new Set([...(s.may || []), "corn"])];
  fs.writeFileSync(EFILE, JSON.stringify(S4, null, 1) + "\n"); }
{ const S5 = JSON.parse(fs.readFileSync(EFILE, "utf8")), I5 = S5.ingredients;
  const addMay5 = (k, m) => { I5[k].may = [...new Set([...(I5[k].may || []), ...m])].filter(a => !I5[k].a.includes(a)); };
  addMay5("icingsugar", ["corn"]);
  I5.icingsugar.label = T("El azúcar glas suele llevar fécula de maíz.", "Powdered sugar usually contains cornstarch.");
  addMay5("shaoxing", ["sulphite"]);
  addMay5("maltvinegar", ["sulphite"]);
  addMay5("canevinegar", ["sulphite"]);
  fs.writeFileSync(EFILE, JSON.stringify(S5, null, 1) + "\n"); }
// Mung bean sprouts are sold as "germinado de soja" in Spanish; say what they are.
for(const f of fs.readdirSync(RECIPES)){
  const file = path.join(RECIPES, f), r = JSON.parse(fs.readFileSync(file, "utf8")); let dirty = false;
  r.es.ing.forEach((x, i) => {
    if(x.n === "germinado de soja"){ x.n = "germinado de frijol mungo"; r.en.ing[i].n = "mung bean sprouts"; dirty = true; }
    if(x.n === "col, rábano, cebolla, limón, orégano" && r.ing[i].k !== "onion"){ r.ing[i].k = "onion"; dirty = true; }
  });
  if(dirty) fs.writeFileSync(file, JSON.stringify(r, null, 1) + "\n");
}

/* ---------- raw onion garnish, fennel ---------- */
{ const S6 = JSON.parse(fs.readFileSync(EFILE, "utf8")), I6 = S6.ingredients;
  // Cooking swaps (asafoetida, fennel base) make no sense for raw onion on top of a dish.
  for(const k of ["onion", "shallot", "leek", "scallion", "chive"]){
    I6[k].sr = I6[k].sr || {};
    I6[k].sr.garnish = {allium: [
      sub(1, [], [], ["rábano en rodajas finas", "Da el mismo crujido y el picor fresco."], ["thinly sliced radish", "Same crunch and fresh bite."]),
      sub(0, [], [], ["omítela", "Es solo guarnición."], ["leave it out", "It's only a garnish."])]};
  }
  // Fennel is in the celery family; cross-reactions with celery allergy are documented.
  for(const e of Object.values(I6)) for(const l of [...Object.values(e.s || {}), ...Object.values(e.sr || {}).flatMap(Object.values)])
    for(const s of l) if(/hinojo/.test(s.es.to) && !s.carries.includes("celery")) s.may = [...new Set([...(s.may || []), "celery"])];
  fs.writeFileSync(EFILE, JSON.stringify(S6, null, 1) + "\n"); }
{ const file = path.join(RECIPES, "pozole.json"), r = JSON.parse(fs.readFileSync(file, "utf8"));
  const i = r.es.ing.findIndex(x => x.n === "col, rábano, cebolla, limón, orégano");
  if(i >= 0){
    r.ing[i].k = "veg"; r.es.ing[i].n = "col, rábano, limón, orégano"; r.en.ing[i].n = "cabbage, radish, lime, oregano";
    r.ing.splice(i + 1, 0, {q: 1, u: "", k: "onion", role: "garnish"});
    r.es.ing.splice(i + 1, 0, {n: "cebolla blanca", note: "picada fina, para servir"});
    r.en.ing.splice(i + 1, 0, {n: "white onion", note: "finely chopped, to serve"});
    fs.writeFileSync(file, JSON.stringify(r, null, 1) + "\n");
  } }
