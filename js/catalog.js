/* Meridiaan 2075 — werelden en opdrachten.
   sol is een korte schrijfwijze; de engine zet die om naar dezelfde boom als de leerling. */
(function (root) {
  function sc(id, a, b, body) {
    return '<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="320" height="110" fill="url(#' + id + ')"/>' + body + "</svg>";
  }
  const ART = [
    sc("a0", "#7dd3fc", "#e0e7ff", '<circle cx="262" cy="28" r="16" fill="#fde68a"/><g fill="#312e81"><rect x="18" y="52" width="30" height="58"/><rect x="56" y="30" width="26" height="80" fill="#4338ca"/><rect x="90" y="62" width="34" height="48"/><rect x="132" y="18" width="24" height="92" fill="#6366f1"/><rect x="164" y="48" width="38" height="62"/><rect x="212" y="36" width="28" height="74" fill="#4338ca"/></g><g fill="#fde68a"><rect x="62" y="42" width="5" height="5"/><rect x="72" y="58" width="5" height="5"/><rect x="138" y="34" width="5" height="5"/><rect x="176" y="62" width="5" height="5"/><rect x="220" y="52" width="5" height="5"/></g><ellipse cx="108" cy="30" rx="16" ry="4" fill="#2dd4bf"/><circle cx="108" cy="36" r="6" fill="#0b1220"/>'),
    sc("a1", "#bbf7d0", "#ecfdf5", '<g fill="#15803d"><rect x="24" y="40" width="22" height="70" rx="6"/><rect x="60" y="24" width="22" height="86" rx="6" fill="#16a34a"/><rect x="96" y="50" width="22" height="60" rx="6"/><rect x="132" y="30" width="22" height="80" rx="6" fill="#22c55e"/></g><path d="M190 110V56l40-30 40 30v54z" fill="#14532d"/><rect x="220" y="76" width="20" height="34" fill="#ecfccb"/><g fill="#38bdf8"><circle cx="40" cy="20" r="5"/><circle cx="110" cy="16" r="4"/><circle cx="150" cy="10" r="5"/></g>'),
    sc("a2", "#0f172a", "#312e81", '<g fill="#fff"><circle cx="30" cy="20" r="1.5"/><circle cx="90" cy="14" r="1"/><circle cx="150" cy="30" r="1.5"/><circle cx="300" cy="12" r="1.5"/><circle cx="220" cy="20" r="1"/></g><circle cx="250" cy="70" r="34" fill="#f59e0b"/><ellipse cx="250" cy="70" rx="52" ry="9" fill="none" stroke="#fde68a" stroke-width="3"/><rect x="60" y="62" width="70" height="20" rx="8" fill="#94a3b8"/><rect x="80" y="52" width="30" height="12" rx="4" fill="#38bdf8"/><circle cx="70" cy="72" r="3" fill="#2dd4bf"/><circle cx="90" cy="72" r="3" fill="#2dd4bf"/>'),
    sc("a3", "#0b1220", "#1e3a8a", '<g fill="#1e293b" stroke="#38bdf8"><rect x="30" y="24" width="50" height="86"/><rect x="100" y="14" width="50" height="96"/><rect x="170" y="30" width="50" height="80"/><rect x="240" y="20" width="50" height="90"/></g><g fill="#2dd4bf"><circle cx="42" cy="38" r="3"/><circle cx="42" cy="54" r="3"/><circle cx="112" cy="30" r="3"/><circle cx="182" cy="46" r="3"/><circle cx="252" cy="36" r="3"/></g><g fill="#f43f5e"><circle cx="42" cy="70" r="3"/><circle cx="112" cy="62" r="3"/><circle cx="252" cy="68" r="3"/></g>'),
    sc("a4", "#fdba74", "#7c2d12", '<circle cx="250" cy="26" r="12" fill="#fff7ed"/><path d="M0 110V70l50-30 50 34 60-40 70 44 90-34v66z" fill="#9a3412"/><path d="M0 110V88l70-20 80 22 90-18 80 20v18z" fill="#c2410c"/><path d="M120 110V84a26 26 0 0152 0v26z" fill="#e0f2fe"/><rect x="140" y="92" width="12" height="18" fill="#0ea5e9"/>'),
    sc("a5", "#0ea5e9", "#082f49", '<g fill="#bae6fd" opacity=".55"><circle cx="40" cy="30" r="5"/><circle cx="60" cy="50" r="3"/><circle cx="280" cy="24" r="6"/><circle cx="260" cy="60" r="3"/></g><path d="M0 110V90l60-10 80 14 90-12 90 10v18z" fill="#0c4a6e"/><g stroke="#22d3ee" stroke-width="4" fill="none"><path d="M40 110q-8-20 0-36"/><path d="M60 110q8-24 0-40"/></g><path d="M150 100V78a30 30 0 0160 0v22z" fill="#a5f3fc" opacity=".85"/><rect x="172" y="84" width="16" height="16" fill="#0369a1"/>')
  ];

  const base = (ops, logic, sensors) => ({ ops, logic: logic || [], sensors: sensors || [] });

  const WORLDS = [
    {
      id: "sky", suggest: 1, k: "Beginner", modus: "Visueel",
      n: "Skyline Meridiaan", art: ART[0],
      d: "Nova brengt energie naar de zwevende stad. Stuur haar naar het dock en haal verloren kernen op.",
      terms: { wall: "Nova vloog tegen een toren.", exit: "het dockingstation", core: "energiekernen", shield: "Een schild blokkeert de route. Schakel het eerst uit." },
      legend: { E: "dock", c: "energiekern" },
      levels: [
        { t: "Eerste vlucht", s: "Nova staat op het dak van Toren A. De wijk heeft stroom nodig.", goal: "Vlieg naar het dockingstation.", g: ["#####", "S...E", "#####"], sol: "F F F F", leer: "Opdrachten in de juiste volgorde zetten.", nieuw: [{ id: "F", titel: "Vooruit", tekst: "Nova vliegt één vakje de kant op waar haar neus heen wijst." }], ...base(["F"]) },
        { t: "Om de hoek", s: "Torens versperren de rechte lijn. Nova moet draaien op haar plek.", goal: "Bereik het dock met een bocht.", g: ["#####", "###E#", "###.#", "S...#", "#####"], sol: "F F F L F F", leer: "Een route opdelen in vooruit en draaien.", nieuw: [{ id: "L", titel: "Draai links", tekst: "Nova draait 90 graden linksom, zonder een vakje op te schuiven." }, { id: "R", titel: "Draai rechts", tekst: "Hetzelfde, maar rechtsom. Daarna wijst haar neus een andere kant op." }], ...base(["F", "L", "R"]) },
        { t: "Skybridge", s: "De brug is lang en recht. Acht keer hetzelfde opschrijven kan slimmer.", goal: "Bereik het dock.", hint: "Zelfde stap, heel vaak? Gebruik herhaal in Blokken of Code.", g: ["#########", "S.......E", "#########"], sol: "r8 { F }", leer: "Herhaling gebruiken in plaats van kopiëren.", nieuw: [{ id: "REP", titel: "Herhaal", tekst: "Zet stappen in een herhaal-blok. Nova voert ze het opgegeven aantal keer uit. In Visueel zie je de herhaling terug, bewerken doe je in Blokken of Code." }], ...base(["F", "L", "R"], ["rep"]) },
        { t: "Trappen", s: "Het dock ligt hoger in de kwartierstad. De trap heeft een vast patroon.", goal: "Klim naar het dock.", hint: "Eerst één vak vooruit. Daarna herhaalt hetzelfde stuk zich.", g: ["#####", "###.E", "##..#", "#..##", "S.###"], sol: "F r3 { L F R F }", leer: "Een patroon herkennen en in een lus zetten.", ...base(["F", "L", "R"], ["rep"]) },
        { t: "Energiekernen", s: "Langs de brug liggen kernen die de wijk nodig heeft. Pak ze op vóór je dockt.", goal: "Pak beide kernen op en bereik het dock.", g: ["#######", "S.c.c.E", "#######"], sol: "r2 { F F C } F F", leer: "Een herhaald patroon van bewegen en pakken.", nieuw: [{ id: "C", titel: "Pak op", tekst: "Staat Nova op een energiekern, dan neemt ze die mee. Een leeg vakje levert niets op." }], ...base(["F", "L", "R", "C"], ["rep"]) },
        { t: "Zijcircuit", s: "Twee kernen liggen niet op één lijn. Je moet draaien tussen het pakken door.", goal: "Verzamel beide kernen en dock.", g: ["#####", "S.c.#", "#...#", "#.c.E", "#####"], sol: "F F C R F F C L F F", leer: "Sequentie, draaien en pakken combineren.", ...base(["F", "L", "R", "C"], ["rep"]) },
        { t: "Mast", s: "Een zendmast staat midden op het dak. De vrije route loopt erlangs.", goal: "Vlieg om de mast heen naar het dock.", g: ["######", "S....#", "#....#", "#...E#", "######"], sol: "F F F F R F F", leer: "Een route plannen voordat je hem uitvoert.", ...base(["F", "L", "R", "C"], ["rep"]) },
        { t: "Hoofdcircuit", s: "Drie kernen, één patroon. Dit is de laatste vlucht boven Meridiaan.", goal: "Pak alle kernen op en bereik het dock.", g: ["#########", "S.c.c.c.E", "#########"], sol: "r3 { F F C } F F", leer: "Een patroon toepassen op een langere route.", ...base(["F", "L", "R", "C"], ["rep"]) }
      ]
    },
    {
      id: "hydro", suggest: 1, k: "Beginner", modus: "Visueel",
      n: "Hydrofarm", art: ART[1],
      d: "De verticale boerderij voedt de stad. Geef water, oogst en lever af bij het depot.",
      terms: { wall: "Nova vloog tegen een kaswand.", exit: "het depot", core: "energiekernen", plant: "De plant is droog. Geef eerst water.", plantEmpty: "Er staat geen dorstige plant voor Nova." },
      legend: { E: "depot", v: "dorstige plant", o: "oogst" },
      levels: [
        { t: "Eerste gietbeurt", s: "Een bed is droog. Nova kan er niet overheen tot de plant water heeft.", goal: "Geef water en bereik het depot.", g: ["#######", "S.v...E", "#######"], sol: "F W F F F F F", leer: "Een actie op het vakje vóór Nova, daarna pas verder vliegen.", nieuw: [{ id: "W", titel: "Geef water", tekst: "Werkt op de dorstige plant direct voor Nova. Daarna is dat vakje vrij." }], ...base(["F", "W"]) },
        { t: "Twee bedden", s: "De rij is langer. Hetzelfde stuk komt twee keer terug.", goal: "Geef beide planten water en bereik het depot.", hint: "Vooruit, water, vooruit — en dat herhalen.", g: ["#######", "S.v.v.E", "#######"], sol: "r2 { F W F } F F", leer: "Een lus om een reeks acties.", nieuw: [{ id: "REP", titel: "Herhaal", tekst: "Zet het terugkerende stuk in herhaal, in plaats van alles twee keer te slepen." }], ...base(["F", "L", "R", "W"], ["rep"]) },
        { t: "Om de leiding", s: "De leiding dwingt Nova een hoek om. De plant staat op de klim.", goal: "Geef water en bereik het depot.", g: ["#####", "##.E#", "##v.#", "S..##", "#####"], sol: "F F L W F F R F", leer: "Draaien combineren met een actie vooruit.", ...base(["F", "L", "R", "W"], ["rep"]) },
        { t: "Eerste oogst", s: "De vruchten zijn rijp. Nova moet ze meenemen, niet alleen voorbijvliegen.", goal: "Oogst beide vakken en bereik het depot.", g: ["#######", "S.o.o.E", "#######"], sol: "r2 { F F H } F F", leer: "Pakken op het vakje waar Nova staat, in een patroon.", nieuw: [{ id: "H", titel: "Oogst", tekst: "Werkt als Nova op een rijpe plant staat. Daarna is de oogst binnen." }], ...base(["F", "L", "R", "W", "H"], ["rep"]) },
        { t: "Water en oogst", s: "Eerst het droge bed, daarna de rijpe planten verderop.", goal: "Geef water, oogst alles en bereik het depot.", g: ["#########", "S.v.o.o.E", "#########"], sol: "F W F F r2 { F H F } F", leer: "Twee soorten acties in één programma.", ...base(["F", "L", "R", "W", "H"], ["rep"]) },
        { t: "Kasbocht", s: "De plant blokkeert de trap naar de oogst bovenin de kas.", goal: "Geef water, oogst en bereik het depot.", g: ["#####", "##oE#", "##..#", "S.v##", "#####"], sol: "F W F L F F H R F", leer: "Een korte route plannen met twee acties en een bocht.", ...base(["F", "L", "R", "W", "H"], ["rep"]) },
        { t: "Lange rij", s: "Vier bedden op een rij. Het patroon is steeds hetzelfde.", goal: "Geef alle planten water en bereik het depot.", g: ["############", "S.v.v.v.v..E", "############"], sol: "r4 { F W F } F F F", leer: "Een lus langer maken zonder het patroon te wijzigen.", ...base(["F", "L", "R", "W", "H"], ["rep"]) },
        { t: "Avondronde", s: "Laatste ronde van de dag: water geven, oogsten, afleveren.", goal: "Geef water, oogst en bereik het depot.", g: ["#######", "###oE##", "##.v.##", "S.....#", "#######"], sol: "F F F L W F F H R F", leer: "Alles uit deze wereld in één route combineren.", ...base(["F", "L", "R", "W", "H"], ["rep"]) }
      ]
    },
    {
      id: "orbit", suggest: 2, k: "Gevorderd", modus: "Blokken",
      n: "Orbit-haven", art: ART[2],
      d: "Aan de ring hangen vrachtschepen achter energieschilden. Kijk vooruit en beslis.",
      terms: { wall: "Nova botste tegen de havenwand.", exit: "de sluis", core: "energiekernen", shield: "Een schild blokkeert de route. Schakel het eerst uit.", shieldEmpty: "Er staat geen schild voor Nova." },
      legend: { E: "sluis", x: "schild" },
      levels: [
        { t: "Eerste schild", s: "Een schild staat in de aanloopbaan. Nova kan er niet doorheen.", goal: "Schakel het schild uit en bereik de sluis.", g: ["#######", "S.x...E", "#######"], sol: "F X F F F F F", leer: "Een obstakel voor Nova uitschakelen vóór je verder vliegt.", nieuw: [{ id: "X", titel: "Schakel uit", tekst: "Werkt op het schild direct voor Nova. Het vakje wordt daarna vrij." }], ...base(["F", "X"]) },
        { t: "Twee schilden", s: "De baan heeft twee schilden met dezelfde tussenruimte.", goal: "Schakel beide schilden uit en bereik de sluis.", g: ["#######", "S.x.x.E", "#######"], sol: "r2 { F X F } F F", leer: "Een herhaald patroon van vliegen en uitschakelen.", ...base(["F", "L", "R", "X"], ["rep"]) },
        { t: "Kijk vooruit", s: "De schilden staan niet op een vaste tel-afstand. Nova moet kijken wat er voor haar ligt.", goal: "Bereik de sluis zonder tegen een schild te vliegen.", hint: "In een herhaling: als er een schild staat, schakel het uit, anders vooruit.", g: ["#########", "S.x..x..E", "#########"], sol: "r10 { if schild { X } else { F } }", leer: "Een keuze (als / anders) binnen een lus.", nieuw: [{ id: "IF", titel: "Als", tekst: "Nova kijkt naar het vakje direct voor haar. Bij een schild doe je de stappen onder dan. Zo niet, dan de stappen onder anders." }], ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
        { t: "Havenhoek", s: "Het schild zit in de bocht naar de sluis, niet op een rechte baan.", goal: "Schakel het schild uit en bereik de sluis.", g: ["#####", "###E#", "##x.#", "S...#", "#####"], sol: "F F L X F R F L F", leer: "Draaien en een schild-actie combineren.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
        { t: "Lange baan", s: "Vier schilden, onregelmatig geplaatst. Tellen wordt onhandig.", goal: "Bereik de sluis.", hint: "Eén lus met als-schild is genoeg voor de hele baan.", g: ["##############", "S.x.x..x.x...E", "##############"], sol: "r17 { if schild { X } else { F } }", leer: "Een keuze hergebruiken op een langere baan.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
        { t: "Ringsegment", s: "De baan klapt omlaag en daarna terug. Onderweg staan twee schilden.", goal: "Schakel beide schilden uit en bereik de sluis.", g: ["#######", "S.x...#", "#####.#", "E.x...#", "#######"], sol: "F X F F F F R F F R F F X F F F", leer: "Een route met bochten plannen en obstakels tussendoor oplossen.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
        { t: "Tweede check", s: "Opnieuw een rechte baan. Oefen de keuze tot hij vanzelf gaat.", goal: "Bereik de sluis.", g: ["#########", "S..x.x..E", "#########"], sol: "r10 { if schild { X } else { F } }", leer: "Dezelfde keuze toepassen op een nieuw patroon.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) },
        { t: "Docking run", s: "Laatste nadering. De schilden staan verspreid over de aanloop.", goal: "Bereik de sluis.", g: ["#############", "S.x..x.x..x.E", "#############"], sol: "r16 { if schild { X } else { F } }", leer: "Een lus met keuze als standaardoplossing voor een onregelmatige baan.", ...base(["F", "L", "R", "X"], ["rep", "if"], ["schild"]) }
      ]
    },
    {
      id: "data", suggest: 2, k: "Gevorderd", modus: "Blokken",
      n: "Datacenter Kern", art: ART[3],
      d: "Servers vragen om de juiste kern. Rood bij rood, blauw bij blauw. Nova draagt er één tegelijk.",
      terms: { wall: "Nova botste tegen een serverrack.", exit: "de uitgang", core: "kernen" },
      legend: { E: "uitgang", r: "rode kern", b: "blauwe kern", R: "rood rack", B: "blauw rack" },
      levels: [
        { t: "Eén rode kern", s: "Een rode kern moet in het rode rack. Nova draagt maar één kern tegelijk.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["#######", "Sr.R..E", "#######"], sol: "F C F F Z F F F", leer: "Pakken, verplaatsen en op de juiste plek neerzetten.", nieuw: [{ id: "Z", titel: "Zet neer", tekst: "Werkt als Nova op een rack staat en de kern dezelfde kleur heeft. Een verkeerde kleur past niet." }], ...base(["F", "C", "Z"]) },
        { t: "Rood en blauw", s: "Twee kernen, twee racks, hetzelfde ritme.", goal: "Leg beide kernen goed en bereik de uitgang.", g: ["###########", "S.r.R.b.B.E", "###########"], sol: "r2 { F F C F F Z } F F", leer: "Een herhaald ritme van pakken en neerzetten.", ...base(["F", "L", "R", "C", "Z"], ["rep"]) },
        { t: "Kijk naar de kleur", s: "Nova moet alleen pakken als ze echt op een rode kern staat.", goal: "Leg beide rode kernen in hun rack en bereik de uitgang.", hint: "Na twee vakjes vooruit: als rood, pak op. Daarna door naar het rack.", g: ["###########", "S.r.R.r.R.E", "###########"], sol: "r2 { F F if rood { C } F F Z } F F", leer: "Een sensor op het vakje waar Nova staat.", nieuw: [{ id: "IF", titel: "Als rood", tekst: "rood() is waar als Nova op een rode kern staat. Gebruik dat vóór pak, zodat een leeg vakje geen fout geeft." }], ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood"]) },
        { t: "Drie racks", s: "De gang is langer. Het ritme rood, blauw, rood blijft hetzelfde.", goal: "Leg alle kernen goed en bereik de uitgang.", g: ["###############", "S.r.R.b.B.r.R.E", "###############"], sol: "r3 { F F C F F Z } F F", leer: "Een lus oprekken als het patroon hetzelfde blijft.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
        { t: "Grotere tussenruimte", s: "Na het eerste rack is de gang even leeg. Het tweede paar ligt verderop.", goal: "Leg beide kernen goed en bereik de uitgang.", g: ["#############", "S.r.R...r.R.E", "#############"], sol: "F F C F F Z F F F F C F F Z F F", leer: "Een patroon aanpassen als de afstand verandert.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
        { t: "Blauw verderop", s: "De blauwe kern ligt niet direct naast haar rack.", goal: "Leg beide kernen goed en bereik de uitgang.", g: ["############", "S.r.R.b..B.E", "############"], sol: "F F C F F Z F F C F F F Z F F", leer: "Tellen wanneer een lus niet meer past.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
        { t: "Om het rack", s: "Het rode rack staat niet in de gang, maar om de hoek.", goal: "Leg de kern in het rack en bereik de uitgang.", g: ["######", "S.r..#", "####R#", "E....#", "######"], sol: "F F C F F R F Z F R F F F F", leer: "Draaien combineren met dragen en neerzetten.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) },
        { t: "Nachtdienst", s: "Drie paren, te beginnen met blauw. Zelfde ritme als eerder.", goal: "Leg alle kernen goed en bereik de uitgang.", g: ["###############", "S.b.B.r.R.b.B.E", "###############"], sol: "r3 { F F C F F Z } F F", leer: "Een bekend ritme herkennen in een nieuwe volgorde.", ...base(["F", "L", "R", "C", "Z"], ["rep", "if"], ["rood", "blauw"]) }
      ]
    },
    {
      id: "mars", suggest: 3, k: "Expert", modus: "Code",
      n: "Mars-kolonie", art: ART[4],
      d: "Kraters snijden de route naar de poort door. Bouw bruggen en schrijf zelf een functie.",
      terms: { wall: "Nova botste tegen een rots.", exit: "de koloniepoort", core: "voorraadkernen", crater: "Een krater blokkeert de route. Bouw eerst een brug.", craterEmpty: "Er ligt geen krater voor Nova." },
      legend: { E: "poort", k: "krater", c: "voorraadkern" },
      levels: [
        { t: "Eerste krater", s: "De vlakte is open, op één krater na. Zonder brug komt Nova niet verder.", goal: "Bouw een brug en bereik de poort.", g: ["#######", "S.k...E", "#######"], sol: "F G F F F F F", leer: "Een nieuw commando op het vakje vóór Nova.", nieuw: [{ id: "G", titel: "Bouw brug", tekst: "Werkt op de krater direct voor Nova. Daarna kun je over het vakje vliegen." }], ...base(["F", "G"]) },
        { t: "Twee kraters", s: "Twee kraters, dezelfde tussenruimte.", goal: "Bouw beide bruggen en bereik de poort.", g: ["#######", "S.k.k.E", "#######"], sol: "r2 { F G F } F F", leer: "Een lus om een brug-patroon.", ...base(["F", "L", "R", "G"], ["rep"]) },
        { t: "Rand van de krater", s: "De krater ligt in de klim naar de poort, niet op de rechte vlakte.", goal: "Bouw een brug en bereik de poort.", g: ["#####", "##.E#", "##k.#", "S..##", "#####"], sol: "F F L G F F R F", leer: "Draaien en een brug combineren.", ...base(["F", "L", "R", "G"], ["rep"]) },
        { t: "Voorraad", s: "Achter de eerste krater ligt een voorraadkern voor de kolonie.", goal: "Bouw de brug, pak de kern op en bereik de poort.", g: ["########", "S.k.c..E", "########"], sol: "F G F F F C F F F", leer: "Een brug en pakken in één rechte route.", ...base(["F", "L", "R", "G", "C"], ["rep"]) },
        { t: "Eigen functie", s: "Drie kraters, steeds hetzelfde stuk werk. Zet dat stuk in een functie.", goal: "Bereik de poort.", hint: "Schrijf een functie voor één krater en roep haar drie keer aan. Een lus mag ook.", g: ["#########", "S.k.k.k.E", "#########"], sol: "def over { F G F } r3 { call over } F F", leer: "Een herhaald stuk route een naam geven en aanroepen.", nieuw: [{ id: "DEF", titel: "Functie", tekst: "In Code schrijf je function over() { ... } en daarna over();. In Python: def over(): en daarna over(). De stappen in de functie gebeuren pas als je haar aanroept." }], ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
        { t: "Lange kloof", s: "Vijf kraters. Een functie of een lus scheelt een hoop regels.", goal: "Bouw alle bruggen en bereik de poort.", g: ["#############", "S.k.k.k.k.k.E", "#############"], sol: "def over { F G F } r5 { call over } F F", leer: "Een functie hergebruiken op een langere route.", ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
        { t: "Kern boven de rand", s: "Eerst de krater, dan de kern, dan de poort om de hoek.", goal: "Bouw de brug, pak de kern op en bereik de poort.", g: ["#####", "##cE#", "##k.#", "S..##", "#####"], sol: "F F L G F F C R F", leer: "Functies zijn niet verplicht: een korte route mag ook gewoon uitgeschreven.", ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) },
        { t: "Konvooi", s: "Twee keer hetzelfde: krater, kern, en door. Daarna de poort.", goal: "Bouw de bruggen, pak beide kernen op en bereik de poort.", hint: "Een functie stap() kan precies één krater-plus-kern doen.", g: ["###########", "S.k.c.k.c.E", "###########"], sol: "def stap { F G F F F C } call stap call stap F F", leer: "Een functie ontwerpen die één volledig deelprobleem oplost.", ...base(["F", "L", "R", "G", "C"], ["rep", "def"]) }
      ]
    },
    {
      id: "deep", suggest: 3, k: "Expert", modus: "Code",
      n: "Diepzee-lab", art: ART[5],
      d: "Onder de stad zitten sluizen op slot met een schild. Nova haalt monsters op en vindt zelf de weg.",
      terms: { wall: "Nova botste tegen de labwand.", exit: "het laboratorium", core: "monsters", shield: "Een schild blokkeert de sluis. Schakel het eerst uit.", shieldEmpty: "Er staat geen schild voor Nova." },
      legend: { E: "lab", x: "sluis", c: "monster" },
      levels: [
        { t: "Sluis open", s: "De deur heeft een energieschild. Zonder uitschakelen blijft hij dicht.", goal: "Open de sluis en bereik het lab.", g: ["#######", "S.x...E", "#######"], sol: "F X F F F F F", leer: "Een bekend commando in een nieuwe omgeving gebruiken.", ...base(["F", "L", "R", "X"]) },
        { t: "Eerste monster", s: "In de buis drijft een monster dat het lab nodig heeft.", goal: "Pak het monster op en bereik het lab.", g: ["#######", "S.c...E", "#######"], sol: "F F C F F F F", leer: "Pakken op het vakje waar Nova staat.", ...base(["F", "L", "R", "X", "C"]) },
        { t: "Schild of door", s: "Twee sluizen, niet op gelijke afstand. Kijk vooruit.", goal: "Bereik het lab.", g: ["#########", "S.x..x..E", "#########"], sol: "r10 { if schild { X } else { F } }", leer: "Een keuze in code: if / else, of als / anders in blokken.", ...base(["F", "L", "R", "X", "C"], ["rep", "if"], ["schild"]) },
        { t: "Tot het lab", s: "De buis is recht en leeg. Je hoeft de vakjes niet te tellen.", goal: "Bereik het lab.", hint: "while (!gedockt()) of while not gedockt(): blijf vooruitgaan tot Nova op het doel staat.", g: ["###########", "S.........E", "###########"], sol: "while { F }", leer: "Een lus die stopt op een voorwaarde, niet op een getal.", nieuw: [{ id: "WHILE", titel: "Zolang", tekst: "gedockt() is waar als Nova op het doel staat. while (!gedockt()) { vooruit(); } blijft dus gaan tot ze daar is. In Python: while not gedockt():" }], ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild"]) },
        { t: "Sluis en monster", s: "Onderweg wisselen sluizen en monsters. Eén aanpak moet voor de hele buis werken.", goal: "Open elke sluis, pak elk monster op en bereik het lab.", hint: "Zolang Nova niet bij het lab is: schild uit óf vooruit, en pak op als ze op een monster staat.", g: ["#############", "S.x.c.x.c.x.E", "#############"], sol: "while { if schild { X } else { F } if kern { C } }", leer: "Een voorwaarde-lus combineren met een sensor op het huidige vakje.", ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) },
        { t: "Diepere buis", s: "Dezelfde buis, een stuk langer. Je programma van de vorige opdracht kan blijven werken.", goal: "Open elke sluis, pak elk monster op en bereik het lab.", g: ["###############", "S.x.c.x.c.x.c.E", "###############"], sol: "while { if schild { X } else { F } if kern { C } }", leer: "Een programma dat blijft kloppen als de baan langer wordt.", ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern"]) },
        { t: "De bocht", s: "De buis klapt naar beneden en daarna terug naar het lab. Een muur betekent: draai rechts.", goal: "Open de sluis en bereik het lab.", hint: "Zolang niet gedockt: schild uit, anders bij een muur rechtsaf, anders vooruit.", g: ["######", "S....#", "####.#", "E.x..#", "######"], sol: "while { if schild { X } else { if muur { R } else { F } } }", leer: "Geneste keuzes: eerst het schild, anders de muur, anders vooruit.", ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern", "muur"]) },
        { t: "Lab bereikt", s: "Laatste duik. Er ligt een monster in de buis, en achter de bocht een sluis.", goal: "Pak het monster op, open de sluis en bereik het lab.", g: ["######", "Sc...#", "####.#", "E.x..#", "######"], sol: "while { if schild { X } else { if muur { R } else { F } } if kern { C } }", leer: "Sensoren, keuzes en een lus-tot-het-doel combineren.", ...base(["F", "L", "R", "X", "C"], ["rep", "if", "while"], ["schild", "kern", "muur"]) }
      ]
    }
  ];

  const GUIDE = [
    { h: "Drie niveaus, één programma", p: "Visueel is tikken met iconen. Blokken is slepen en nesten. Code is JavaScript of Python." },
    { h: "Opbouw", p: "Zes werelden met opdrachten van beginner tot expert." },
    { h: "Docentknop", p: "Ontgrendelt werelden en toont leerdoelen." },
    { h: "Kerndoelen", p: "Digitale geletterdheid en computational thinking voor groep 7–8 en VO." }
  ];

  const api = { WORLDS, GUIDE, LESKAART: [] };
  if (root.ITCExtra && root.ITCExtra.apply) root.ITCExtra.apply(api);
  root.ITCCatalog = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
