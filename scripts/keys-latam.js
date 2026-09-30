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
// Fresh and blood sausages (morcilla, salchicha parrillera) are usually seasoned with garlic, onion or paprika.
I.sausage.may = [...new Set([...(I.sausage.may || []), "allium", "nightshade"])];
I.sausage.label = T("Los embutidos comerciales pueden llevar trigo, leche, soja, sulfitos, mostaza, apio, ajo, cebolla o pimentón: revisa la etiqueta.", "Commercial sausages can contain wheat, milk, soy, sulphites, mustard, celery, garlic, onion or paprika: check the label.");
// Chocolate biscuits (chocotorta) and quince paste (pastafrola).
put("chocolatecookies", ["wheat", "sugar"], ["milk", "soy", "egg", "corn"], T("Las galletas de chocolate llevan trigo y azúcar; muchas llevan leche, soja o jarabe de maíz.", "Chocolate biscuits contain wheat and sugar; many contain milk, soy or corn syrup."), {
  wheat: [sub(1, ["sugar"], ["milk", "soy", "egg", "corn"], ["galletas de chocolate sin gluten", "Del mismo grosor, para que absorban igual."], ["gluten-free chocolate biscuits", "The same thickness, so they soak up the same."])]});
put("quincepaste", ["sugar"], ["sulphite"], T("El dulce de membrillo es membrillo y azúcar; algunas marcas llevan conservantes con sulfitos.", "Quince paste is quince and sugar; some brands add sulphite preservatives."));
// Most gelatin is made from pork skin; beef or fish gelatin exists but is labelled as such.
I.gelatin.may = ["pork"];
I.gelatin.label = T("La mayoría de la gelatina es de cerdo; si evitas cerdo, busca gelatina de res, de pescado o agar.", "Most gelatin is made from pork; if you avoid pork, look for beef or fish gelatin, or agar.");
I.gelatin.s.pork = [sub(0.33, [], [], ["agar agar en polvo", "Un tercio del peso; debe hervir 2 minutos para activarse."], ["agar agar powder", "A third of the weight; it must boil for 2 minutes to activate."])];
// Salsa Lizano (Costa Rica): sugar, onion, mustard and spices; vegetable content varies.
put("lizano", ["sugar", "mustard", "allium"], ["celery", "nightshade"], T("La salsa Lizano lleva azúcar, cebolla, mostaza y especias.", "Salsa Lizano contains sugar, onion, mustard and spices."));
// Cured pork: most hams and bacons are cured with sugar or dextrose; deli ham can contain milk or soy protein.
I.ham.may = [...new Set([...(I.ham.may || []), "sugar", "milk", "soy"])];
I.ham.label = T("El jamón cocido suele llevar azúcar o dextrosa y a veces proteína de leche o de soja: revisa la etiqueta.", "Cooked ham usually contains sugar or dextrose and sometimes milk or soy protein: check the label.");
I.bacon.may = [...new Set([...(I.bacon.may || []), "sugar"])];
I.bacon.label = T("La mayoría del tocino se cura con azúcar.", "Most bacon is cured with sugar.");
// Cream of coconut (Coco López style) is sweetened coconut cream, not plain coconut cream.
put("creamofcoconut", ["coconut", "sugar"], [], T("La crema de coco para cócteles es crema de coco con mucho azúcar.", "Cream of coconut for cocktails is coconut cream with a lot of sugar."), {
  coconut: [sub(1, ["milk", "sugar"], [], ["leche condensada", "Más espesa y con sabor lácteo en lugar de coco."], ["condensed milk", "Thicker, with a dairy flavour instead of coconut."])],
  sugar: [sub(1, ["coconut"], [], ["crema de coco sin azúcar", "Queda mucho menos dulce."], ["unsweetened coconut cream", "Much less sweet."])]});
// Soft drinks (ginger ale, cola) are sweetened; many use corn syrup.
put("softdrink", ["sugar"], ["corn"], T("Los refrescos llevan azúcar; muchos usan jarabe de maíz.", "Soft drinks contain sugar; many use corn syrup."), {
  sugar: [sub(1, [], [], ["agua con gas y jengibre rallado", "Menos dulce, con el mismo picor del jengibre."], ["sparkling water with grated ginger", "Less sweet, with the same ginger bite."])]});
put("mariebiscuit", ["wheat","sugar"], ["milk","soy","egg"], T("Las galletas María llevan trigo y azúcar; algunas marcas llevan leche, soja o huevo: revisa la etiqueta.", "Marie biscuits contain wheat and sugar; some brands contain milk, soy or egg: check the label."), {
  wheat: [sub(1, ["sugar"], ["milk","soy","egg"], ["galletas María sin gluten","Misma textura; revisa la etiqueta por leche o soja."], ["gluten-free Marie-style biscuits","Same texture; check the label for milk or soy."])]});
// Refried beans: canned or restaurant ones are often made with lard, sometimes with cheese.
put("refriedbeans", [], ["pork", "milk"], T("Los frijoles refritos de lata o de fonda suelen llevar manteca de cerdo; algunos llevan queso. Hazlos con aceite o revisa la etiqueta.", "Canned or restaurant refried beans are often made with lard; some contain cheese. Make them with oil or check the label."), {pork: [
  sub(1, [], [], ["frijoles refritos caseros con aceite", "Machaca frijoles cocidos y fríelos en aceite hasta que espesen."], ["homemade refried beans with oil", "Mash cooked beans and fry them in oil until thick."])]});
// Tamales and flaky doughs: vegetable shortening is the classic lard swap.
if(!I.lard.s.pork.some(x => x.es.to === "manteca vegetal"))
  I.lard.s.pork.unshift(sub(1, [], ["soy"], ["manteca vegetal", "La misma textura en tamales y masas; revisa si lleva soja."], ["vegetable shortening", "Same texture in tamales and pastry; check whether it contains soy."]));
fs.writeFileSync(EFILE, JSON.stringify(S, null, 1) + "\n");
console.log("keys:", Object.keys(I).length);
