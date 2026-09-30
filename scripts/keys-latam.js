// Ingredient keys for Latin American cooking (2026-09-30). Idempotent.
// Same rules as allergen-pass-2.js: `a` = always contains, `may` = often
// contains depending on brand, every swap lists what it carries.
const fs = require("fs"), path = require("path");
const EFILE = path.join(__dirname, "../data/engine/substitutions.json");
const S = JSON.parse(fs.readFileSync(EFILE, "utf8")), I = S.ingredients;
const T = (es, en) => ({es, en});
const sub = (f, carries, may, es, en) => ({f, carries, ...(may.length ? {may} : {}), es: {to: es[0], note: es[1]}, en: {to: en[0], note: en[1]}});
const put = (k, a, may, label, s) => { I[k] = {a, ...(may.length ? {may} : {}), ...(label ? {label} : {}), ...(s ? {s} : {})}; };

put("tomatillo", ["nightshade"], []);
put("grain", [], []);                 // quinoa, amaranth, millet, sorghum
put("seeds", [], []);                 // pumpkin seeds (pepitas), sunflower, chia
put("goat", [], []);
put("turkey", [], []);
put("ajipaste", ["nightshade"], ["sulphite", "allium"], T("Las pastas de ají comerciales suelen llevar vinagre y a veces ajo.", "Store-bought ají pastes usually contain vinegar and sometimes garlic."));
put("tablechocolate", ["sugar"], ["milk", "soy", "treenut"], T("El chocolate de mesa lleva azúcar y canela; algunas marcas llevan almendra o leche.", "Mexican table chocolate contains sugar and cinnamon; some brands contain almond or milk."), {sugar: [
  sub(1, [], ["milk", "soy"], ["cacao 100% + canela + edulcorante al gusto", "Rinde el mismo sabor especiado; el edulcorante se añade al final."], ["100% cacao + cinnamon + sweetener to taste", "Same spiced flavour; add the sweetener at the end."])]});
put("cornhusk", [], ["corn"], T("Las hojas de maíz no se comen, pero con alergia al maíz usa hoja de plátano.", "Corn husks aren't eaten, but with a corn allergy use banana leaves."), {corn: [
  sub(1, [], [], ["hojas de plátano", "Pásalas por la llama para que se ablanden."], ["banana leaves", "Pass them over a flame to soften."])]});
put("guavapaste", ["sugar"], ["corn", "sulphite"]);
put("tortillachips", ["corn"], ["wheat"], null, {corn: [
  sub(1, [], [], ["chips de yuca o de plátano", "Mismo crujido."], ["cassava or plantain chips", "Same crunch."])]});
put("shortening", [], ["soy"]);
put("seasoningsauce", ["wheat", "soy"], ["celery"], T("Los jugos sazonadores (tipo Maggi) llevan trigo y soja.", "Seasoning sauces (Maggi-style) contain wheat and soy."), {
  wheat: [sub(1, ["coconut", "sugar"], [], ["aminos de coco", "Más dulce: usa un poco menos."], ["coconut aminos", "Sweeter: use a little less."])],
  soy: [sub(1, ["coconut", "sugar"], [], ["aminos de coco", "Más dulce: usa un poco menos."], ["coconut aminos", "Sweeter: use a little less."])]});
put("hominy", ["corn"], []);
put("plantain", [], []);
put("cassava", [], [], T("La yuca debe pelarse y cocerse bien: cruda es tóxica.", "Cassava must be peeled and fully cooked: it is toxic raw."));
put("avocado", [], []);
put("condiment", [], ["allium", "nightshade", "celery", "mustard", "wheat"], T("Los sazonadores comerciales (sazón, adobo en polvo) pueden llevar ajo, cebolla, chile, apio, mostaza o trigo.", "Commercial seasonings (sazón, adobo powder) can contain garlic, onion, chili, celery, mustard or wheat."));
put("bouillon", [], ["celery", "wheat", "soy", "milk", "allium"], T("El caldo en cubo o en polvo suele llevar apio, trigo, soja, leche o cebolla.", "Bouillon cubes and powder often contain celery, wheat, soy, milk or onion."));
put("crema", ["milk"], [], null, {milk: [
  sub(1, ["coconut"], [], ["crema de coco con unas gotas de limón", "Da la acidez suave de la crema."], ["coconut cream with a few drops of lime", "Gives crema's mild tang."]),
  sub(1, ["treenut"], [], ["crema de anacardo con limón", "La más neutra."], ["cashew cream with lime", "The most neutral."])]});
// Mexican chorizo is seasoned with garlic and vinegar.
I.chorizo.may = [...new Set([...(I.chorizo.may || []), "allium", "sulphite", "wheat"])];
I.chorizo.label = T("El chorizo suele llevar ajo y vinagre; algunos llevan trigo.", "Chorizo usually contains garlic and vinegar; some contain wheat.");
// Whole peanuts were offered nut butters as swaps; those belong to peanut butter only.
I.peanut.s = {peanut: [
  sub(1, [], [], ["semillas de girasol tostadas", "Mismo crujido y la misma grasa. Tuéstalas hasta que suenen."], ["toasted sunflower seeds", "Same crunch, same fat. Toast them until they crackle."]),
  sub(1, [], [], ["pepitas de calabaza tostadas", "Más terrosas; muy buenas en moles y salsas."], ["toasted pumpkin seeds", "Earthier; very good in moles and sauces."]),
  sub(1, [], [], ["garbanzos tostados", "Solo para el crujiente."], ["roasted chickpeas", "Only for crunch."])]};
