// UI strings, units and labels for both languages. Shared by build and browser.
(function(root, factory){
  if(typeof module === "object" && module.exports) module.exports = factory();
  else root.MiseI18n = factory();
})(typeof self !== "undefined" ? self : this, function(){
  const UNITS = {
    en: {g: ["g", "g"], kg: ["kg", "kg"], ml: ["ml", "ml"], l: ["l", "l"], tbsp: ["tbsp", "tbsp"], tsp: ["tsp", "tsp"],
      clove: ["clove", "cloves"], pinch: ["pinch", "pinches"], bigpinch: ["big pinch", "big pinches"], sprig: ["sprig", "sprigs"],
      stalk: ["stalk", "stalks"], bunch: ["bunch", "bunches"], can: ["can", "cans"], piece: ["piece", "pieces"], leaf: ["leaf", "leaves"],
      handful: ["handful", "handfuls"], batch: ["batch", "batches"], strip: ["strip", "strips"], pod: ["pod", "pods"], loaf: ["loaf", "loaves"],
      fillet: ["fillet", "fillets"], thigh: ["thigh", "thighs"], loin: ["loin", "loins"], cube: ["cube", "cubes"], slice: ["slice", "slices"],
      ball: ["ball", "balls"], head: ["head", "heads"], drop: ["drop", "drops"], bottle: ["bottle", "bottles"], plate: ["plate", "plates"],
      base: ["base", "bases"], portion: ["portion", "portions"], cup: ["cup", "cups"], oz: ["oz", "oz"], lb: ["lb", "lb"], floz: ["fl oz", "fl oz"], qt: ["qt", "qt"]},
    es: {g: ["g", "g"], kg: ["kg", "kg"], ml: ["ml", "ml"], l: ["l", "l"], tbsp: ["cda", "cdas"], tsp: ["cdta", "cdtas"],
      clove: ["diente", "dientes"], pinch: ["pizca", "pizcas"], bigpinch: ["pizca grande", "pizcas grandes"], sprig: ["rama", "ramas"],
      stalk: ["tallo", "tallos"], bunch: ["manojo", "manojos"], can: ["lata", "latas"], piece: ["trozo", "trozos"], leaf: ["hoja", "hojas"],
      handful: ["puñado", "puñados"], batch: ["tanda", "tandas"], strip: ["tira", "tiras"], pod: ["vaina", "vainas"], loaf: ["hogaza", "hogazas"],
      fillet: ["filete", "filetes"], thigh: ["muslo", "muslos"], loin: ["lomo", "lomos"], cube: ["cubo", "cubos"], slice: ["rebanada", "rebanadas"],
      ball: ["bola", "bolas"], head: ["cabeza", "cabezas"], drop: ["gota", "gotas"], bottle: ["botella", "botellas"], plate: ["plato", "platos"],
      base: ["fondo", "fondos"], portion: ["porción", "porciones"], cup: ["taza", "tazas"], oz: ["oz", "oz"], lb: ["lb", "lb"], floz: ["oz líq.", "oz líq."], qt: ["cuarto", "cuartos"]},
  };
  const COURSE = {
    en: {main: "Main", sweet: "Dessert", sauce: "Sauce", cookie: "Cookie", starter: "Starter", bread: "Bread", soup: "Soup", pastry: "Pastry", side: "Side", drink: "Drink", breakfast: "Breakfast", snack: "Snack"},
    es: {main: "Plato fuerte", sweet: "Postre", sauce: "Salsa", cookie: "Galleta", starter: "Entrada", bread: "Pan", soup: "Sopa", pastry: "Pastelería", side: "Guarnición", drink: "Bebida", breakfast: "Desayuno", snack: "Antojito"},
  };
  const REGION = {
    en: {"latin-america": "Latin America", caribbean: "Caribbean", "north-america": "North America", mediterranean: "Mediterranean", "western-europe": "Western Europe",
      "central-europe": "Central Europe", "eastern-europe": "Eastern Europe", nordic: "Nordic", "middle-east": "Middle East", "north-africa": "North Africa",
      "west-africa": "West Africa", "east-africa": "East Africa", "south-asia": "South Asia", "southeast-asia": "Southeast Asia", "east-asia": "East Asia", oceania: "Oceania"},
    es: {"latin-america": "América Latina", caribbean: "Caribe", "north-america": "Norteamérica", mediterranean: "Mediterráneo", "western-europe": "Europa Occidental",
      "central-europe": "Europa Central", "eastern-europe": "Europa del Este", nordic: "Nórdico", "middle-east": "Medio Oriente", "north-africa": "África del Norte",
      "west-africa": "África Occidental", "east-africa": "África Oriental", "south-asia": "Sur de Asia", "southeast-asia": "Sudeste Asiático", "east-asia": "Asia Oriental", oceania: "Oceanía"},
  };
  const T = {
    en: {
      tagline: "Recipes made safe for what you can't eat",
      home: "Recipes", guide: "Kitchen guide", about: "About", langName: "English", otherLang: "Español",
      pickTitle: "What can't you eat?", pickLead: "Pick everything you avoid. Every recipe adapts: each ingredient you can't have is swapped for one that works, and every swap lists what it contains.",
      pickMajor: "Major allergens", pickOther: "Other", clear: "Clear", done: "Show my recipes", avoiding: "Avoiding", nothing: "Nothing selected", edit: "Edit",
      search: "Search recipes, countries, ingredients", all: "All", allRegions: "All regions", allCourses: "All courses",
      hideUnsafe: "Hide recipes I can't make", results: n => `${n} recipe${n === 1 ? "" : "s"}`, noResults: "No recipes match. Try fewer filters.",
      v_safe: "Safe as written", v_adapted: "Adapted for you", v_check: "Check labels", v_unsafe: "No safe version",
      minutes: m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}` : `${m} min`,
      serves: "Serves", ingredients: "Ingredients", method: "Method", tips: "Tips", contains: "Contains", mayContain: "May contain",
      containsNone: "None of the tracked allergens", swapFor: "Swap", insteadOf: "instead of", checkLabel: "Check the label", mayHave: "may contain",
      noSub: "No safe swap. Leave it out if the dish allows, or choose another recipe.", subContains: "Contains", subNothing: "None of your allergens",
      otherSwaps: "Other options", units: "Units", metric: "Metric", us: "US", cook: "Cook mode", step: "Step", of: "of", prev: "Back", next: "Next", close: "Close",
      oven: "Oven", video: "Watch technique videos", disclaimerShort: "Swaps are guidance, not medical advice. Always read product labels: brands change recipes and many foods carry cross-contact warnings.",
      bannerSafe: "Nothing in this recipe is on your list.", bannerAdapted: n => `${n} ingredient${n === 1 ? "" : "s"} swapped for your list.`,
      bannerCheck: "Some ingredients are often made with something on your list. Check their labels.",
      bannerUnsafe: "Something in this recipe has no safe swap for your list.", setProfile: "Tell us what you avoid to adapt this recipe.",
      related: "More from", backHome: "All recipes", notFound: "Page not found", notFoundLead: "That page doesn't exist.",
      aboutTitle: "About Mise", guideTitle: "Kitchen guide", ratios: "Ratios", temps: "Safe temperatures", rescue: "Rescue",
      footer: "Original recipes, written and checked by Mise. Swaps are guidance, not medical advice.",
    },
    es: {
      tagline: "Recetas adaptadas a lo que no puedes comer",
      home: "Recetas", guide: "Guía de cocina", about: "Acerca de", langName: "Español", otherLang: "English",
      pickTitle: "¿Qué no puedes comer?", pickLead: "Marca todo lo que evitas. Cada receta se adapta: cada ingrediente que no puedes comer se cambia por uno que funciona, y cada cambio dice qué contiene.",
      pickMajor: "Alérgenos principales", pickOther: "Otros", clear: "Borrar", done: "Ver mis recetas", avoiding: "Evitas", nothing: "Nada marcado", edit: "Editar",
      search: "Busca recetas, países, ingredientes", all: "Todas", allRegions: "Todas las regiones", allCourses: "Todos los tipos",
      hideUnsafe: "Ocultar las que no puedo hacer", results: n => `${n} receta${n === 1 ? "" : "s"}`, noResults: "Ninguna receta coincide. Prueba con menos filtros.",
      v_safe: "Apta tal cual", v_adapted: "Adaptada para ti", v_check: "Revisa etiquetas", v_unsafe: "Sin versión segura",
      minutes: m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}` : `${m} min`,
      serves: "Porciones", ingredients: "Ingredientes", method: "Preparación", tips: "Consejos", contains: "Contiene", mayContain: "Puede contener",
      containsNone: "Ninguno de los alérgenos que seguimos", swapFor: "Cambia", insteadOf: "en vez de", checkLabel: "Revisa la etiqueta", mayHave: "puede contener",
      noSub: "No hay un cambio seguro. Omítelo si el plato lo permite, o elige otra receta.", subContains: "Contiene", subNothing: "Nada de tu lista",
      otherSwaps: "Otras opciones", units: "Unidades", metric: "Métrico", us: "EE. UU.", cook: "Modo cocina", step: "Paso", of: "de", prev: "Atrás", next: "Siguiente", close: "Cerrar",
      oven: "Horno", video: "Ver videos de la técnica", disclaimerShort: "Los cambios son una guía, no un consejo médico. Lee siempre las etiquetas: las marcas cambian sus recetas y muchos alimentos advierten de trazas.",
      bannerSafe: "Nada de esta receta está en tu lista.", bannerAdapted: n => `${n} ingrediente${n === 1 ? "" : "s"} cambiado${n === 1 ? "" : "s"} según tu lista.`,
      bannerCheck: "Algunos ingredientes suelen llevar algo de tu lista. Revisa sus etiquetas.",
      bannerUnsafe: "Algo de esta receta no tiene un cambio seguro para tu lista.", setProfile: "Dinos qué evitas para adaptar esta receta.",
      related: "Más de", backHome: "Todas las recetas", notFound: "Página no encontrada", notFoundLead: "Esa página no existe.",
      aboutTitle: "Acerca de Mise", guideTitle: "Guía de cocina", ratios: "Proporciones", temps: "Temperaturas seguras", rescue: "Rescates",
      footer: "Recetas originales, escritas y revisadas por Mise. Los cambios son una guía, no un consejo médico.",
    },
  };
  const FRAC = [[1/8, "⅛"], [1/4, "¼"], [1/3, "⅓"], [1/2, "½"], [2/3, "⅔"], [3/4, "¾"]];
  function fmtNum(v, lang, frac){
    if(v == null) return "";
    if(frac){
      const w = Math.floor(v), r = v - w;
      let best = null;
      for(const [x, s] of FRAC) if(Math.abs(r - x) < 0.04) best = s;
      if(r < 0.04) return String(w || (v > 0 ? "⅛" : "0"));
      if(r > 0.96) return String(w + 1);
      if(best) return (w ? w + " " : "") + best;
    }
    const s = (Math.round(v * 10) / 10).toString();
    return lang === "es" ? s.replace(".", ",") : s;
  }
  function unit(u, n, lang){
    if(!u) return "";
    const p = UNITS[lang][u]; if(!p) return u;
    return n != null && n > 1 ? p[1] : p[0];
  }
  return {UNITS, COURSE, REGION, T, fmtNum, unit};
});
