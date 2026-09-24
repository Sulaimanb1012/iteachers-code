const engine = require("../js/engine.js");
const { WORLDS } = require("../js/catalog.js");
const byId = Object.fromEntries(WORLDS.map(w => [w.id, w]));
const base = (ops, logic, sensors) => ({ ops, logic: logic || [], sensors: sensors || [] });

const EXTRA = {
  sky: [
    { t: "Zijbrug", s: "Een korte brug naast de mast. Tel de vakjes vóór je start.", goal: "Bereik het dock.", g: ["######", "S....#", "#...E#", "######"], sol: "F F F F R F", leer: "Een route met één bocht plannen.", hints: ["Tel eerst van start tot de hoek.", "Daarna rechtsaf.", "Eén vooruit naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) },
    { t: "Vier kernen", s: "Vier kernen op één lijn. Het patroon is bekend.", goal: "Pak alle kernen op en bereik het dock.", g: ["###########", "S.c.c.c.c.E", "###########"], sol: "r4 { F F C } F F", leer: "Een lus langer maken zonder het idee te wijzigen.", hints: ["Elke kern: twee vooruit en pak.", "Herhaal dat vier keer.", "Daarna twee vooruit naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) },
    { t: "Om de toren", s: "De toren blokkeert het midden. Ga eromheen.", goal: "Bereik het dock.", g: ["#######", "S.....#", "#.###.#", "#...E.#", "#######"], sol: "F F F F F R F F R F", leer: "Om een obstakel heen navigeren.", hints: ["Eerst langs de bovenkant tot het eind.", "Rechtsaf langs de zijkant.", "Nogmaals rechts naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) },
    { t: "Stadsfinale", s: "Laatste vlucht boven Meridiaan: bocht, kernen, dock.", goal: "Pak beide kernen op en bereik het dock.", g: ["#######", "S.c...#", "###.#.#", "#.c.E.#", "#######"], sol: "F F C F R F F R F C L L F F", leer: "Alles uit Skyline combineren in één route.", hints: ["Eerst de bovenste kern.", "Via de opening naar beneden.", "Pak de tweede kern en vlieg naar het dock."], ...base(["F", "L", "R", "C"], ["rep"]) }
  ],
  hydro: [
    { t: "Dubbele oogst", s: "Twee oogstvakken met een plant ertussen.", goal: "Geef water, oogst beide en bereik het depot.", g: ["#########", "S.o.v.o.E", "#########"], sol: "F F H F W F F F H F F", leer: "Oogsten en water geven afwisselen.", hints: ["Eerst de eerste oogst.", "Geef daarna water voor je verder gaat.", "Oogst het tweede vak en door naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) },
    { t: "Drie bedden", s: "Drie droge bedden op gelijke afstand.", goal: "Geef alle planten water en bereik het depot.", g: ["#########", "S.v.v.v.E", "#########"], sol: "r3 { F W F } F F", leer: "Een herhaalpatroon met drie herhalingen.", hints: ["Het stuk is: vooruit, water, vooruit.", "Herhaal dat drie keer.", "Daarna nog twee vooruit."], ...base(["F", "L", "R", "W", "H"], ["rep"]) },
    { t: "Trapkas", s: "Water geven op de trap, oogsten boven.", goal: "Geef water, oogst en bereik het depot.", g: ["######", "###oE#", "##.v.#", "S....#", "######"], sol: "F F F L W F F H R F", leer: "Klimmen met een actie op de route.", hints: ["Klim eerst naar de plant.", "Geef water, klim verder.", "Oogst en draai naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) },
    { t: "Oogstfinale", s: "Water, oogst, depot. Sluit de kasdag af.", goal: "Geef water, oogst en bereik het depot.", g: ["########", "S.v.o..E", "########"], sol: "F W F F F H F F F", leer: "Een volledige ronde plannen van begin tot eind.", hints: ["Eerst één stap dichter bij de plant.", "Geef water, daarna naar de oogst.", "Oogst en doorvliegen naar het depot."], ...base(["F", "L", "R", "W", "H"], ["rep"]) }
  ],
  orbit: [
    { t: "Schild en bocht", s: "Eerst een schild, daarna een hoek naar de sluis.", goal: "Schakel het schild uit en bereik de sluis.", g: ["######", "S.x..#", "####.#", "###E.#", "######"], sol: "F X F F F R F F R F", leer: "Een schild en daarna draaien.", hints: ["Schakel eerst het schild uit.", "Vlieg door tot de hoek en naar beneden.", "Rechtsaf naar de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
    { t: "Drie checks", s: "Drie schilden, onregelmatig. Kijk, niet tellen.", goal: "Bereik de sluis.", g: ["###########", "S.x.x..x..E", "###########"], sol: "r13 { if schild { X } else { F } }", leer: "De keuze-lus op een nieuw patroon.", hints: ["Gebruik als-schild in een herhaling.", "Anders gewoon vooruit.", "Zet de herhaling precies ruim genoeg."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
    { t: "Dubbele ring", s: "Twee bochten, twee schilden. Plan of kijk.", goal: "Schakel beide schilden uit en bereik de sluis.", g: ["########", "S.x....#", "######.#", "E..x...#", "########"], sol: "F X F F F F F R F F R F F X F F F F", leer: "Lange route met twee obstakels.", hints: ["Eerst het bovenste schild.", "Volg de ring omlaag.", "Onderweg het tweede schild, dan de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
    { t: "Havenfinale", s: "Laatste nadering met verspreide schilden.", goal: "Bereik de sluis.", g: ["##############", "S..x.x..x.x..E", "##############"], sol: "r17 { if schild { X } else { F } }", leer: "De standaardoplossing toepassen onder tijdsdruk.", hints: ["Geen tellen nodig.", "als schild → uit, anders vooruit.", "Herhaal tot de sluis."], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }
  ],
  data: [
    { t: "Alleen blauw", s: "Eén blauwe kern en één blauw rack.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["#######", "Sb.B..E", "#######"], sol: "F C F F Z F F F", leer: "Zelfde ritme, andere kleur.", hints: ["Pak de blauwe kern op.", "Zet neer op het blauwe rack.", "Door naar de uitgang."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
    { t: "Vier paren", s: "Vier keer hetzelfde: kern, rack.", goal: "Leg alle kernen goed en bereik de uitgang.", g: ["###################", "S.r.R.b.B.r.R.b.B.E", "###################"], sol: "r4 { F F C F F Z } F F", leer: "Een lus met vier herhalingen.", hints: ["Het ritme is F F C F F Z.", "Herhaal vier keer.", "Daarna twee vooruit."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
    { t: "Lege tussenstop", s: "Tussen twee rode paren zit een leeg stuk.", goal: "Leg beide kernen goed en bereik de uitgang.", g: ["##############", "S.r.R....r.R.E", "##############"], sol: "F F C F F Z F F F F F C F F Z F F", leer: "Tellen wanneer de afstand wisselt.", hints: ["Eerste paar is dichtbij.", "Daarna vijf lege vakjes.", "Tweede paar hetzelfde ritme."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
    { t: "Serverfinale", s: "Bocht naar een rood rack, daarna de uitgang.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["#######", "S.r...#", "#####R#", "E.....#", "#######"], sol: "F F C F F F R F Z F R F F F F F", leer: "Dragen om de hoek naar het juiste rack.", hints: ["Pak de kern in de gang.", "Volg de bocht naar het rack.", "Zet neer en terug naar de uitgang."], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }
  ],
  mars: [
    { t: "Kraterrij", s: "Drie kraters op gelijke afstand, zonder functie.", goal: "Bouw alle bruggen en bereik de poort.", g: ["#########", "S.k.k.k.E", "#########"], sol: "r3 { F G F } F F", leer: "Eerst met een lus, later met een functie.", hints: ["Patroon: vooruit, brug, vooruit.", "Herhaal drie keer.", "Daarna twee vooruit."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
    { t: "Functie plus kern", s: "Twee kraters met kernen erachter.", goal: "Bouw bruggen, pak kernen op en bereik de poort.", g: ["###########", "S.k.c.k.c.E", "###########"], sol: "def stap { F G F F F C } r2 { call stap } F F", leer: "Een functie in een lus aanroepen.", hints: ["Maak een functie voor één krater+kern.", "Roep die twee keer aan.", "Daarna naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
    { t: "Klimbrug", s: "Krater op de klim, poort boven.", goal: "Bouw een brug en bereik de poort.", g: ["######", "###.E#", "##.k.#", "S....#", "######"], sol: "F F F L G F F R F", leer: "Een brug in een bocht.", hints: ["Klim tot voor de krater.", "Bouw de brug.", "Door naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
    { t: "Marsfinale", s: "Vier kraters. Functie of lus, jij kiest.", goal: "Bouw alle bruggen en bereik de poort.", g: ["###########", "S.k.k.k.k.E", "###########"], sol: "def over { F G F } r4 { call over } F F", leer: "Een kort programma voor een lange route.", hints: ["Eén functie = één krater.", "Vier aanroepen.", "Dan door naar de poort."], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }
  ],
  deep: [
    { t: "Korte buis", s: "Eén sluis en één monster, dicht bij elkaar.", goal: "Open de sluis, pak het monster op en bereik het lab.", g: ["#######", "S.x.c.E", "#######"], sol: "F X F F F C F F", leer: "Twee acties op een korte rechte buis.", hints: ["Eerst het schild.", "Dan het monster pakken.", "Door naar het lab."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) },
    { t: "Zolang oefenen", s: "Lange lege buis. Tel niet.", goal: "Bereik het lab.", g: ["#############", "S...........E", "#############"], sol: "while { F }", leer: "while tot het doel, zonder te tellen.", hints: ["Gebruik zolang / while.", "Alleen vooruit in de lus.", "Stop automatisch bij het lab."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) },
    { t: "Monsterpad", s: "Monsters en sluizen door elkaar.", goal: "Open elke sluis, pak elk monster op en bereik het lab.", g: ["###########", "S.c.x.c.x.E", "###########"], sol: "while { if schild { X } else { F } if kern { C } }", leer: "De universele diepzee-aanpak.", hints: ["Zolang niet bij het lab.", "Schild? Uit. Anders vooruit.", "Op een monster? Pak op."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) },
    { t: "Labfinale", s: "Bocht, sluis en monster. Laatste duik.", goal: "Pak het monster op, open de sluis en bereik het lab.", g: ["######", "S.c..#", "####.#", "E.x..#", "######"], sol: "while { if schild { X } else { if muur { R } else { F } } if kern { C } }", leer: "Alles uit Diepzee in één programma.", hints: ["Gebruik de while-lus met keuzes.", "Muur → rechts.", "Schild → uit, monster → pak."], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern", "muur"]) }
  ]
};

module.exports = { EXTRA };

let failed = 0;
for (const [id, levels] of Object.entries(EXTRA)) {
  for (const level of levels) {
    const res = engine.run(byId[id], level, engine.parseDsl(level.sol));
    if (!res.ok) {
      failed++;
      console.log("FAIL", id, level.t, res.m);
    } else console.log("ok", id, level.t, res.steps);
  }
}
if (require.main === module) process.exit(failed ? 1 : 0);
