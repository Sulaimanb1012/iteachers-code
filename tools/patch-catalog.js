/* Bouwt catalog-extra.js data: hints + 4 levels per wereld. Run: node tools/patch-catalog.js */
const fs = require("fs");
const path = require("path");
const catalogPath = path.join(__dirname, "..", "js", "catalog.js");
let src = fs.readFileSync(catalogPath, "utf8");

if (!src.includes("const tips =")) {
  src = src.replace(
    "const base = (ops, logic, sensors) => ({ ops, logic: logic || [], sensors: sensors || [] });",
    "const base = (ops, logic, sensors) => ({ ops, logic: logic || [], sensors: sensors || [] });\n  const tips = (...a) => ({ hints: a });"
  );
}

function addTips(t, a, b, c) {
  // Find level by title and inject tips if missing
  const re = new RegExp("(\\{ t:\"" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\"[\\s\\S]*?)(\\.\\.\\.base\\()", "m");
  if (!re.test(src)) {
    console.log("miss level", t);
    return;
  }
  if (src.includes('t:"' + t + '"') && src.match(new RegExp('t:"' + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"[\\s\\S]{0,500}tips\\('))) {
    return;
  }
  src = src.replace(re, "$1...tips(\"" + a + "\", \"" + b + "\", \"" + c + "\"), $2");
}

// Simpler approach: rewrite levels arrays entirely via external module write
const engine = require("../js/engine.js");

const ART_PLACEHOLDER = "ART"; // keep existing ART in file

function L(o) { return o; }
const base = (ops, logic, sensors) => ({ ops, logic: logic || [], sensors: sensors || [] });
const tips = (...a) => ({ hints: a });

const EXTRA = {
  sky: [
    L({ t: "Zijbrug", s: "Een korte brug naast de mast. Tel de vakjes vóór je start.", goal: "Bereik het dock.", g: ["######", "S..#.#", "#..#.#", "#..E.#", "######"], sol: "F F R F F L F F", leer: "Een route met twee bochten plannen.", hints: ["Tel eerst van start tot de bocht.", "Daarna rechts, twee vooruit, links.", "Eindig met twee vooruit naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) }),
    L({ t: "Vier kernen", s: "Vier kernen op één lijn. Het patroon is bekend.", goal: "Pak alle kernen op en bereik het dock.", g: ["###########", "S.c.c.c.c.E", "###########"], sol: "r4 { F F C } F F", leer: "Een lus langer maken zonder het idee te wijzigen.", hints: ["Elke kern kost twee vooruit en één pak.", "Herhaal dat vier keer.", "Daarna nog twee vooruit naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) }),
    L({ t: "Om de toren", s: "De toren blokkeert het midden. Ga eromheen.", goal: "Bereik het dock.", g: ["#######", "S.....#", "#.###.#", "#...E.#", "#######"], sol: "F F F F R F F R F F F", leer: "Om een obstakel heen navigeren.", hints: ["Eerst tot de hoek van de toren.", "Rechtsaf langs de zijkant.", "Nog eenmaal rechts en door naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) }),
    L({ t: "Stadsfinale", s: "Laatste vlucht boven Meridiaan: bocht, kernen, dock.", goal: "Pak beide kernen op en bereik het dock.", g: ["#######", "S.c...#", "###.#.#", "#.c.E.#", "#######"], sol: "F F C F F R F F C L F F", leer: "Alles uit Skyline combineren in één route.", hints: ["Eerst de bovenste kern.", "Daarna de bocht naar beneden.", "Pak de tweede kern en vlieg naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) })
  ],
  hydro: [
    L({ t: "Dubbele oogst", s: "Twee oogstvakken met een plant ertussen.", goal: "Geef water, oogst beide en bereik het depot.", g: ["#########", "S.o.v.o.E", "#########"], sol: "F F H F W F F H F F", leer: "Oogsten en water geven afwisselen.", hints: ["Eerst de eerste oogst.", "Geef daarna water voor je verder gaat.", "Oogst het tweede vak en door naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) }),
    L({ t: "Drie bedden", s: "Drie droge bedden op gelijke afstand.", goal: "Geef alle planten water en bereik het depot.", g: ["#########", "S.v.v.v.E", "#########"], sol: "r3 { F W F } F F", leer: "Een herhaalpatroon met drie herhalingen.", hints: ["Het stuk is: vooruit, water, vooruit.", "Herhaal dat drie keer.", "Daarna nog twee vooruit."], ...base(["F", "L", "R", "W", "H"], ["rep"]) }),
    L({ t: "Trapkas", s: "Water geven op de trap, oogsten boven.", goal: "Geef water, oogst en bereik het depot.", g: ["######", "###oE#", "##.v.#", "S....#", "######"], sol: "F F F L W F F H R F", leer: "Klimmen met een actie op de route.", hints: ["Klim eerst naar de plant.", "Geef water, klim verder.", "Oogst en draai naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) }),
    L({ t: "Oogstfinale", s: "Water, twee oogsten, depot. Sluit de kasdag af.", goal: "Geef water, oogst alles en bereik het depot.", g: ["#########", "##.o.o.E#", "S.v......", "#########"], sol: "F W F L F F H F F H F F", leer: "Een volledige ronde plannen van begin tot eind.", hints: ["Eerst water bij de plant.", "Draai naar de oogstrij.", "Oogst beide vakken en door naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) })
  ],
  orbit: [
    L({ t: "Schild en bocht", s: "Eerst een schild, daarna een hoek naar de sluis.", goal: "Schakel het schild uit en bereik de sluis.", g: ["######", "S.x..#", "####.#", "###E.#", "######"], sol: "F X F F F R F F", leer: "Een schild en daarna draaien.", hints: ["Schakel eerst het schild uit.", "Vlieg door tot de hoek.", "Rechtsaf naar de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }),
    L({ t: "Drie checks", s: "Drie schilden, onregelmatig. Kijk, niet tellen.", goal: "Bereik de sluis.", g: ["###########", "S.x.x..x..E", "###########"], sol: "r14 { if schild { X } else { F } }", leer: "De keuze-lus op een nieuw patroon.", hints: ["Gebruik als-schild in een herhaling.", "Anders gewoon vooruit.", "Zet de herhaling ruim genoeg."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }),
    L({ t: "Dubbele ring", s: "Twee bochten, twee schilden. Plan of kijk.", goal: "Schakel beide schilden uit en bereik de sluis.", g: ["########", "S.x....#", "######.#", "E..x...#", "########"], sol: "F X F F F F F R F F R F F F X F F F", leer: "Lange route met twee obstakels.", hints: ["Eerst het bovenste schild.", "Volg de ring omlaag.", "Onderweg het tweede schild, dan de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }),
    L({ t: "Havenfinale", s: "Laatste nadering met verspreide schilden.", goal: "Bereik de sluis.", g: ["##############", "S..x.x..x.x..E", "##############"], sol: "r17 { if schild { X } else { F } }", leer: "De standaardoplossing toepassen onder tijdsdruk.", hints: ["Geen tellen nodig.", "als schild → uit, anders vooruit.", "Herhaal tot de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) })
  ],
  data: [
    L({ t: "Alleen blauw", s: "Eén blauwe kern en één blauw rack.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["#######", "Sb.B..E", "#######"], sol: "F C F F Z F F F", leer: "Zelfde ritme, andere kleur.", hints: ["Pak de blauwe kern op.", "Zet neer op het blauwe rack.", "Door naar de uitgang."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }),
    L({ t: "Vier paren", s: "Vier keer hetzelfde: kern, rack.", goal: "Leg alle kernen goed en bereik de uitgang.", g: ["###################", "S.r.R.b.B.r.R.b.B.E", "###################"], sol: "r4 { F F C F F Z } F F", leer: "Een lus met vier herhalingen.", hints: ["Het ritme is F F C F F Z.", "Herhaal vier keer.", "Daarna twee vooruit."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }),
    L({ t: "Lege tussenstop", s: "Tussen twee rode paren zit een leeg stuk.", goal: "Leg beide kernen goed en bereik de uitgang.", g: ["##############", "S.r.R....r.R.E", "##############"], sol: "F F C F F Z F F F F F C F F Z F F", leer: "Tellen wanneer de afstand wisselt.", hints: ["Eerste paar is dichtbij.", "Daarna vijf lege vakjes.", "Tweede paar hetzelfde ritme."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }),
    L({ t: "Serverfinale", s: "Bocht naar een rood rack, daarna de uitgang.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["#######", "S.r...#", "#####R#", "E.....#", "#######"], sol: "F F C F F F R F Z F R F F F F F", leer: "Dragen om de hoek naar het juiste rack.", hints: ["Pak de kern in de gang.", "Volg de bocht naar het rack.", "Zet neer en terug naar de uitgang."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) })
  ],
  mars: [
    L({ t: "Kraterrij", s: "Drie kraters op gelijke afstand, zonder functie.", goal: "Bouw alle bruggen en bereik de poort.", g: ["#########", "S.k.k.k.E", "#########"], sol: "r3 { F G F } F F", leer: "Eerst met een lus, later met een functie.", hints: ["Patroon: vooruit, brug, vooruit.", "Herhaal drie keer.", "Daarna twee vooruit."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }),
    L({ t: "Functie plus kern", s: "Twee kraters met kernen erachter.", goal: "Bouw bruggen, pak kernen op en bereik de poort.", g: ["###########", "S.k.c.k.c.E", "###########"], sol: "def stap { F G F F F C } r2 { call stap } F F", leer: "Een functie in een lus aanroepen.", hints: ["Maak een functie voor één krater+kern.", "Roep die twee keer aan.", "Daarna naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }),
    L({ t: "Klimbrug", s: "Krater op de klim, poort boven.", goal: "Bouw een brug en bereik de poort.", g: ["######", "###.E#", "##.k.#", "S....#", "######"], sol: "F F F L G F F R F", leer: "Een brug in een bocht.", hints: ["Klim tot voor de krater.", "Bouw de brug.", "Door naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }),
    L({ t: "Marsfinale", s: "Vier kraters. Functie of lus, jij kiest.", goal: "Bouw alle bruggen en bereik de poort.", g: ["###########", "S.k.k.k.k.E", "###########"], sol: "def over { F G F } r4 { call over } F F", leer: "Een kort programma voor een lange route.", hints: ["Eén functie = één krater.", "Vier aanroepen.", "Dan door naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) })
  ],
  deep: [
    L({ t: "Korte buis", s: "Eén sluis en één monster, dicht bij elkaar.", goal: "Open de sluis, pak het monster op en bereik het lab.", g: ["#######", "S.x.c.E", "#######"], sol: "F X F F C F F", leer: "Twee acties op een korte rechte buis.", hints: ["Eerst het schild.", "Dan het monster pakken.", "Door naar het lab."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) }),
    L({ t: "Zolang oefenen", s: "Lange lege buis. Tel niet.", goal: "Bereik het lab.", g: ["#############", "S...........E", "#############"], sol: "while { F }", leer: "while tot het doel, zonder te tellen.", hints: ["Gebruik zolang / while.", "Alleen vooruit in de lus.", "Stop automatisch bij het lab."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) }),
    L({ t: "Monsterpad", s: "Monsters en sluizen door elkaar.", goal: "Open elke sluis, pak elk monster op en bereik het lab.", g: ["###########", "S.c.x.c.x.E", "###########"], sol: "while { if schild { X } else { F } if kern { C } }", leer: "De universele diepzee-aanpak.", hints: ["Zolang niet bij het lab.", "Schild? Uit. Anders vooruit.", "Op een monster? Pak op."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) }),
    L({ t: "Labfinale", s: "Bocht, sluis en monster. Laatste duik.", goal: "Pak het monster op, open de sluis en bereik het lab.", g: ["######", "S.c..#", "####.#", "E.x..#", "######"], sol: "while { if schild { X } else { if muur { R } else { F } } if kern { C } }", leer: "Alles uit Diepzee in één programma.", hints: ["Gebruik de while-lus met keuzes.", "Muur → rechts.", "Schild → uit, monster → pak."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern", "muur"]) })
  ]
};

const HINTS = {
  "Eerste vlucht": ["Nova vliegt de kant op van haar neus.", "Je hebt vier keer vooruit nodig.", "Tik vier keer op vooruit en druk op Start."],
  "Om de hoek": ["Eerst rechtdoor tot de bocht.", "Draai links op de hoek.", "Daarna nog twee vooruit omhoog."],
  "Skybridge": ["Tel de lege vakjes tot het dock.", "Dat is acht keer dezelfde stap.", "Gebruik herhaal 8 met vooruit erin."],
  "Trappen": ["Eerst één vakje vooruit.", "Daarna herhaalt: links, vooruit, rechts, vooruit.", "Zet dat stuk in herhaal 3."],
  "Energiekernen": ["Op een kern: pak op.", "Patroon: twee vooruit, pak.", "Herhaal dat twee keer, daarna naar het dock."],
  "Zijcircuit": ["Eerst de bovenste kern.", "Draai naar de onderste kern.", "Pak op en vlieg naar het dock."],
  "Mast": ["De mast blokkeert niet de hele rij.", "Vlieg eerst langs de bovenkant.", "Rechtsaf naar het dock."],
  "Hoofdcircuit": ["Drie kernen, zelfde patroon als eerder.", "Twee vooruit + pak, drie keer.", "Daarna twee vooruit."],
  "Eerste gietbeurt": ["Water werkt op het vakje vóór Nova.", "Ga eerst één stap dichterbij.", "Geef water, daarna door naar het depot."],
  "Twee bedden": ["Vooruit, water, vooruit.", "Dat stuk twee keer.", "Daarna nog naar het depot."],
  "Om de leiding": ["Klim eerst naar de plant.", "Draai, geef water.", "Verder naar het depot."],
  "Eerste oogst": ["Oogst op het vakje waar Nova staat.", "Twee vooruit + oogst, twee keer.", "Daarna naar het depot."],
  "Water en oogst": ["Eerst water bij de droge plant.", "Daarna het oogstpatroon.", "Eindig bij het depot."],
  "Kasbocht": ["Water onderaan.", "Klim naar de oogst.", "Oogst en naar het depot."],
  "Lange rij": ["Zelfde stuk als bij twee bedden.", "Nu vier keer herhalen.", "Daarna doorvliegen."],
  "Avondronde": ["Klim naar de plant.", "Water, oogst, depot.", "Let op de draaien."],
  "Eerste schild": ["Schakel uit werkt vóór Nova.", "Eén stap dichterbij, dan uit.", "Door naar de sluis."],
  "Twee schilden": ["Vooruit, uit, vooruit.", "Twee keer herhalen.", "Daarna naar de sluis."],
  "Kijk vooruit": ["Tel niet — kijk.", "Als schild: uit. Anders: vooruit.", "Zet dat in een ruime herhaling."],
  "Havenhoek": ["Vlieg tot voor het schild.", "Schakel uit, draai verder.", "Naar de sluis."],
  "Lange baan": ["Zelfde truc als bij Kijk vooruit.", "als schild / anders vooruit.", "Herhaling ruim genoeg."],
  "Ringsegment": ["Eerst het bovenste schild.", "Volg de ring omlaag.", "Tweede schild, dan sluis."],
  "Tweede check": ["Weer kijken, niet tellen.", "als schild anders vooruit.", "Herhaal tot de sluis."],
  "Docking run": ["Verspreide schilden.", "Eén lus met keuze.", "Geen vaste telling."],
  "Eén rode kern": ["Pak op het vakje met de kern.", "Zet neer op het rode rack.", "Door naar de uitgang."],
  "Rood en blauw": ["Ritme: F F C F F Z.", "Twee keer.", "Dan naar de uitgang."],
  "Kijk naar de kleur": ["Alleen pakken als rood() waar is.", "Zelfde ritme verder.", "Twee rode paren."],
  "Drie racks": ["Zelfde ritme, drie keer.", "F F C F F Z.", "Dan uitgang."],
  "Grotere tussenruimte": ["Eerste paar dichtbij.", "Daarna extra lege vakjes.", "Tweede paar hetzelfde."],
  "Blauw verderop": ["Rood eerst.", "Blauw heeft een extra vak.", "Tel tot het blauwe rack."],
  "Om het rack": ["Pak in de gang.", "Bocht naar het rack.", "Zet neer, naar uitgang."],
  "Nachtdienst": ["Begint met blauw.", "Zelfde ritme als rood-blauw.", "Drie paren."],
  "Eerste krater": ["Brug op het vakje vóór Nova.", "Eén stap dichterbij.", "Bouw brug, door naar poort."],
  "Twee kraters": ["Vooruit, brug, vooruit.", "Twee keer.", "Dan poort."],
  "Rand van de krater": ["Klim naar de krater.", "Bouw brug.", "Naar de poort."],
  "Voorraad": ["Eerst brug.", "Dan kern pakken.", "Door naar poort."],
  "Eigen functie": ["Functie = één krater.", "Drie keer aanroepen.", "Of een lus."],
  "Lange kloof": ["Zelfde functie, vijf keer.", "Of herhaal 5.", "Dan poort."],
  "Kern boven de rand": ["Brug, dan kern.", "Bocht naar poort.", "Korte route mag uitgeschreven."],
  "Konvooi": ["Functie voor krater+kern.", "Twee aanroepen.", "Dan poort."]
};

// Verify extras
let failed = 0;
const { WORLDS } = require("../js/catalog.js");
const byId = Object.fromEntries(WORLDS.map(w => [w.id, w]));
for (const [id, levels] of Object.entries(EXTRA)) {
  const world = byId[id];
  for (const level of levels) {
    try {
      const ast = engine.parseDsl(level.sol);
      const res = engine.run(world, level, ast);
      if (!res.ok) {
        failed++;
        console.log("FAIL", id, level.t, res.m);
        console.log(level.g.join("\n"));
      } else console.log("ok ", id, level.t, res.steps);
    } catch (e) {
      failed++;
      console.log("ERR", id, level.t, e.message);
    }
  }
}
if (failed) {
  console.log(failed + " extra levels failed");
  process.exit(1);
}

// Inject hints into existing level objects by title
for (const [title, hints] of Object.entries(HINTS)) {
  const tipCall = "...tips(" + hints.map(h => JSON.stringify(h)).join(", ") + "), ";
  const re = new RegExp("(\\{ t:\"" + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\",[\\s\\S]*?)(\\.\\.\\.base\\()");
  if (!re.test(src)) {
    // try with single quotes? our file uses double for t:"
    console.log("no match for hints", title);
    continue;
  }
  if (src.includes('t:"' + title + '"') && new RegExp('t:"' + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"[\\s\\S]{0,800}?tips\\(').test(src)) continue;
  src = src.replace(re, "$1" + tipCall + "$2");
}

// Inject extra levels before closing of each world levels array
const markers = {
  sky: { after: 'sol: "r3 { F F C } F F", leer: "Een patroon toepassen op een langere route.", ...base(["F", "L", "R", "C"], ["rep"]) }' },
  hydro: { after: 'sol: "F F F L W F F H R F", leer: "Alles uit deze wereld in één route combineren.", ...base(["F", "L", "R", "W", "H"], ["rep"]) }' },
  orbit: { after: 'sol: "r16 { if schild { X } else { F } }", leer: "Een lus met keuze als standaardoplossing voor een onregelmatige baan.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }' },
  data: { after: 'sol: "r3 { F F C F F Z } F F", leer: "Een bekend ritme herkennen in een nieuwe volgorde.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }' },
  mars: { after: 'sol: "def stap { F G F F F C } call stap call stap F F", leer: "Een functie ontwerpen die één volledig deelprobleem oplost.", ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }' },
  deep: { after: 'sol: "while { if schild { X } else { if muur { R } else { F } } if kern { C } }", leer: "Sensoren, keuzes en een lus-tot-het-doel combineren.", ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern", "muur"]) }' }
};

function serializeLevel(level) {
  const parts = [];
  parts.push('{ t: ' + JSON.stringify(level.t));
  parts.push('s: ' + JSON.stringify(level.s));
  parts.push('goal: ' + JSON.stringify(level.goal));
  parts.push('g: ' + JSON.stringify(level.g));
  parts.push('sol: ' + JSON.stringify(level.sol));
  parts.push('leer: ' + JSON.stringify(level.leer));
  if (level.hints) parts.push('...tips(' + level.hints.map(h => JSON.stringify(h)).join(', ') + ')');
  if (level.nieuw) parts.push('nieuw: ' + JSON.stringify(level.nieuw));
  const logic = level.logic && level.logic.length ? JSON.stringify(level.logic) : '';
  const sensors = level.sensors && level.sensors.length ? ', ' + JSON.stringify(level.sensors) : '';
  if (logic) parts.push('...base(' + JSON.stringify(level.ops) + ', ' + logic + sensors + ')');
  else parts.push('...base(' + JSON.stringify(level.ops) + ')');
  return parts.join(', ') + ' }';
}

for (const [id, levels] of Object.entries(EXTRA)) {
  if (src.includes('t: "' + levels[0].t + '"') || src.includes('t:"' + levels[0].t + '"')) {
    console.log('extras already present for', id);
    continue;
  }
  // Find last level title of world by searching world id block
  const blockRe = new RegExp('id: "' + id + '"[\\s\\S]*?levels: \\[([\\s\\S]*?)\\]\\s*\\},');
  const m = src.match(blockRe);
  if (!m) { console.log('no world block', id); continue; }
  const insert = levels.map(serializeLevel).join(',\n        ');
  const rebuilt = m[0].replace(/\]\s*\},$/, ',\n        ' + insert + '\n      ]\n    },');
  src = src.replace(m[0], rebuilt);
  console.log('inserted extras', id, levels.length);
}

// Add kerndoelen + les fields on worlds
const META = {
  sky: { kerndoelen: "Algoritmes, sequentie, herhaling", les: "45–60 min · start Visueel, later Blokken bij lussen", ct: "Sequentie · Patronen · Decompositie" },
  hydro: { kerndoelen: "Algoritmes, sequentie, herhaling", les: "45–60 min · Visueel/Blokken", ct: "Sequentie · Acties · Patronen" },
  orbit: { kerndoelen: "Voorwaarden, sensoren, herhaling", les: "60 min · Blokken (als/anders)", ct: "Selectie · Sensoren · Lussen" },
  data: { kerndoelen: "Voorwaarden, data, volgorde", les: "60 min · Blokken", ct: "Selectie · Variabelen (dragen) · Patronen" },
  mars: { kerndoelen: "Functies, abstractie", les: "60–75 min · Code (JS of Python)", ct: "Abstractie · Functies · Hergebruik" },
  deep: { kerndoelen: "Voorwaarden, lussen tot doel", les: "60–75 min · Code", ct: "While-lussen · Geneste keuzes · Debugging" }
};
for (const [id, meta] of Object.entries(META)) {
  if (src.includes('id: "' + id + '"') && src.match(new RegExp('id: "' + id + '"[\\s\\S]{0,200}kerndoelen:'))) continue;
  src = src.replace(
    new RegExp('(id: "' + id + '", suggest: \\d+, k: "[^"]+", modus: "[^"]+",\\s*n: "[^"]+", art: ART\\[\\d+\\],\\s*d: "[^"]+",)'),
    '$1\n      kerndoelen: ' + JSON.stringify(meta.kerndoelen) + ',\n      les: ' + JSON.stringify(meta.les) + ',\n      ct: ' + JSON.stringify(meta.ct) + ','
  );
}

// Expand GUIDE
const newGuide = `  const GUIDE = [
    { h: "Drie niveaus, één programma", p: "Visueel is tikken met iconen. Blokken is slepen en nesten (herhaal, als, zolang). Code is JavaScript of Python. Wisselen laat hetzelfde programma in de andere vorm zien." },
    { h: "Opbouw", p: "Zes werelden, elk twaalf opdrachten. Skyline en Hydrofarm: volgorde, draaien, herhalen. Orbit en Datacenter: keuzes en sensoren. Mars en Diepzee: functies en while-lussen." },
    { h: "Lesopbouw (45–60 min)", p: "5 min briefing en demo · 30–40 min zelfstandig met tips · 10 min nabespreken (welke lus/keuze werkte?) · optioneel: wissel van Visueel naar Blokken of Code op dezelfde opdracht." },
    { h: "Tips voor leerlingen", p: "Elke opdracht heeft drie tips. Tip 1 is een denkstap, tip 2 richtinggevend, tip 3 concreter. Laat leerlingen eerst zelf proberen; één tip tegelijk." },
    { h: "Afspelen", p: "Start speelt het programma af. Met Stap voer je één beweging uit. Pauze stopt tijdelijk. Snelheid past het tempo aan. Een botsing noemt de kijkrichting van Nova." },
    { h: "Docentknop", p: "Ontgrendelt alle werelden en opdrachten in deze browsersessie, toont leerdoel en kerndoelen, en laadt een voorbeeldoplossing. Zet uit voordat leerlingen zelf verder gaan. Exporteer voortgang als CSV via de handleiding of de knop Export." },
    { h: "Sterren", p: "Drie sterren = even kort of korter dan de voorbeeldoplossing. Twee sterren = tot 1,5× zoveel stappen. Eén ster = langer, maar wel geslaagd." },
    { h: "Kerndoelen", p: "Digitale geletterdheid / computational thinking: algoritmes, decompositie, patronen, voorwaarden, functies, fouten opsporen. Doelgroep: groep 7–8 en onderbouw VO." }
  ];

  const LESKAART = [
    { les: "Les 1", wereld: "Skyline Meridiaan", focus: "Opdracht 1–4", doel: "Sequentie en eerste lus", duur: "45 min" },
    { les: "Les 2", wereld: "Skyline + Hydrofarm", focus: "Skyline 5–8, Hydrofarm 1–4", doel: "Pakken en acties vooruit", duur: "50 min" },
    { les: "Les 3", wereld: "Hydrofarm", focus: "Opdracht 5–12", doel: "Patronen en afronden beginner", duur: "50 min" },
    { les: "Les 4", wereld: "Orbit-haven", focus: "Opdracht 1–6", doel: "Als/anders en sensoren", duur: "60 min" },
    { les: "Les 5", wereld: "Datacenter Kern", focus: "Opdracht 1–8", doel: "Dragen en kleuren matchen", duur: "60 min" },
    { les: "Les 6", wereld: "Mars-kolonie", focus: "Opdracht 1–8", doel: "Functies in code", duur: "60–75 min" },
    { les: "Les 7", wereld: "Diepzee-lab", focus: "Opdracht 1–12", doel: "While en geneste keuzes", duur: "60–75 min" }
  ];`;

src = src.replace(/  const GUIDE = \[[\s\S]*?\];\s*\n\s*const api = \{ WORLDS, GUIDE \};/, newGuide + "\n\n  const api = { WORLDS, GUIDE, LESKAART };");

fs.writeFileSync(catalogPath, src);
console.log("catalog patched");
