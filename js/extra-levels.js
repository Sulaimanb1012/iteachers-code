/* Extra opdrachten (9–12), tips voor 1–8, lesmeta per wereld. */
(function (root) {
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
    "Rood en blauw": ["Ritme: twee vooruit, pak, twee vooruit, zet neer.", "Twee keer.", "Dan naar de uitgang."],
    "Kijk naar de kleur": ["Alleen pakken als rood() waar is.", "Zelfde ritme verder.", "Twee rode paren."],
    "Drie racks": ["Zelfde ritme, drie keer.", "Twee vooruit, pak, twee vooruit, zet.", "Dan uitgang."],
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
    "Konvooi": ["Functie voor krater+kern.", "Twee aanroepen.", "Dan poort."],
    "Sluis open": ["Schakel uit vóór Nova.", "Eén stap dichterbij.", "Door naar het lab."],
    "Eerste monster": ["Pak op het vakje met het monster.", "Twee vooruit, pak.", "Door naar het lab."],
    "Schild of door": ["Kijk vooruit.", "als schild / anders vooruit.", "Herhaal tot het lab."],
    "Tot het lab": ["Tel niet.", "while tot gedockt.", "Alleen vooruit in de lus."],
    "Sluis en monster": ["Zolang niet bij het lab.", "Schild uit of vooruit.", "Pak op bij een monster."],
    "Diepere buis": ["Zelfde programma als eerder.", "Het mag langer worden zonder herschrijven.", "while + keuzes."],
    "De bocht": ["Muur → rechts.", "Schild → uit.", "Anders vooruit."],
    "Lab bereikt": ["Zelfde while als bij de bocht.", "Plus pakken bij een monster.", "Eén programma voor alles."]
  };

  const META = {
    sky: { kerndoelen: "Algoritmes, sequentie, herhaling", les: "45–60 min · start Visueel, later Blokken bij lussen", ct: "Sequentie · Patronen · Decompositie" },
    hydro: { kerndoelen: "Algoritmes, sequentie, herhaling", les: "45–60 min · Visueel / Blokken", ct: "Sequentie · Acties · Patronen" },
    orbit: { kerndoelen: "Voorwaarden, sensoren, herhaling", les: "60 min · Blokken (als/anders)", ct: "Selectie · Sensoren · Lussen" },
    data: { kerndoelen: "Voorwaarden, data, volgorde", les: "60 min · Blokken", ct: "Selectie · Dragen · Patronen" },
    mars: { kerndoelen: "Functies, abstractie", les: "60–75 min · Code (JS of Python)", ct: "Abstractie · Functies · Hergebruik" },
    deep: { kerndoelen: "Voorwaarden, lussen tot doel", les: "60–75 min · Code", ct: "While · Geneste keuzes · Debugging" }
  };

  const LESKAART = [
    { les: "Les 1", wereld: "Skyline Meridiaan", focus: "Opdracht 1–4", doel: "Sequentie en eerste lus", duur: "45 min" },
    { les: "Les 2", wereld: "Skyline Meridiaan", focus: "Opdracht 5–12", doel: "Pakken en routes plannen", duur: "50 min" },
    { les: "Les 3", wereld: "Hydrofarm", focus: "Opdracht 1–6", doel: "Acties vooruit en oogsten", duur: "50 min" },
    { les: "Les 4", wereld: "Hydrofarm", focus: "Opdracht 7–12", doel: "Patronen afronden", duur: "45 min" },
    { les: "Les 5", wereld: "Orbit-haven", focus: "Opdracht 1–6", doel: "Als/anders en sensoren", duur: "60 min" },
    { les: "Les 6", wereld: "Datacenter Kern", focus: "Opdracht 1–8", doel: "Dragen en kleuren matchen", duur: "60 min" },
    { les: "Les 7", wereld: "Mars-kolonie", focus: "Opdracht 1–8", doel: "Functies in code", duur: "60–75 min" },
    { les: "Les 8", wereld: "Diepzee-lab", focus: "Opdracht 1–12", doel: "While en geneste keuzes", duur: "60–75 min" }
  ];

  function apply(catalog) {
    catalog.WORLDS.forEach(w => {
      const meta = META[w.id];
      if (meta) Object.assign(w, meta);
      w.levels.forEach(l => {
        if (!l.hints && HINTS[l.t]) l.hints = HINTS[l.t];
      });
      const extra = EXTRA[w.id] || [];
      if (w.levels.length < 12) {
        extra.forEach(level => {
          if (!w.levels.some(l => l.t === level.t)) w.levels.push(level);
        });
      }
    });
    catalog.LESKAART = LESKAART;
    catalog.GUIDE = [
      { h: "Drie niveaus, één programma", p: "Visueel is tikken met iconen. Blokken is slepen en nesten (herhaal, als, zolang). Code is JavaScript of Python. Wisselen laat hetzelfde programma in de andere vorm zien." },
      { h: "Opbouw", p: "Zes werelden, elk twaalf opdrachten. Elke nieuwe vaardigheid begint op een makkelijke baan. De opdracht erna lijkt erop, maar de route is anders: het vorige programma werkt niet zomaar opnieuw. Skyline en Hydrofarm: volgorde, draaien, herhalen. Orbit en Datacenter: keuzes en sensoren. Mars en Diepzee: functies en while-lussen." },
      { h: "Lesopbouw (45–60 min)", p: "5 min briefing en demo · 30–40 min zelfstandig met tips (één tegelijk) · 10 min nabespreken. Optioneel: wissel van Visueel naar Blokken of Code op dezelfde opdracht." },
      { h: "Tips voor leerlingen", p: "Elke opdracht heeft drie tips. Tip 1 is een denkstap, tip 2 richtinggevend, tip 3 concreter. Laat leerlingen eerst zelf proberen." },
      { h: "Afspelen", p: "Start speelt het programma af. Stap voert één beweging uit. Pauze stopt tijdelijk. Snelheid past het tempo aan. Een botsing noemt de kijkrichting van Nova." },
      { h: "Docentknop", p: "Ontgrendelt alle werelden en opdrachten in deze browsersessie, toont leerdoel en kerndoelen, en laadt een voorbeeldoplossing. Exporteer voortgang als CSV. Zet Docent uit voordat leerlingen zelf verder gaan." },
      { h: "Sterren", p: "Drie sterren = even kort of korter dan de voorbeeldoplossing. Twee sterren = tot 1,5× zoveel stappen. Eén ster = langer, maar wel geslaagd." },
      { h: "Kerndoelen", p: "Digitale geletterdheid / computational thinking: algoritmes, decompositie, patronen, voorwaarden, functies, fouten opsporen. Doelgroep: groep 7–8 en onderbouw VO." }
    ];
    return catalog;
  }

  root.ITCExtra = { EXTRA, HINTS, META, LESKAART, apply };
  if (typeof module !== "undefined" && module.exports) module.exports = root.ITCExtra;
})(typeof globalThis !== "undefined" ? globalThis : this);
