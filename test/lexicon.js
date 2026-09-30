// Words that reveal an allergen in Spanish ingredient or substitute text.
// Used by the tests as an independent second check on the hand-written tags:
// if a substitute's text says "fécula de maíz" but it doesn't list corn, that
// is a bug (or a reviewed exemption in lexicon-exemptions.json).
const W = "[a-záéíóúñü]";
const LEX = {
  milk: /\bleche(?! de (coco|avena|soja|almendra|anacardo|arroz|semillas))|\bmantequilla(?! vegana| de (cacahuate|maní|semillas|coco|almendra|frutos|girasol))|\bqueso(?! vegano| de anacardo)|\bcrema(?! de (coco|anacardo|avena|cacahuate|semillas|almendra|soja|arroz|girasol))|\byogur(?! de (coco|anacardo|soja|almendra|avena))|\bnata\b|\bghee\b|\bsuero de leche|\bparmesano|\bpecorino|\bmozzarella|\bricotta|\bmascarpone/,
  egg: /\bhuevos?\b(?! de linaza)|\byemas?\b|\bclaras? de huevo|^claras?\b|\bmayonesa\b(?! de aquafaba)/,
  wheat: /\btrigo\b(?! sarraceno)|\bcebada|\bmalta\b|\bmalteada|\bcenteno|\bseitan|\bcusc[uú]s|\bbulgur|\bespelta|(?<!masa )\bharina\b(?!( [a-z]+)? (de (arroz|maíz|almendra|garbanzo|coco|yuca|mijo|trigo sarraceno|sorgo|teff|avena|semillas|castaña|papa|tapioca|mandioca|quinoa|amaranto|plátano|lenteja|girasol)|sin gluten|leudante sin))|\bpan\b(?! sin gluten)|\bpanko\b(?! sin gluten)|\bsémola\b(?! de (arroz|maíz))|\bgalletas?\b(?! de arroz| sin gluten)|\bcerveza\b(?! sin gluten)/,
  soy: /\bsoja\b|\bsoya\b|\btofu\b|\bmiso\b(?! de garbanzo)|\btempeh|\bedamame|\btamari\b|\bshoyu\b|\blecitina\b(?! de girasol)/,
  peanut: /\bcacahuates?\b|\bmaní\b/,
  treenut: /\balmendras?\b|\banacardos?\b|\bnuez\b(?! moscada)|\bnueces\b(?! de la india moscada)|\bavellanas?\b|\bpistachos?\b|\bpiñon(es)?\b|\bpecanas?\b|\bmacadamia|\bamaretto|\bmazapán/,
  sesame: /\bsésamo\b|\bajonjolí|\btahin[ií]?\b/,
  fish: /\bpescado\b|\banchoas?\b|\bbonito\b|\batún\b|\bsalmón\b|\bbacalao\b|\bdashi\b|\bworcestershire/,
  shellfish: /\bcamar[oó]n(es)?\b|\bgambas?\b|\blangostinos?\b|\bcangrejo|\blangosta/,
  mollusc: /\bostras?\b|\balmejas?\b|\bmejill[oó]n(es)?\b|\bcalamar(es)?\b|\bpulpo\b|\bvieiras?\b/,
  mustard: /\bmostaza\b|\brábano picante/,
  celery: /\bapio\b|\bapionabo|\bcaldo\b/,
  sulphite: /\bvino\b|\bvinagre\b(?! de arroz)|\bverjus|\bsidra\b|\bjerez\b|\bpasas\b/,
  sugar: /\bazúcar\b(?! glas? sin)|\bmiel\b|\bjarabe\b(?! de alulosa)|\bmelaza\b|\bpanela\b|\bpiloncillo|\bdátiles?\b|\bagave\b|\bdulce de leche|\bmermelada|\bchocolate\b(?! sin azúcar| negro sin azúcar)/,
  coconut: /\bcoco\b/,
  corn: /\bmaíz\b|\bpolenta\b|\bmasa harina\b|\bpolvo de hornear\b|\bazúcar glas\b|\bjarabe de glucosa/,
  allium: /\bajos?\b|\bcebollas?\b|\bchalotas?\b|\bpuerros?\b|\bcebollín\b|\bcebollino\b/,
  nightshade: /\btomates?\b|\bjitomates?\b|\bpapas?\b|\bpatatas?\b|\bpimientos?\b|\bpimentón\b|\bchiles?\b|\bají\b|\bberenjenas?\b|\bpaprika\b|\bcayena\b|\bkétchup\b|\btomatillos?\b|\bgoji\b/,
  alcohol: /(?<!vinagre de )\bvino\b|\bcerveza\b(?! sin alcohol)|\blicor\b|\bron\b|\bbrandy\b|\bcoñac\b|\bsake\b|\bmirin\b|\bvodka\b|\bextracto de (vainilla|almendra)/,
  pork: /\bcerdo\b|\btocino\b|\bpanceta\b|\bmanteca\b(?! de cacao| vegetal| de karité)|\bjamón\b|\bchorizo\b|\blardo\b/,
  gelatin: /\bgelatina\b(?! vegetal| de agar)|\bgrenetina/,
  honey: /\bmiel\b/,
};
// Words that mean "may contain" rather than "contains".
const MAYLEX = {
  wheat: /\bavena\b(?! certificada)/,
  soy: /\bbebida vegetal|\bmantequilla vegana|\bqueso vegano/,
  treenut: /\bbebida vegetal|\bmantequilla vegana|\bqueso vegano/,
  coconut: /\bbebida vegetal|\bmantequilla vegana|\bqueso vegano/,
  celery: /\bcaldo\b/,
  corn: /\bvainilla sin alcohol/,
};

// Strip phrases that negate an allergen ("sin gluten", "sin huevo", "ni soja"),
// so "sin trigo" doesn't count as wheat.
function strip(text){
  return text.toLowerCase()
    .replace(/\b(sin|ni|no lleva|no contiene|libre de)\s+(el |la |los |las )?[a-záéíóúñ]+((,\s*|\s+(ni|y|o)\s+)[a-záéíóúñ]+)*/g, " ")
    .replace(/\b(no es|no son|no uses|evita|evítalo|evita la|en vez de|en lugar de|como el|como la|igual que el|igual que la|que el|que la)\s+[a-záéíóúñ ]{0,30}/g, " ");
}
function scan(text, lex = LEX){
  const t = strip(text), out = [];
  for(const [a, re] of Object.entries(lex)) if(re.test(t)) out.push(a);
  return out;
}
module.exports = {LEX, MAYLEX, scan, strip};
