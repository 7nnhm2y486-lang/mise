// Words that reveal an allergen in Spanish ingredient or substitute text.
// Used by the tests as an independent second check on the hand-written tags:
// if a substitute's text says "fécula de maíz" but it doesn't list corn, that
// is a bug (or a reviewed exemption in lexicon-exemptions.json).
const W = "[a-záéíóúñü]";
const LEX = {
  milk: /\bleche(?! de (coco|avena|soja|almendra|anacardo|arroz|semillas))|\bmantequilla(?! vegana| de (cacahuate|maní|semillas|coco|almendra|frutos|girasol))|\bqueso(?! vegano| de anacardo)|\bcrema(?! de (coco|anacardo|avena|cacahuate|semillas|almendra|soja|arroz|girasol))|\byogur(?! de (coco|anacardo|soja|almendra|avena))|\bnata\b|\bghee\b|\bsuero de leche|\bparmesano|\bpecorino|\bmozzarella|\bricotta|\bmascarpone/,
  egg: /\bhuevos?\b(?! de linaza)|\byemas?\b|\bclaras? de huevo|^claras?\b|\bmayonesa\b(?! de aquafaba)/,
  wheat: /\btrigo\b(?! sarraceno)|\bcebada|\bmalta\b|\bmalteada|\bcenteno|\bseitan|\bcusc[uú]s|\bbulgur|\bespelta|(?<!masa )\bharina\b(?!( [a-z]+)? (de (arroz|maíz|almendra|garbanzo|coco|yuca|mijo|trigo sarraceno|sorgo|teff|avena|semillas|castaña|papa|tapioca|mandioca|quinoa|amaranto|plátano|lenteja|girasol|almortas?)|sin gluten|leudante sin))|\bpan\b(?! sin gluten)|\bpanko\b(?! sin gluten)|\bsémola\b(?! de (arroz|maíz))|\bgalletas?\b(?! de arroz| sin gluten)|\bcerveza\b(?! sin gluten)/,
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

// English counterpart, used on English ingredient names.
const LEX_EN = {
  milk: /\bmilk\b(?!\w)(?<!(coconut|oat|soy|almond|cashew|rice) milk)|\bbutter\b(?<!(peanut|nut|seed|sunflower|almond|cashew|apple|vegan|cocoa|shea) butter)|\bcheese\b(?<!(vegan|cashew) cheese)|\bcream\b(?<!(coconut|cashew|oat|soy|ice) cream)(?! of tartar)|\byogh?urt\b(?<!(coconut|soy|cashew|almond) yogh?urt)|\bghee\b|\bbuttermilk\b|\bparmesan|\bpecorino|\bmozzarella|\bricotta|\bmascarpone|\bcrema\b|\bqueso\b|\bdulce de leche|\bcondensed milk|\bevaporated milk/,
  egg: /\beggs?\b(?! ?plant)|\byolks?\b|\bwhites?\b(?= ?$)|\begg whites?\b|\bmayonnaise|\bmayo\b/,
  wheat: /\bwheat\b(?<!buckwheat)|\bflour\b(?<!(rice|corn|almond|chickpea|pea|coconut|cassava|tapioca|potato|masa|buckwheat|oat|plantain|sorghum|teff|millet) flour)|\bbread\b|\bpasta\b|\bnoodles?\b(?<!(rice|glass|sweet potato) noodles?)|\bbarley|\bmalt\b|\brye\b|\bsemolina|\bcouscous|\bbulgur|\bpanko|\bbreadcrumbs|\bcrackers?\b(?<!rice crackers?)|\btortillas?\b(?<!corn tortillas?)|\bbeer\b|\bspelt/,
  soy: /\bsoy\b|\bsoya\b|\btofu\b|\bmiso\b|\btempeh|\bedamame|\btamari\b|\bshoyu\b/,
  peanut: /\bpeanuts?\b/,
  treenut: /\balmonds?\b|\bcashews?\b|\bwalnuts?\b|\bhazelnuts?\b|\bpistachios?\b|\bpine nuts?\b|\bpecans?\b|\bmacadamia|\bbrazil nuts?\b|\bamaretto|\bmarzipan/,
  sesame: /\bsesame\b|\btahini\b/,
  fish: /\bfish\b|\banchov|\btuna\b|\bsalmon\b|\bcod\b|\bsea bass|\btilapia|\bsnapper|\bdashi\b|\bworcestershire/,
  shellfish: /\bshrimps?\b|\bprawns?\b|\bcrabs?\b|\blobsters?\b|\bcrayfish|\bcrawfish/,
  mollusc: /\boysters?\b(?! mushrooms?)|\bclams?\b|\bmussels?\b|\bsquid\b|\boctopus\b|\bscallops?\b|\bconch\b/,
  mustard: /\bmustard\b|\bhorseradish/,
  celery: /\bceler(y|iac)\b|\bstock\b|\bbroth\b/,
  sulphite: /\bwine\b|\bvinegar\b(?<!rice vinegar)|\bverjuice|\bcider\b|\bsherry\b|\braisins?\b/,
  sugar: /\bsugar\b|\bhoney\b|\bsyrup\b|\bmolasses|\bpiloncillo|\bpanela\b|\bdates?\b|\bagave\b|\bjam\b|\bchocolate\b(?<!unsweetened chocolate)/,
  coconut: /\bcoconut\b/,
  corn: /\bcorn\b|\bmaize\b|\bpolenta\b|\bmasa\b|\bhominy\b|\bcornmeal|\bcornstarch|\bbaking powder\b|\bpowdered sugar\b|\bicing sugar\b|\bgrits\b|\bposole\b|\bpozole\b/,
  allium: /\bgarlic\b|\bonions?\b|\bshallots?\b|\bleeks?\b|\bscallions?\b|\bchives?\b|\bgreen onions?\b/,
  nightshade: /\btomato(es)?\b|\btomatillos?\b|\bpotato(es)?\b(?<!sweet potato(es)?)|\bbell peppers?\b|\bchil(e|i|li)(e?s)?\b|\bpaprika\b|\bcayenne\b|\beggplants?\b|\bjalapeños?\b|\bserranos?\b|\bhabaneros?\b|\bpoblanos?\b|\bancho\b|\bguajillo|\bchipotle|\baji\b|\bají\b|\bketchup/,
  alcohol: /\bwine\b(?! vinegar)|\bbeer\b|\brum\b|\bbrandy\b|\bcognac\b|\bvodka\b|\btequila\b|\bmezcal\b|\bpisco\b|\bliqueur\b|\bsake\b|\bmirin\b|\b(vanilla|almond|anise|orange|lemon|coffee) extract\b/,
  pork: /\bpork\b|\bbacon\b|\bham\b|\bchorizo\b|\blard\b|\bchicharr[oó]n|\bpancetta|\bprosciutto|\bsausage/,
  gelatin: /\bgelatin/,
};
function scanEn(text){
  const s = text.toLowerCase().replace(/\b(no|without|free of)\s+[a-z]+(\s+(or|and)\s+[a-z]+)*/g, " ").replace(/\b[a-z]+-free\b/g, " ");
  const out = [];
  for(const [a, re] of Object.entries(LEX_EN)) if(re.test(s)) out.push(a);
  return out;
}
module.exports.LEX_EN = LEX_EN;
module.exports.scanEn = scanEn;