put("cassavastarch", [], []);          // almidón de yuca / tapioca starch (pandebono, pan de yuca, chipá)
// Fish stock is its own key: it contains fish, and bought fumet often has shellfish, celery or onion.
put("fishstock", ["fish"], ["shellfish", "celery", "allium", "wheat", "soy", "milk"], T("El caldo de pescado comprado puede llevar marisco, apio, cebolla, trigo o soja: revisa la etiqueta o hazlo en casa con espinas de pescado blanco.", "Bought fish stock can contain shellfish, celery, onion, wheat or soy: check the label or make it with white fish bones."), {
  fish: [sub(1, [], ["celery", "allium"], ["caldo de verduras con un trozo de alga kombu", "El alga da el fondo de mar sin pescado."], ["vegetable stock with a piece of kombu", "The seaweed gives a taste of the sea with no fish."])],
  shellfish: [sub(1, ["fish"], [], ["fumet casero de espinas de pescado blanco", "Espinas, agua y sal, 30 minutos a fuego bajo; sin marisco."], ["homemade stock from white fish bones", "Bones, water and salt, 30 minutes on low; no shellfish."])],
  celery: [sub(1, ["fish"], [], ["fumet casero de espinas de pescado blanco", "Espinas, agua y sal, 30 minutos a fuego bajo; sin apio."], ["homemade stock from white fish bones", "Bones, water and salt, 30 minutes on low; no celery."])],
  allium: [sub(1, ["fish"], [], ["fumet casero de espinas de pescado blanco", "Espinas, agua y sal, 30 minutos a fuego bajo; sin cebolla."], ["homemade stock from white fish bones", "Bones, water and salt, 30 minutes on low; no onion."])]});
// Chipotles in adobo: the canned sauce has onion, vinegar and sugar in most brands.
put("chipotleadobo", ["nightshade"], ["allium", "sulphite", "sugar"], T("El adobo de lata suele llevar cebolla, vinagre y azúcar: revisa la etiqueta.", "The canned adobo usually contains onion, vinegar and sugar: check the label."), {
  nightshade: I.chipotle.s.nightshade,
  allium: [sub(1, ["nightshade"], [], ["chile chipotle seco rehidratado", "Remójalo en agua caliente 15 minutos; sin el adobo de lata."], ["dried chipotle, rehydrated", "Soak it in hot water for 15 minutes; no canned adobo."])],
  sulphite: [sub(1, ["nightshade"], [], ["chile chipotle seco rehidratado", "Remójalo en agua caliente 15 minutos; sin el adobo de lata."], ["dried chipotle, rehydrated", "Soak it in hot water for 15 minutes; no canned adobo."])],
  sugar: [sub(1, ["nightshade"], [], ["chile chipotle seco rehidratado", "Remójalo en agua caliente 15 minutos; sin el adobo de lata."], ["dried chipotle, rehydrated", "Soak it in hot water for 15 minutes; no canned adobo."])]});
// Table salsa (red or green): chile plus onion and garlic in nearly every version.
put("salsa", ["nightshade", "allium"], ["sulphite", "sugar"], T("Las salsas de mesa llevan chile y casi siempre ajo o cebolla; las de frasco pueden llevar vinagre o azúcar.", "Table salsas contain chile and nearly always garlic or onion; jarred ones can contain vinegar or sugar."), {
  allium: [sub(1, ["nightshade"], [], ["salsa de tomatillo y chile hecha en casa sin ajo ni cebolla", "Tomatillo hervido, chile, cilantro y sal, licuados."], ["homemade tomatillo and chile salsa without garlic or onion", "Boiled tomatillo, chile, cilantro and salt, blended."])],
  nightshade: [sub(1, [], [], ["salsa de aguacate, cilantro y limón", "Fresca y ácida, sin chile ni tomate."], ["avocado, cilantro and lime salsa", "Fresh and sharp, with no chile or tomato."])]});
// Saltine / soda crackers (Peruvian huancaína, ají de gallina).
put("crackers", ["wheat"], ["soy", "milk", "sesame"], T("Las galletas de soda llevan trigo; algunas marcas llevan soja o leche.", "Soda crackers contain wheat; some brands contain soy or milk."), {
  wheat: [sub(1, [], ["soy"], ["galletas de arroz naturales", "Elige las que solo llevan arroz y sal."], ["plain rice crackers", "Pick ones made only of rice and salt."])]});
// Refried beans: canned or restaurant ones are often made with lard, sometimes with cheese.
put("refriedbeans", [], ["pork", "milk"], T("Los frijoles refritos de lata o de fonda suelen llevar manteca de cerdo; algunos llevan queso. Hazlos con aceite o revisa la etiqueta.", "Canned or restaurant refried beans are often made with lard; some contain cheese. Make them with oil or check the label."), {pork: [
  sub(1, [], [], ["frijoles refritos caseros con aceite", "Machaca frijoles cocidos y fríelos en aceite hasta que espesen."], ["homemade refried beans with oil", "Mash cooked beans and fry them in oil until thick."])]});
// Tamales and flaky doughs: vegetable shortening is the classic lard swap.
if(!I.lard.s.pork.some(x => x.es.to === "manteca vegetal"))
  I.lard.s.pork.unshift(sub(1, [], ["soy"], ["manteca vegetal", "La misma textura en tamales y masas; revisa si lleva soja."], ["vegetable shortening", "Same texture in tamales and pastry; check whether it contains soy."]));
fs.writeFileSync(EFILE, JSON.stringify(S, null, 1) + "\n");
console.log("keys:", Object.keys(I).length);
