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
fs.writeFileSync(EFILE, JSON.stringify(S, null, 1) + "\n");
console.log("keys:", Object.keys(I).length);
