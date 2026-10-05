/* Meridiaan 2075 — programma-engine.
   Eén boom (AST) voor Visueel, Blokken en Code (JavaScript én Python). */
(function (root) {
  const OPS = {
    F: { js: "vooruit", py: "vooruit" },
    L: { js: "draaiLinks", py: "draai_links" },
    R: { js: "draaiRechts", py: "draai_rechts" },
    C: { js: "pak", py: "pak" },
    W: { js: "geefWater", py: "geef_water" },
    H: { js: "oogst", py: "oogst" },
    X: { js: "schakelUit", py: "schakel_uit" },
    Z: { js: "zetNeer", py: "zet_neer" },
    G: { js: "bouwBrug", py: "bouw_brug" }
  };
  const ALIAS = {};
  Object.keys(OPS).forEach(op => { ALIAS[OPS[op].js] = op; ALIAS[OPS[op].py] = op; });

  const SENSORS = {
    schild: "een schild",
    muur: "een muur",
    kern: "een kern",
    rood: "een rode kern",
    blauw: "een blauwe kern",
    plant: "een dorstige plant",
    krater: "een krater",
    leeg: "lege ruimte",
    gedockt: "het doel"
  };
  const KEYWORDS = new Set(["for", "while", "if", "else", "function", "def", "range", "not", "pass", "let", "in", "return"]);
  const WALK = new Set([".", "S", "E", "c", "o", "r", "b", "R", "B", "=", "1", "2"]);
  const DX = [1, 0, -1, 0];
  const DY = [0, -1, 0, 1];
  const DIRNAME = ["rechts", "omhoog", "links", "omlaag"];

  function strip(nodes) {
    return (nodes || []).map(n => {
      const o = { op: n.op };
      if (n.n != null) o.n = n.n;
      if (n.cond) o.cond = n.cond;
      if (n.name) o.name = n.name;
      if (n.body) o.body = strip(n.body);
      if (n.then) o.then = strip(n.then);
      if (n.op === "IF") o.else = strip(n.else || []);
      return o;
    });
  }

  function toJs(nodes, d) {
    const ind = "  ".repeat(d || 0);
    let s = "";
    for (const n of nodes || []) {
      if (n.op === "REP") s += ind + "for (let i = 0; i < " + n.n + "; i++) {\n" + blockJs(n.body, (d || 0) + 1) + ind + "}\n";
      else if (n.op === "IF") {
        s += ind + "if (" + n.cond + "()) {\n" + blockJs(n.then, (d || 0) + 1) + ind + "}";
        if (n.else && n.else.length) s += " else {\n" + blockJs(n.else, (d || 0) + 1) + ind + "}\n";
        else s += "\n";
      } else if (n.op === "WHILE") s += ind + "while (!gedockt()) {\n" + blockJs(n.body, (d || 0) + 1) + ind + "}\n";
      else if (n.op === "DEF") s += ind + "function " + n.name + "() {\n" + blockJs(n.body, (d || 0) + 1) + ind + "}\n";
      else if (n.op === "CALL") s += ind + n.name + "();\n";
      else s += ind + OPS[n.op].js + "();\n";
    }
    return s;
  }
  function blockJs(nodes, d) {
    return nodes && nodes.length ? toJs(nodes, d) : "  ".repeat(d) + "\n";
  }

  function toPy(nodes, d) {
    const pad = "    ".repeat(d || 0);
    let s = "";
    for (const n of nodes || []) {
      if (n.op === "REP") s += pad + "for i in range(" + n.n + "):\n" + pyBody(n.body, (d || 0) + 1);
      else if (n.op === "IF") {
        s += pad + "if " + n.cond + "():\n" + pyBody(n.then, (d || 0) + 1);
        if (n.else && n.else.length) s += pad + "else:\n" + pyBody(n.else, (d || 0) + 1);
      } else if (n.op === "WHILE") s += pad + "while not gedockt():\n" + pyBody(n.body, (d || 0) + 1);
      else if (n.op === "DEF") s += pad + "def " + n.name + "():\n" + pyBody(n.body, (d || 0) + 1);
      else if (n.op === "CALL") s += pad + n.name + "()\n";
      else s += pad + OPS[n.op].py + "()\n";
    }
    return s;
  }
  function pyBody(nodes, d) {
    return nodes && nodes.length ? toPy(nodes, d) : "    ".repeat(d) + "pass\n";
  }

  function parseDsl(src) {
    const tokens = String(src).replace(/[{}]/g, m => " " + m + " ").trim().split(/\s+/).filter(Boolean);
    let i = 0;
    function parseSeq() {
      const nodes = [];
      while (i < tokens.length && tokens[i] !== "}") nodes.push(parseOne());
      return nodes;
    }
    function expect(t) {
      if (tokens[i] !== t) throw new Error("Oplossing mist '" + t + "' bij " + (tokens[i] || "einde"));
      i++;
    }
    function parseOne() {
      const t = tokens[i++];
      if (!t) throw new Error("Oplossing loopt te vroeg af");
      const rep = /^r(\d+)$/.exec(t);
      if (rep) {
        const n = +rep[1];
        if (n < 1 || n > 50) throw new Error("Herhaling buiten 1–50");
        expect("{");
        const body = parseSeq();
        expect("}");
        return { op: "REP", n, body };
      }
      if (t === "if") {
        const cond = tokens[i++];
        if (!SENSORS[cond]) throw new Error("Onbekende sensor " + cond);
        expect("{");
        const thenB = parseSeq();
        expect("}");
        let elseB = [];
        if (tokens[i] === "else") {
          i++;
          expect("{");
          elseB = parseSeq();
          expect("}");
        }
        return { op: "IF", cond, then: thenB, else: elseB };
      }
      if (t === "while") {
        expect("{");
        const body = parseSeq();
        expect("}");
        return { op: "WHILE", body };
      }
      if (t === "def") {
        const name = tokens[i++];
        if (!name || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error("Ongeldige functienaam");
        expect("{");
        const body = parseSeq();
        expect("}");
        return { op: "DEF", name, body };
      }
      if (t === "call") return { op: "CALL", name: tokens[i++] };
      if (!OPS[t]) throw new Error("Onbekend in oplossing: " + t);
      return { op: t };
    }
    const ast = parseSeq();
    if (i !== tokens.length) throw new Error("Rest in oplossing: " + tokens.slice(i).join(" "));
    return ast;
  }

  function parseJs(src) {
    const tokens = [];
    let i = 0, line = 1;
    const text = String(src).replace(/\r/g, "");
    while (i < text.length) {
      const c = text[i];
      if (c === "\n") { line++; i++; continue; }
      if (c === " " || c === "\t") { i++; continue; }
      if (c === "/" && text[i + 1] === "/") { while (i < text.length && text[i] !== "\n") i++; continue; }
      if (/[A-Za-z_]/.test(c)) {
        let v = "";
        while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) v += text[i++];
        tokens.push({ k: "id", v, line });
        continue;
      }
      if (/[0-9]/.test(c)) {
        let v = "";
        while (i < text.length && /[0-9]/.test(text[i])) v += text[i++];
        tokens.push({ k: "num", v: +v, line });
        continue;
      }
      if (c === "+" && text[i + 1] === "+") { tokens.push({ k: "++", line }); i += 2; continue; }
      if ("(){};!<=".indexOf(c) >= 0) { tokens.push({ k: c, line }); i++; continue; }
      return { err: "Onbekend teken '" + c + "' op regel " + line + "." };
    }
    let p = 0;
    const peek = () => tokens[p];
    const eat = k => { const t = tokens[p]; if (!t || t.k !== k) return null; p++; return t; };
    const where = () => peek() ? " (regel " + peek().line + ")" : "";
    const example = "Voorbeeld: for (let i = 0; i < 4; i++) { vooruit(); }";

    function parseBlock() {
      if (!eat("{")) return { err: "Hier mist een {." + where() };
      const nodes = [];
      while (peek() && peek().k === ";") p++;
      while (peek() && peek().k !== "}") {
        const s = parseStmt();
        if (s.err) return s;
        if (s.node) nodes.push(s.node);
        while (peek() && peek().k === ";") p++;
      }
      if (!eat("}")) return { err: "Hier mist een }." + where() };
      return { nodes };
    }
    function parseStmt() {
      while (peek() && peek().k === ";") p++;
      const t = peek();
      if (!t || t.k !== "id") return { err: "Hier hoort een opdracht." + where() };
      if (t.v === "for") return parseFor();
      if (t.v === "while") return parseWhile();
      if (t.v === "if") return parseIf();
      if (t.v === "function") return parseFn();
      if (t.v === "else") return { err: "else hoort direct achter een if-blok." + where() };
      return parseCall();
    }
    function parseFor() {
      const start = peek();
      if (!eat("id") || !eat("(") || !eat("id") || !(peek() && peek().k === "id")) return { err: example + where() };
      const v = eat("id");
      if (!eat("=") || !(peek() && peek().k === "num" && peek().v === 0) || !eat("num") || !eat(";")) return { err: example + where() };
      if (!(peek() && peek().k === "id" && peek().v === v.v) || !eat("id") || !eat("<") || !(peek() && peek().k === "num")) return { err: example + where() };
      const n = eat("num").v;
      if (!eat(";") || !(peek() && peek().k === "id" && peek().v === v.v) || !eat("id") || !eat("++") || !eat(")")) return { err: example + where() };
      if (n < 1 || n > 50) return { err: "Een herhaling moet tussen 1 en 50 liggen." + (start ? " (regel " + start.line + ")" : "") };
      const body = parseBlock();
      if (body.err) return body;
      return { node: { op: "REP", n, body: body.nodes } };
    }
    function parseWhile() {
      if (!eat("id") || !eat("(") || !eat("!") || !(peek() && peek().v === "gedockt") || !eat("id") || !eat("(") || !eat(")") || !eat(")")) {
        return { err: "Gebruik while (!gedockt()) { ... }" + where() };
      }
      const body = parseBlock();
      if (body.err) return body;
      return { node: { op: "WHILE", body: body.nodes } };
    }
    function parseIf() {
      if (!eat("id") || !eat("(") || !(peek() && peek().k === "id") ) return { err: "Gebruik if (schild()) { ... }" + where() };
      const name = eat("id").v;
      if (!SENSORS[name] || name === "gedockt") return { err: "Onbekende sensor " + name + "()." + where() };
      if (!eat("(") || !eat(")") || !eat(")")) return { err: "Gebruik if (" + name + "()) { ... }" + where() };
      const thenB = parseBlock();
      if (thenB.err) return thenB;
      let elseB = [];
      if (peek() && peek().k === "id" && peek().v === "else") {
        eat("id");
        const e = parseBlock();
        if (e.err) return e;
        elseB = e.nodes;
      }
      return { node: { op: "IF", cond: name, then: thenB.nodes, else: elseB } };
    }
    function checkName(name, line) {
      if (ALIAS[name] || KEYWORDS.has(name) || SENSORS[name]) return "De naam " + name + " is al in gebruik (regel " + line + ").";
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return "Ongeldige functienaam (regel " + line + ").";
      return "";
    }
    function parseFn() {
      const kw = eat("id");
      const nm = eat("id");
      if (!nm) return { err: "Gebruik function missie() { ... }" + where() };
      const bad = checkName(nm.v, nm.line);
      if (bad) return { err: bad };
      if (!eat("(") || !eat(")")) return { err: "Achter " + nm.v + " horen lege haakjes ()." };
      const body = parseBlock();
      if (body.err) return body;
      return { node: { op: "DEF", name: nm.v, body: body.nodes, line: kw.line } };
    }
    function parseCall() {
      const nm = eat("id");
      if (!eat("(") || !eat(")")) return { err: "Gebruik " + nm.v + "();" + " (regel " + nm.line + ")." };
      if (eat(";")) { /* optional */ }
      if (ALIAS[nm.v]) return { node: { op: ALIAS[nm.v], line: nm.line } };
      return { node: { op: "CALL", name: nm.v, line: nm.line } };
    }
    const nodes = [];
    while (peek()) {
      const s = parseStmt();
      if (s.err) return s;
      if (s.node) nodes.push(s.node);
    }
    return { ast: nodes };
  }

  function parsePy(src) {
    const raw = String(src).replace(/\r/g, "").replace(/\t/g, "    ").split("\n");
    const lines = [];
    for (let li = 0; li < raw.length; li++) {
      const cut = raw[li].replace(/#.*$/, "");
      if (!cut.trim()) continue;
      lines.push({ indent: cut.match(/^ */)[0].length, text: cut.trim(), line: li + 1 });
    }
    let i = 0;
    function parseBlock(parentIndent) {
      if (i >= lines.length || lines[i].indent <= parentIndent) {
        const prev = lines[i - 1];
        return { err: "Na regel " + (prev ? prev.line : "?") + " moet een ingesprongen blok komen." };
      }
      const ind = lines[i].indent;
      const nodes = [];
      while (i < lines.length && lines[i].indent >= ind) {
        if (lines[i].indent !== ind) return { err: "Inspringing klopt niet op regel " + lines[i].line + "." };
        const r = parseStmt(ind);
        if (r.err) return r;
        if (r.node) nodes.push(r.node);
      }
      return { nodes };
    }
    function checkName(name, line) {
      if (ALIAS[name] || KEYWORDS.has(name) || SENSORS[name]) return "De naam " + name + " is al in gebruik (regel " + line + ").";
      return "";
    }
    function parseStmt(ind) {
      const L = lines[i];
      const t = L.text;
      let m;
      if (t === "pass") { i++; return { node: null }; }
      if (t === "else:") return { err: "else zonder if op regel " + L.line + "." };
      m = /^for\s+[A-Za-z_]\w*\s+in\s+range\(\s*(\d+)\s*\)\s*:$/.exec(t);
      if (m) {
        const n = +m[1];
        if (n < 1 || n > 50) return { err: "range moet tussen 1 en 50 liggen (regel " + L.line + ")." };
        i++;
        const body = parseBlock(ind);
        if (body.err) return body;
        return { node: { op: "REP", n, body: body.nodes } };
      }
      if (/^while\s+not\s+gedockt\(\)\s*:$/.test(t)) {
        i++;
        const body = parseBlock(ind);
        if (body.err) return body;
        return { node: { op: "WHILE", body: body.nodes } };
      }
      m = /^if\s+([A-Za-z_]\w*)\(\)\s*:$/.exec(t);
      if (m) {
        if (!SENSORS[m[1]] || m[1] === "gedockt") return { err: "Onbekende sensor " + m[1] + "() op regel " + L.line + "." };
        i++;
        const thenB = parseBlock(ind);
        if (thenB.err) return thenB;
        let elseB = [];
        if (i < lines.length && lines[i].indent === ind && lines[i].text === "else:") {
          i++;
          const e = parseBlock(ind);
          if (e.err) return e;
          elseB = e.nodes;
        }
        return { node: { op: "IF", cond: m[1], then: thenB.nodes, else: elseB } };
      }
      m = /^def\s+([A-Za-z_]\w*)\(\)\s*:$/.exec(t);
      if (m) {
        const bad = checkName(m[1], L.line);
        if (bad) return { err: bad };
        i++;
        const body = parseBlock(ind);
        if (body.err) return body;
        return { node: { op: "DEF", name: m[1], body: body.nodes } };
      }
      m = /^([A-Za-z_]\w*)\(\)$/.exec(t);
      if (m) {
        i++;
        if (ALIAS[m[1]]) return { node: { op: ALIAS[m[1]], line: L.line } };
        return { node: { op: "CALL", name: m[1], line: L.line } };
      }
      return { err: "Onbekende regel " + L.line + ": " + t };
    }
    const nodes = [];
    while (i < lines.length) {
      if (lines[i].indent !== 0) return { err: "Onverwachte inspringing op regel " + lines[i].line + "." };
      const r = parseStmt(0);
      if (r.err) return r;
      if (r.node) nodes.push(r.node);
    }
    return { ast: nodes };
  }

  function run(world, level, ast) {
    const terms = world.terms || {};
    const grid = level.g.map(r => r.split(""));
    let x = 0, y = 0, d = level.dir || 0, a = (level.dir || 0) * 90, carry = null;
    let needC = 0, needO = 0, needZ = 0, gotC = 0, gotO = 0, placed = 0, steps = 0;
    grid.forEach((r, j) => r.forEach((c, i) => {
      if (c === "S") { x = i; y = j; }
      if (c === "c") needC++;
      if (c === "o") needO++;
      if (c === "r" || c === "b") needZ++;
    }));
    const tr = [];
    let stopped = false, arrived = false, err = "";
    const fns = {};
    function snap(hid, bad) {
      return { x, y, a, hid: hid || 0, bad: !!bad, carry, grid: grid.map(r => r.slice()) };
    }
    function fail(msg) { if (!stopped) { stopped = true; err = msg; } return false; }
    function frontCell() {
      const nx = x + DX[d], ny = y + DY[d];
      return { nx, ny, ch: grid[ny] ? grid[ny][nx] : "" };
    }
    function sense(cond) {
      const f = frontCell();
      const here = grid[y][x];
      switch (cond) {
        case "schild": return f.ch === "x";
        case "muur": return !f.ch || f.ch === "#";
        case "plant": return f.ch === "v";
        case "krater": return f.ch === "k";
        case "leeg": return f.ch === ".";
        case "kern": return here === "c";
        case "rood": return here === "r";
        case "blauw": return here === "b";
        case "gedockt": return here === "E";
        default: return false;
      }
    }
    function prim(node, fn) {
      if (stopped) return;
      if (++steps > 1000) { fail("Te veel stappen. Controleer je lus."); return; }
      const ok = fn();
      tr.push(snap(node && node.hid, !ok));
    }
    function doF() {
      const f = frontCell();
      const looking = DIRNAME[d];
      if (f.ch === "x") return fail((terms.shield || "Een schild blokkeert de route. Schakel het eerst uit.") + " Nova keek " + looking + ".");
      if (f.ch === "v") return fail((terms.plant || "De plant is droog. Geef eerst water.") + " Nova keek " + looking + ".");
      if (f.ch === "k") return fail((terms.crater || "Een krater blokkeert de route. Bouw eerst een brug.") + " Nova keek " + looking + ".");
      if (!f.ch || f.ch === "#" || !WALK.has(f.ch)) {
        if (grid[y][x] === "E") { arrived = true; return true; }
        return fail((terms.wall || "Nova botste tegen een obstakel.") + " Ze keek " + looking + ".");
      }
      x = f.nx; y = f.ny;
      return true;
    }
    function doC() {
      const here = grid[y][x];
      if (here === "o") return fail("Dit is oogst. Gebruik oogst().");
      if (here === "c") { grid[y][x] = "."; gotC++; return true; }
      if (here === "r" || here === "b") {
        if (carry) return fail("Nova draagt al een kern. Zet die eerst neer.");
        carry = here;
        grid[y][x] = ".";
        return true;
      }
      return fail("Hier ligt niets om op te pakken.");
    }
    function doH() {
      if (grid[y][x] !== "o") return fail("Hier valt niets te oogsten.");
      grid[y][x] = ".";
      gotO++;
      return true;
    }
    function actFront(expect, next, emptyMsg) {
      const f = frontCell();
      if (f.ch !== expect) return fail(emptyMsg);
      grid[f.ny][f.nx] = next;
      return true;
    }
    function doZ() {
      const here = grid[y][x];
      if (!carry) return fail("Nova draagt niets.");
      if (here !== "R" && here !== "B") return fail("Dit is geen rack.");
      const want = here === "R" ? "r" : "b";
      if (carry !== want) return fail(carry === "r" ? "Dit rack is niet rood." : "Dit rack is niet blauw.");
      grid[y][x] = carry === "r" ? "1" : "2";
      carry = null;
      placed++;
      return true;
    }
    function execList(list, depth) {
      if (stopped || arrived) return;
      for (const node of list || []) {
        if (stopped || arrived) return;
        execNode(node, depth);
      }
    }
    function execNode(node, depth) {
      if (stopped || arrived) return;
      if (node.op === "REP") {
        const n = Math.max(0, Math.min(node.n | 0, 50));
        for (let k = 0; k < n && !stopped && !arrived; k++) execList(node.body, depth);
        return;
      }
      if (node.op === "WHILE") {
        let guard = 0;
        while (!stopped && !arrived && !sense("gedockt")) {
          if (++guard > 400) { fail("Deze lus stopt niet. Nova heeft een limiet bereikt."); return; }
          execList(node.body, depth);
        }
        return;
      }
      if (node.op === "IF") {
        if (!SENSORS[node.cond]) { fail("Onbekende sensor " + node.cond + "()."); return; }
        if (sense(node.cond)) execList(node.then, depth);
        else execList(node.else, depth);
        return;
      }
      if (node.op === "DEF") { fns[node.name] = node.body || []; return; }
      if (node.op === "CALL") {
        if (depth > 30) { fail("Te veel geneste aanroepen."); return; }
        if (!fns[node.name]) { fail("De functie " + node.name + " bestaat nog niet. Definieer haar eerst."); return; }
        execList(fns[node.name], depth + 1);
        return;
      }
      if (node.op === "F") prim(node, doF);
      else if (node.op === "L") prim(node, () => { d = (d + 1) % 4; a -= 90; return true; });
      else if (node.op === "R") prim(node, () => { d = (d + 3) % 4; a += 90; return true; });
      else if (node.op === "C") prim(node, doC);
      else if (node.op === "H") prim(node, doH);
      else if (node.op === "W") prim(node, () => actFront("v", ".", terms.plantEmpty || "Er staat geen dorstige plant voor Nova."));
      else if (node.op === "X") prim(node, () => actFront("x", ".", terms.shieldEmpty || "Er staat geen schild voor Nova."));
      else if (node.op === "G") prim(node, () => actFront("k", "=", terms.craterEmpty || "Er ligt geen krater voor Nova."));
      else if (node.op === "Z") prim(node, doZ);
      else fail("Onbekende opdracht.");
    }

    tr.push(snap(0, false));
    execList(ast, 0);
    if (stopped) return { ok: false, m: err, tr, steps, x, y, grid };
    if (grid[y][x] !== "E") return { ok: false, m: "Nova is nog niet bij " + (terms.exit || "het doel") + ".", tr, steps, x, y, grid };
    if (gotC < needC) return { ok: false, m: "Nog niet alle " + (terms.core || "energiekernen") + " zijn opgehaald.", tr, steps, x, y, grid };
    if (gotO < needO) return { ok: false, m: "De oogst is nog niet compleet.", tr, steps, x, y, grid };
    if (placed < needZ || carry) return { ok: false, m: carry ? "Nova draagt nog een kern. Zet die eerst in het rack." : "Nog niet alle kernen liggen in het juiste rack.", tr, steps, x, y, grid };
    return { ok: true, m: "Missie geslaagd.", tr, steps, x, y, grid };
  }

  const api = { OPS, ALIAS, SENSORS, strip, toJs, toPy, parseDsl, parseJs, parsePy, run };
  root.ITCEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
