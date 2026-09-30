// One-time: converts the Spanish v1 engine dump into per-recipe bilingual files.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const d = require(ROOT + "/data/raw/es-v1.json");

const COUNTRY = {"Nigeria":"Nigeria","Ghana":"Ghana","Etiopía":"Ethiopia","Marruecos":"Morocco","Túnez":"Tunisia","Levante":"Levant","Turquía":"Turkey","Grecia":"Greece","Italia":"Italy","Francia":"France","España":"Spain","Ucrania":"Ukraine","Hungría":"Hungary","Georgia":"Georgia","Suecia":"Sweden","Irlanda":"Ireland","India":"India","Sri Lanka":"Sri Lanka","Tailandia":"Thailand","Laos":"Laos","Vietnam":"Vietnam","Indonesia":"Indonesia","Malasia":"Malaysia","Filipinas":"Philippines","China":"China","Corea":"Korea","Japón":"Japan","México":"Mexico","Perú":"Peru","Brasil":"Brazil","Argentina":"Argentina","Jamaica":"Jamaica","Cuba":"Cuba","Estados Unidos":"United States","Dinamarca":"Denmark","Israel":"Israel","Escocia":"Scotland","Reino Unido":"United Kingdom","Polonia":"Poland","Portugal":"Portugal","Austria":"Austria","Palestina":"Palestine","Australia":"Australia","Bélgica":"Belgium","Países Bajos":"Netherlands","Egipto":"Egypt","Suiza":"Switzerland","Singapur":"Singapore","Pakistán":"Pakistan","Venezuela":"Venezuela","Finlandia":"Finland","Emiratos Árabes Unidos":"United Arab Emirates","Líbano":"Lebanon","Yemen":"Yemen","Siria":"Syria"};
const REGION = {"África Occidental":"west-africa","África Oriental":"east-africa","África del Norte":"north-africa","Medio Oriente":"middle-east","Mediterráneo":"mediterranean","Europa Occidental":"western-europe","Europa del Este":"eastern-europe","Europa Central":"central-europe","Nórdico":"nordic","Sur de Asia":"south-asia","Sudeste Asiático":"southeast-asia","Asia Oriental":"east-asia","América Latina":"latin-america","Caribe":"caribbean","Norteamérica":"north-america","Oceanía":"oceania"};
const UNIT = {"g":"g","":"","cda":"tbsp","ml":"ml","cdta":"tsp","dientes":"clove","diente":"clove","kg":"kg","pizca":"pinch","l":"l","tallos":"stalk","tallo":"stalk","pizca grande":"bigpinch","manojo":"bunch","ramas":"sprig","rama":"sprig","latas":"can","trozo":"piece","plato":"plate","porciones":"portion","hojas":"leaf","hoja":"leaf","puñado":"handful","tanda":"batch","tira":"strip","fondo":"base","vainas":"pod","hogaza":"loaf","muslos":"thigh","lomos":"loin","cubos":"cube","lonchas":"slice","rebanadas":"slice","filetes":"fillet","bolas":"ball","cabeza":"head","cabezas":"head","gotas":"drop","botella":"bottle"};

function resolveKey(name, k){
  if(k && d.ING[k]) return k;
  for(const [src, fl, key] of d.NAME_RULES) if(new RegExp(src, fl).test(name)) return key;
  return "";
}
let n = 0;
for(const r of d.RECIPES){
  for(const x of r.i) if(!(x[2] in UNIT)) throw new Error("unit " + x[2]);
  const out = {
    id: r.id, country: COUNTRY[r.c], region: REGION[r.r], course: r.m, time: r.t, serves: r.s,
    ...(r.tc ? {ovenC: r.tc} : {}), ...(r.cat ? {cat: r.cat} : {}),
    ing: r.i.map(x => ({q: x[1] === "" ? null : x[1], u: UNIT[x[2]], k: resolveKey(x[0], x[3]), role: x[4] || ""})),
    es: { name: r.n, blurb: r.b, ...(r.lab ? {lab: r.lab} : {}), ing: r.i.map(x => x[5] ? {n: x[0], note: x[5]} : {n: x[0]}),
          steps: r.st, tips: r.tp, video: r.v },
    en: null
  };
  if(!out.country || !out.region) throw new Error("map " + r.id);
  fs.writeFileSync(`${ROOT}/data/recipes/${r.id}.json`, JSON.stringify(out, null, 1) + "\n");
  n++;
}
console.log("wrote", n);
