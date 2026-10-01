/* Meridiaan 2075 — scherm, drie modi, voortgang. */
(function () {
  const E = window.ITCEngine;
  const WORLDS = window.ITCCatalog.WORLDS;
  const GUIDE = window.ITCCatalog.GUIDE;
  const LESKAART = window.ITCCatalog.LESKAART || [];
  const MODES = [["Visueel", "Niveau 1"], ["Blokken", "Niveau 2"], ["Code", "Niveau 3"]];
  const LABEL = { F: "vooruit", L: "draai links", R: "draai rechts", C: "pak op", W: "geef water", H: "oogst", X: "schakel uit", Z: "zet neer", G: "bouw brug" };
  const ACCENT = {
    sky: ["#0f766e", "#0369a1"], hydro: ["#15803d", "#0f766e"], orbit: ["#c2410c", "#0369a1"],
    data: ["#0369a1", "#0e7490"], mars: ["#ea580c", "#c2410c"], deep: ["#0e7490", "#0369a1"]
  };
  const SAVE = "itc-meridiaan-v1";

let mode = 1, lang = "js", teach = false, menu = false, cat = "move";
  let wi = 0, lv = 0, active = -1, sel = "", timer = null, drag = null, skipClick = false, view = null, runToken = 0;
  let prog = {}, done = {}, seen = [], hintsUsed = {}, play = null, paused = false, tourSeen = false, tourStep = 0;
  let tourPlaying = false, tourMuted = false, tourToken = 0;

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const world = () => WORLDS[wi];
  const level = () => world().levels[lv];
  const list = () => { const id = world().id; prog[id] = prog[id] || {}; prog[id][lv] = prog[id][lv] || []; return prog[id][lv]; };
  const doneOf = id => done[id] || (done[id] = []);

  function svg(inner) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>"; }
  const stroke = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICO = {
    F: svg('<path d="M12 19V5M12 5l-5 5M12 5l5 5" ' + stroke + "/>"),
    L: svg('<path d="M9 14a4 4 0 1 0-1-3" ' + stroke + '/><path d="M8 7V4H5" ' + stroke + "/>"),
    R: svg('<path d="M15 14a4 4 0 1 1 1-3" ' + stroke + '/><path d="M16 7V4h3" ' + stroke + "/>"),
    C: svg('<path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" ' + stroke + "/>"),
    W: svg('<path d="M12 3s5 6 5 9a5 5 0 0 1-10 0c0-3 5-9 5-9z" ' + stroke + "/>"),
    H: svg('<path d="M12 21V10M12 10c-4 0-6-3-6-3s2 5 6 3c4 2 6 0 6-3s-2 3-6 3z" ' + stroke + "/>"),
    X: svg('<path d="M8 8l8 8M16 8l-8 8" ' + stroke + '/><circle cx="12" cy="12" r="8" ' + stroke + "/>"),
    Z: svg('<path d="M12 4v10M12 14l-4-4M12 14l4-4M5 19h14" ' + stroke + "/>"),
    G: svg('<path d="M4 16h16M7 16V9h4v7M13 16v-4h4v4" ' + stroke + "/>"),
    REP: svg('<path d="M20 12a8 8 0 1 1-2.2-5.5L20 8" ' + stroke + '/><path d="M20 4v4h-4" ' + stroke + "/>"),
    IF: svg('<path d="M12 3l8 5v8l-8 5-8-5V8l8-5z" ' + stroke + "/>"),
    WHILE: svg('<path d="M7 7h8a4 4 0 0 1 0 8H8" ' + stroke + '/><path d="M11 12l-3 3 3 3" ' + stroke + "/>"),
    DEF: svg('<path d="M8 5H5v14h3M16 5h3v14h-3M9 12h6" ' + stroke + "/>")
  };
  const icon = id => ICO[id] || ICO.F;
  const groupOf = op => "FLR".includes(op) ? "move" : "act";

  function save() {
    try {
      const programs = {};
      Object.keys(prog).forEach(id => {
        programs[id] = {};
        Object.keys(prog[id]).forEach(k => { programs[id][k] = E.strip(prog[id][k]); });
      });
      localStorage.setItem(SAVE, JSON.stringify({ mode, lang, done, seen, programs, hintsUsed, tourSeen }));
    } catch (e) { /* volle of geblokkeerde opslag: de sessie werkt wel */ }
  }
  function heal(nodes) {
    (nodes || []).forEach(n => {
      if (n.op === "REP" || n.op === "WHILE" || n.op === "DEF") { n.body = n.body || []; heal(n.body); }
      if (n.op === "IF") { n.then = n.then || []; n.else = n.else || []; heal(n.then); heal(n.else); }
    });
    return nodes || [];
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE) || "null");
      if (!s) return;
      mode = s.mode || 1;
      lang = s.lang === "py" ? "py" : "js";
      done = s.done || {};
      seen = s.seen || [];
      hintsUsed = s.hintsUsed || {};
      tourSeen = !!s.tourSeen;
      prog = {};
      Object.keys(s.programs || {}).forEach(id => {
        prog[id] = {};
        Object.keys(s.programs[id]).forEach(k => { prog[id][k] = heal(s.programs[id][k]); });
      });
    } catch (e) { prog = {}; done = {}; seen = []; hintsUsed = {}; tourSeen = false; }
  }

  function stamp(nodes) {
    let n = 1;
    (function walk(list) {
      list.forEach(node => {
        node.hid = n++;
        if (node.body) walk(node.body);
        if (node.then) walk(node.then);
        if (node.else) walk(node.else);
      });
    })(nodes);
  }
  function locate(path) {
    const parts = String(path).split("/");
    let arr = list();
    for (let i = 0; i < parts.length - 1; i += 2) arr = arr[+parts[i]][parts[i + 1]];
    const index = +parts[parts.length - 1];
    return { arr, index, node: arr[index] };
  }
  function resolveSocket(path) {
    if (!path) return list();
    const parts = path.split("/");
    let arr = list();
    for (let i = 0; i < parts.length; i += 2) {
      const node = arr[+parts[i]];
      if (!node || !node[parts[i + 1]]) return null;
      arr = node[parts[i + 1]];
    }
    return arr;
  }
  function freshName() {
    const names = new Set();
    (function walk(nodes) {
      nodes.forEach(n => {
        if (n.op === "DEF") names.add(n.name);
        ["body", "then", "else"].forEach(k => n[k] && walk(n[k]));
      });
    })(list());
    let name = "missie", k = 2;
    while (names.has(name)) name = "missie" + (k++);
    return name;
  }
  function makeNode(kind) {
    if (kind === "REP") return { op: "REP", n: 2, body: [] };
    if (kind === "IF") return { op: "IF", cond: (level().sensors && level().sensors[0]) || "schild", then: [], else: [] };
    if (kind === "WHILE") return { op: "WHILE", body: [] };
    if (kind === "DEF") return { op: "DEF", name: freshName(), body: [] };
    return { op: kind };
  }
  function insertAt(arr, idx, kind) {
    if (kind === "DEF") {
      const node = makeNode("DEF");
      arr.splice(idx, 0, node, { op: "CALL", name: node.name });
      return;
    }
    arr.splice(idx, 0, makeNode(kind));
  }
  function renameCalls(oldName, name) {
    (function walk(nodes) {
      nodes.forEach(n => {
        if (n.op === "CALL" && n.name === oldName) n.name = name;
        ["body", "then", "else"].forEach(k => n[k] && walk(n[k]));
      });
    })(list());
  }

  function accent(w) {
    const root = document.documentElement;
    if (!w) { root.style.removeProperty("--ac"); root.style.removeProperty("--ac2"); return; }
    const pair = ACCENT[w.id];
    root.style.setProperty("--ac", pair[0]);
    root.style.setProperty("--ac2", pair[1]);
  }
  function unlocked(index) {
    if (teach || index === 0) return true;
    const prev = WORLDS[index - 1];
    return doneOf(prev.id).length >= prev.levels.length;
  }
  function canOpen(i) {
    if (teach || i === 0) return true;
    const d = doneOf(world().id);
    return d.includes(i) || d.includes(i - 1);
  }

  function modal(html, btns) {
    $("mc").innerHTML = html + '<div class="ctrl">' + btns.map((b, i) => '<button type="button" class="btn ' + (b[1] || "") + '" data-b="' + i + '">' + b[0] + "</button>").join("") + "</div>";
    $("md").classList.add("show");
    $("mc").querySelectorAll("[data-b]").forEach(el => el.onclick = () => {
      $("md").classList.remove("show");
      const fn = btns[+el.dataset.b][2];
      if (fn) fn();
    });
  }

  function tileClass(ch) {
    switch (ch) {
      case "#": return "wall";
      case "S": return "f s";
      case "E": return "f e";
      case "c": return "f core";
      case "o": return "f crop";
      case "v": return "plant";
      case "x": return "shield";
      case "k": return "crater";
      case "r": return "f crate r";
      case "b": return "f crate b";
      case "R": return "f slot r";
      case "B": return "f slot b";
      case "1": return "f slot r filled";
      case "2": return "f slot b filled";
      case "=": return "f bridge";
      default: return "f";
    }
  }
  const DRONE = '<svg viewBox="0 0 100 100"><path d="M20 20L80 80M80 20L20 80" stroke="#0b1220" stroke-width="5" opacity=".4"/><g fill="#2dd4bf" opacity=".55"><ellipse class="rot" cx="20" cy="20" rx="15" ry="4"/><ellipse class="rot" cx="80" cy="20" rx="15" ry="4"/><ellipse class="rot" cx="20" cy="80" rx="15" ry="4"/><ellipse class="rot" cx="80" cy="80" rx="15" ry="4"/></g><circle class="body" cx="50" cy="50" r="19" fill="#0369a1" stroke="#0b1220" stroke-width="3"/><path d="M69 50L87 41V59Z" fill="#f59e0b"/><circle cx="58" cy="50" r="6" fill="#0b1220"/><circle cx="60" cy="48" r="2" fill="#fff"/></svg>';

  function startFrame() {
    const g = level().g.map(r => r.split(""));
    let x = 0, y = 0;
    g.forEach((r, j) => r.forEach((c, i) => { if (c === "S") { x = i; y = j; } }));
    return { x, y, a: (level().dir || 0) * 90, grid: g, carry: null, hid: 0 };
  }
  function board() {
    const L = level();
    const H = L.g.length, W = L.g[0].length;
    const b = $("board");
    b.dataset.world = world().id;
    b.innerHTML = L.g.map(r => r.split("").map(c => '<div class="t ' + tileClass(c) + '"></div>').join("")).join("")
      + '<div class="drone" id="dr">' + DRONE + '</div><div class="ov" id="ov"></div>';
    const legend = world().legend || {};
    const used = new Set(L.g.join(""));
    $("legend").innerHTML = Object.keys(legend).filter(ch => used.has(ch)).map(ch => '<span><i class="sw t ' + tileClass(ch) + '"></i>' + esc(legend[ch]) + "</span>").join("");
    $("msg").textContent = "";
    $("msg").className = "msg";
    view = startFrame();
    requestAnimationFrame(fit);
  }
  function fit() {
    if (!view || document.body.classList.contains("home")) return;
    const frame = view;
    const H = frame.grid.length, W = frame.grid[0].length;
    const wrap = document.querySelector(".boardwrap");
    const b = $("board");
    const gap = 5, pad = 10;
    const cell = Math.max(18, Math.min(64, Math.floor(Math.min(
      (wrap.clientWidth - pad * 2 - gap * (W - 1)) / W,
      (Math.max(wrap.clientHeight, 180) - 46 - pad * 2 - gap * (H - 1)) / H
    ))));
    b.style.width = (pad * 2 + cell * W + gap * (W - 1)) + "px";
    b.style.height = (pad * 2 + cell * H + gap * (H - 1)) + "px";
    b.style.gridTemplateColumns = "repeat(" + W + "," + cell + "px)";
    b.style.gridTemplateRows = "repeat(" + H + "," + cell + "px)";
    b.dataset.cell = String(cell);
    paint(frame);
  }
  function paint(s) {
    view = s;
    const b = $("board");
    const cell = +b.dataset.cell || 36;
    const gap = 5, pad = 10;
    const d = $("dr");
    if (d) {
      d.style.width = cell + "px";
      d.style.height = cell + "px";
      d.style.left = (pad + s.x * (cell + gap)) + "px";
      d.style.top = (pad + s.y * (cell + gap)) + "px";
      d.style.transform = "rotate(" + s.a + "deg)";
      d.classList.toggle("bad", !!s.bad);
      d.classList.toggle("carry-r", s.carry === "r");
      d.classList.toggle("carry-b", s.carry === "b");
    }
    const W = s.grid[0].length;
    b.querySelectorAll(".t").forEach((el, i) => {
      el.className = "t " + tileClass(s.grid[(i / W) | 0][i % W]);
    });
    document.querySelectorAll("[data-hid]").forEach(el => el.classList.toggle("run", !!s.hid && el.dataset.hid === String(s.hid)));
  }

  function dots() {
    const d = doneOf(world().id);
    $("dots").innerHTML = world().levels.map((l, i) => {
      const locked = !canOpen(i);
      const cls = "dot" + (d.includes(i) ? " done" : "") + (i === lv ? " cur" : "");
      return '<button type="button" class="' + cls + '"' + (locked ? " disabled" : "") + ' data-lv="' + i + '" title="' + esc(l.t) + '" aria-label="Opdracht ' + (i + 1) + " " + esc(l.t) + '">' + (d.includes(i) ? "✓" : i + 1) + "</button>";
    }).join('<span class="bar"></span>');
    $("prev").disabled = lv <= 0;
    $("next").disabled = lv >= world().levels.length - 1 || !canOpen(lv + 1);
  }
  function mission() {
    const L = level();
    const meta = world().ct ? '<p class="meta mono">' + esc(world().ct) + "</p>" : "";
    $("mission").innerHTML = '<div><div class="tag mono">Opdracht ' + (lv + 1) + " / " + world().levels.length + "</div><h2>" + esc(L.t) + "</h2><p>" + esc(L.s) + "</p>" + meta + '</div><div class="doel"><b>Doel</b>' + esc(L.goal) + "</div>";
    tnote();
    resetHintsUI();
  }
  function tnote() {
    const box = $("tn");
    if (!teach) { box.innerHTML = ""; return; }
    const L = level();
    const kd = world().kerndoelen ? " · Kerndoelen: " + esc(world().kerndoelen) : "";
    const les = world().les ? " · Les: " + esc(world().les) : "";
    box.innerHTML = '<div class="doel"><b>Docent</b> · ' + esc(L.leer) + kd + les + ' <button type="button" class="btn" id="sol">Laad voorbeeldoplossing</button></div>';
    $("sol").onclick = () => { list().splice(0, list().length, ...heal(E.parseDsl(L.sol))); sel = ""; save(); editor(); board(); };
  }
  function hintKey() { return world().id + ":" + lv; }
  function resetHintsUI() {
    const used = hintsUsed[hintKey()] || 0;
    const box = $("hintbox");
    const btn = $("hintbtn");
    const hints = level().hints || [];
    if (!hints.length) {
      box.hidden = true;
      btn.disabled = true;
      btn.textContent = "Tip";
      return;
    }
    btn.disabled = used >= hints.length;
    btn.textContent = used >= hints.length ? "Tips op" : "Tip " + (used + 1) + "/" + hints.length;
    if (used > 0) {
      box.hidden = false;
      $("hintn").textContent = used + " / " + hints.length;
      $("hinttxt").textContent = hints[used - 1];
    } else box.hidden = true;
  }
  function showHint() {
    const hints = level().hints || [];
    if (!hints.length) return;
    const key = hintKey();
    const used = hintsUsed[key] || 0;
    if (used >= hints.length) return;
    hintsUsed[key] = used + 1;
    save();
    resetHintsUI();
  }

  function segHtml() {
    const buttons = MODES.map((m, i) => {
      const n = i + 1;
      const lab = n === 3 ? (lang === "py" ? "Python" : "JavaScript") + " ▾" : m[0];
      return '<button type="button" class="' + (mode === n ? "on" : "") + '" data-mode="' + n + '">' + lab + "<small>" + m[1] + "</small></button>";
    }).join("");
    const pop = menu ? '<div class="menu"><button type="button" data-lang="js"' + (lang === "js" ? ' class="on"' : "") + '>JavaScript</button><button type="button" data-lang="py"' + (lang === "py" ? ' class="on"' : "") + ">Python</button></div>" : "";
    return '<div class="seg">' + buttons + pop + "</div>";
  }
  function apiLine() {
    const L = level();
    const py = lang === "py";
    const bits = L.ops.map(op => (py ? E.OPS[op].py : E.OPS[op].js) + "()");
    if (L.logic.includes("rep")) bits.push(py ? "for i in range(4):" : "for (let i = 0; i < 4; i++) { }");
    if (L.logic.includes("if") && L.sensors[0]) bits.push(py ? "if " + L.sensors[0] + "():" : "if (" + L.sensors[0] + "()) { }");
    if (L.logic.includes("while")) bits.push(py ? "while not gedockt():" : "while (!gedockt()) { }");
    if (L.logic.includes("def")) bits.push(py ? "def missie():" : "function missie() { }");
    return '<div class="api">' + bits.map(x => "<code>" + esc(x) + "</code>").join("") + "</div>";
  }
  function visualNodes(nodes, prefix) {
    return nodes.map((n, i) => {
      const path = prefix ? prefix + "/" + i : String(i);
      if (n.op === "REP" || n.op === "WHILE" || n.op === "IF" || n.op === "DEF") {
        const kind = n.op === "REP" ? "loop" : n.op === "DEF" ? "fn" : "cond";
        const title = n.op === "REP" ? "↻ " + n.n : n.op === "WHILE" ? "zolang" : n.op === "DEF" ? n.name : "als " + n.cond;
        const inner = n.op === "IF"
          ? visualNodes(n.then, path + "/then") + '<span class="gt">anders</span>' + visualNodes(n.else || [], path + "/else")
          : visualNodes(n.body || [], path + "/body");
        return '<span class="grp ' + kind + '" data-hid="' + n.hid + '"><span class="gt">' + esc(title) + "</span>" + inner + '<button type="button" class="gx" data-del="' + path + '" aria-label="Verwijder">×</button></span>';
      }
      if (n.op === "CALL") return '<button type="button" class="ic" data-hid="' + n.hid + '" data-del="' + path + '">doe</button>';
      return '<button type="button" class="ic" data-hid="' + n.hid + '" data-del="' + path + '" title="' + LABEL[n.op] + '">' + icon(n.op) + "</button>";
    }).join("");
  }
  function socket(nodes, path, placeholder) {
    const on = sel === path ? " on" : "";
    const inner = nodes.map((n, i) => blockNode(n, path ? path + "/" + i : String(i))).join("");
    return '<div class="socket' + on + '" data-socket="' + path + '">' + (inner || '<span class="ph">' + placeholder + "</span>") + "</div>";
  }
  function blockNode(n, path) {
    const drag = ' draggable="true" data-path="' + path + '" data-hid="' + n.hid + '"';
    const x = '<button type="button" class="x" data-del="' + path + '" aria-label="Verwijder">×</button>';
    if (n.op === "REP") return '<div class="blk rep"' + drag + '><div class="bh">↻ herhaal <button type="button" data-bump="' + path + '" data-dir="-1">−</button><b>' + n.n + '</b><button type="button" data-bump="' + path + '" data-dir="1">+</button> keer ' + x + "</div>" + socket(n.body, path + "/body", "in de herhaling") + "</div>";
    if (n.op === "IF") {
      const opts = (level().sensors.length ? level().sensors : [n.cond]).map(s => '<option value="' + s + '"' + (n.cond === s ? " selected" : "") + ">" + esc(E.SENSORS[s] || s) + "</option>").join("");
      return '<div class="blk cond"' + drag + '><div class="bh">als <select data-cond="' + path + '">' + opts + "</select> " + x + '</div>' + socket(n.then, path + "/then", "dan") + '<div class="bh">anders</div>' + socket(n.else, path + "/else", "anders") + "</div>";
    }
    if (n.op === "WHILE") return '<div class="blk while"' + drag + '><div class="bh">zolang niet bij het doel ' + x + "</div>" + socket(n.body, path + "/body", "in de lus") + "</div>";
    if (n.op === "DEF") return '<div class="blk fn"' + drag + '><div class="bh">functie <input data-rename="' + path + '" value="' + esc(n.name) + '" maxlength="16" spellcheck="false"> ' + x + "</div>" + socket(n.body, path + "/body", "in de functie") + "</div>";
    if (n.op === "CALL") return '<div class="blk call"' + drag + "><span>doe " + esc(n.name) + "</span>" + x + "</div>";
    return '<div class="blk ' + groupOf(n.op) + '"' + drag + ">" + icon(n.op) + " " + LABEL[n.op] + x + "</div>";
  }
  function selLabel() {
    if (!sel) return "Start";
    const parts = sel.split("/");
    const key = parts[parts.length - 1];
    const node = locate(parts.slice(0, -1).join("/")).node;
    if (!node) return "Start";
    if (key === "then") return "dan";
    if (key === "else") return "anders";
    if (node.op === "REP") return "de herhaling";
    if (node.op === "WHILE") return "de zolang-lus";
    if (node.op === "DEF") return "functie " + node.name;
    return "dit blok";
  }
  function editor() {
    stamp(list());
    if (sel && !resolveSocket(sel)) sel = "";
    $("seghost").innerHTML = segHtml();
    const L = level();
    const box = $("editor");
    if (mode === 3) {
      const py = lang === "py";
      box.innerHTML = '<div class="tag">Niveau 3 · Code</div><h2>' + (py ? "Python" : "JavaScript") + "</h2>" + apiLine()
        + '<textarea id="ta" spellcheck="false" autocomplete="off" aria-label="Code"></textarea><div class="err" id="er"></div><p class="hint">Ctrl+Enter start het programma. // of # is commentaar.</p>';
      const ta = $("ta");
      ta.value = py ? E.toPy(list()) : E.toJs(list());
      return;
    }
    const move = L.ops.filter(op => "FLR".includes(op));
    const act = L.ops.filter(op => !"FLR".includes(op));
    const tabs = [];
    if (move.length) tabs.push(["move", "Beweging"]);
    if (act.length) tabs.push(["act", "Acties"]);
    if (L.logic.length && mode === 2) tabs.push(["logic", "Logica"]);
    if (!tabs.some(t => t[0] === cat)) cat = tabs[0][0];
    let pal = "";
    if (mode === 1) pal = L.ops.map(op => '<button type="button" class="pb big" draggable="true" data-add="' + op + '">' + icon(op) + "<span>" + LABEL[op] + "</span></button>").join("");
    else if (cat === "logic") {
      if (L.logic.includes("rep")) pal += '<button type="button" class="pb" draggable="true" data-add="REP">↻ herhaal</button>';
      if (L.logic.includes("if")) pal += '<button type="button" class="pb" draggable="true" data-add="IF">◇ als</button>';
      if (L.logic.includes("while")) pal += '<button type="button" class="pb" draggable="true" data-add="WHILE">⟳ zolang</button>';
      if (L.logic.includes("def")) pal += '<button type="button" class="pb" draggable="true" data-add="DEF">{ } functie</button>';
    } else {
      const ops = cat === "act" ? act : move;
      pal = ops.map(op => '<button type="button" class="pb" draggable="true" data-add="' + op + '">' + icon(op) + " " + LABEL[op] + "</button>").join("");
    }
    const tabHtml = mode === 2 && tabs.length > 1 ? '<div class="tabs">' + tabs.map(t => '<button type="button" data-cat="' + t[0] + '" class="' + (cat === t[0] ? "on" : "") + '">' + t[1] + "</button>").join("") + "</div>" : "";
    const program = mode === 1
      ? '<div class="strip">' + (visualNodes(list(), "") || '<span class="hint">Tik een icoon om te beginnen.</span>') + "</div>"
      : '<div class="stack"><div class="blk start">▶ Start</div>' + socket(list(), "", "tik of sleep een blok") + "</div>"
        + '<p class="selnote">Nieuwe blokken komen in <b>' + esc(selLabel()) + "</b>. Klik een vak om dat te wijzigen.</p>";
    let html = '<div class="tag">Niveau ' + mode + " · " + (mode === 1 ? "Visueel" : "Blokken") + "</div><h2>" + (mode === 1 ? "Tik de iconen" : "Bouw je programma") + "</h2>"
      + tabHtml + '<div class="pal">' + pal + "</div>" + program
      + (L.hint && mode === 1 && L.logic.length ? '<p class="hint">' + esc(L.hint) + "</p>" : "")
      + (L.hint && mode === 2 ? '<p class="hint">' + esc(L.hint) + "</p>" : "");
    if (mode === 2) {
      const py = lang === "py";
      const code = list().length ? (py ? E.toPy(list()) : E.toJs(list())) : (py ? "# Nog geen blokken" : "// Nog geen blokken");
      html = '<div class="split"><div>' + html + '</div><div class="codep"><div class="cph">Live code <button type="button" data-lang="js" class="' + (py ? "" : "on") + '">JavaScript</button><button type="button" data-lang="py" class="' + (py ? "on" : "") + '">Python</button></div><pre>' + esc(code) + "</pre></div></div>";
    }
    box.innerHTML = html;
  }

  function onEditorClick(ev) {
    if (skipClick) { skipClick = false; return; }
    const modeBtn = ev.target.closest("[data-mode]");
    if (modeBtn) return switchMode(+modeBtn.dataset.mode);
    const langBtn = ev.target.closest("[data-lang]");
    if (langBtn) { lang = langBtn.dataset.lang; menu = false; save(); editor(); return; }
    const del = ev.target.closest("[data-del]");
    if (del) {
      const loc = locate(del.dataset.del);
      loc.arr.splice(loc.index, 1);
      if (sel === del.dataset.del || sel.startsWith(del.dataset.del + "/")) sel = "";
      save(); editor(); return;
    }
    const bump = ev.target.closest("[data-bump]");
    if (bump) {
      const node = locate(bump.dataset.bump).node;
      node.n = Math.max(1, Math.min(20, node.n + (+bump.dataset.dir)));
      save(); editor(); return;
    }
    const add = ev.target.closest("[data-add]");
    if (add) { addKind(add.dataset.add); return; }
    const tab = ev.target.closest("[data-cat]");
    if (tab) { cat = tab.dataset.cat; editor(); return; }
    const sock = ev.target.closest("[data-socket]");
    if (sock && !ev.target.closest("button, select, input")) { sel = sock.dataset.socket; editor(); }
  }
  function addKind(kind) {
    const arr = resolveSocket(sel) || list();
    if (!resolveSocket(sel)) sel = "";
    insertAt(arr, arr.length, kind);
    const idx = kind === "DEF" ? arr.length - 2 : arr.length - 1;
    if (kind === "REP" || kind === "WHILE" || kind === "DEF") sel = (sel ? sel + "/" : "") + idx + "/body";
    if (kind === "IF") sel = (sel ? sel + "/" : "") + idx + "/then";
    save(); editor();
  }
  function switchMode(n) {
    if (n === 3 && mode === 3) { menu = !menu; editor(); return; }
    if (mode === 3 && $("ta")) {
      const r = readCode();
      if (r.err) { menu = false; $("er").textContent = r.err; return; }
    }
    menu = false;
    mode = n;
    if (n === 1) sel = "";
    save();
    editor();
  }
  function readCode() {
    const ta = $("ta");
    if (!ta) return { ast: list() };
    return lang === "py" ? E.parsePy(ta.value) : E.parseJs(ta.value);
  }
  function onEditorChange(ev) {
    const cond = ev.target.closest("[data-cond]");
    if (cond) { locate(cond.dataset.cond).node.cond = ev.target.value; save(); editor(); return; }
    const ren = ev.target.closest("[data-rename]");
    if (!ren) return;
    const node = locate(ren.dataset.rename).node;
    let name = ren.value.replace(/[^A-Za-z0-9_]/g, "");
    if (!name || E.ALIAS[name] || E.SENSORS[name] || /^(for|while|if|else|function|def|range|not|pass|let|in)$/.test(name)) name = node.name;
    renameCalls(node.name, name);
    node.name = name;
    save(); editor();
  }
  function onDragStart(ev) {
    const add = ev.target.closest("[data-add]");
    const blk = ev.target.closest(".blk[data-path]");
    if (ev.target.closest("button, select, input") && !add) { ev.preventDefault(); return; }
    if (add) drag = { add: add.dataset.add };
    else if (blk) drag = { path: blk.dataset.path };
    else return;
    ev.dataTransfer.setData("text/plain", "x");
    ev.dataTransfer.effectAllowed = "move";
  }
  function onDrop(ev) {
    const sock = ev.target.closest("[data-socket]");
    if (!sock || !drag) return;
    ev.preventDefault();
    const socketPath = sock.dataset.socket;
    const dest = resolveSocket(socketPath);
    if (!dest) { drag = null; return; }
    const rows = [...sock.querySelectorAll(":scope > .blk")];
    let idx = rows.length;
    rows.forEach((row, r) => {
      const b = row.getBoundingClientRect();
      if (idx === rows.length && ev.clientY < b.top + b.height / 2) idx = r;
    });
    if (drag.add) insertAt(dest, idx, drag.add);
    else if (drag.path && socketPath !== drag.path && !socketPath.startsWith(drag.path + "/")) {
      const loc = locate(drag.path);
      const node = loc.arr.splice(loc.index, 1)[0];
      let at = idx;
      if (loc.arr === dest && loc.index < idx) at--;
      dest.splice(Math.max(0, at), 0, node);
    }
    drag = null;
    save();
    editor();
  }

  function stop() {
    runToken++;
    clearTimeout(timer);
    timer = null;
    play = null;
    paused = false;
    $("run").disabled = false;
    $("run").textContent = "Start";
    $("step").disabled = false;
    $("pause").disabled = true;
    $("pause").textContent = "Pauze";
  }
  function delay() { return +($("speed") && $("speed").value) || 300; }
  function syncCode() {
    if (mode !== 3) return true;
    const parsed = readCode();
    const er = $("er");
    if (parsed.err) { if (er) er.textContent = parsed.err; return false; }
    if (er) er.textContent = "";
    list().splice(0, list().length, ...heal(parsed.ast));
    save();
    return true;
  }
  function beginPlay() {
    if (!syncCode()) return null;
    const res = E.run(world(), level(), list());
    $("ov").classList.remove("show");
    $("msg").textContent = "";
    $("msg").className = "msg";
    return { token: ++runToken, res, i: 0 };
  }
  function finishPlay(session) {
    timer = null;
    play = null;
    paused = false;
    $("run").disabled = false;
    $("run").textContent = "Start";
    $("step").disabled = false;
    $("pause").disabled = true;
    $("pause").textContent = "Pauze";
    const res = session.res;
    $("msg").textContent = res.m;
    $("msg").className = "msg " + (res.ok ? "ok" : "no");
    if (res.ok) {
      const d = doneOf(world().id);
      if (!d.includes(lv)) d.push(lv);
      save();
      dots();
      const stars = res.steps <= parSteps() ? 3 : res.steps <= parSteps() * 1.5 ? 2 : 1;
      setTimeout(() => { if (session.token === runToken) showWin(stars); }, 350);
    }
  }
  function advance(session) {
    if (session.token !== runToken) return false;
    paint(session.res.tr[session.i] || session.res.tr[session.res.tr.length - 1]);
    session.i++;
    if (session.i >= session.res.tr.length) {
      finishPlay(session);
      return false;
    }
    return true;
  }
  function parSteps() {
    const L = level();
    if (!L._par) {
      const res = E.run(world(), L, E.parseDsl(L.sol));
      L._par = res.steps || 1;
    }
    return L._par;
  }
  function showWin(stars) {
    const last = lv >= world().levels.length - 1;
    $("ov").innerHTML = '<div><h3>' + (last ? "Wereld voltooid" : "Missie geslaagd") + '</h3><div class="stars">' + "★".repeat(stars) + "☆".repeat(3 - stars) + '</div><button type="button" class="btn go" id="nx">' + (last ? "Naar werelden" : "Volgende opdracht") + "</button></div>";
    $("ov").classList.add("show");
    $("nx").onclick = () => { if (last) home(); else go(lv + 1); };
  }
  function run() {
    if (play && !paused) return;
    if (play && paused) {
      paused = false;
      $("pause").textContent = "Pauze";
      $("run").textContent = "Bezig…";
      schedule(play);
      return;
    }
    const session = beginPlay();
    if (!session) return;
    play = session;
    $("run").disabled = true;
    $("run").textContent = "Bezig…";
    $("step").disabled = true;
    $("pause").disabled = false;
    schedule(session);
  }
  function schedule(session) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (paused || session.token !== runToken) return;
      if (advance(session)) schedule(session);
    }, delay());
  }
  function stepOnce() {
    if (play && !paused) return;
    if (!play) {
      const session = beginPlay();
      if (!session) return;
      play = session;
      $("pause").disabled = false;
      $("pause").textContent = "Hervat";
      paused = true;
      $("run").textContent = "Hervat";
    }
    if (!advance(play)) return;
    paused = true;
    $("pause").textContent = "Hervat";
    $("run").disabled = false;
    $("run").textContent = "Hervat";
    $("step").disabled = false;
  }
  function togglePause() {
    if (!play) return;
    if (paused) {
      paused = false;
      $("pause").textContent = "Pauze";
      $("run").disabled = true;
      $("run").textContent = "Bezig…";
      $("step").disabled = true;
      schedule(play);
    } else {
      paused = true;
      clearTimeout(timer);
      timer = null;
      $("pause").textContent = "Hervat";
      $("run").disabled = false;
      $("run").textContent = "Hervat";
      $("step").disabled = false;
    }
  }

  function go(i) {
    stop();
    lv = i;
    sel = "";
    cat = "move";
    menu = false;
    mission();
    dots();
    board();
    editor();
    intro();
  }
  function intro() {
    const L = level();
    const key = world().id + ":" + lv;
    if (!L.nieuw || !L.nieuw.length || seen.includes(key) || teach) return;
    seen.push(key);
    save();
    modal(L.nieuw.map(n => "<h3>Nieuw: " + esc(n.titel) + '</h3><p><span class="bp">' + icon(n.id) + "</span> " + esc(n.tekst) + "</p>").join(""), [["Begrepen", "go"]]);
  }
  function home() {
    stop();
    document.body.className = "home";
    accent(null);
    $("sub").textContent = "Programmeer Nova en los puzzels op.";
    $("wg").innerHTML = WORLDS.map((w, i) => {
      const open = unlocked(i);
      const d = doneOf(w.id);
      const pr = !open ? "Rond " + WORLDS[i - 1].n + " af" : d.length >= w.levels.length ? "Voltooid" : d.length ? "Opdracht " + (d.length + 1) + " van " + w.levels.length : "Nog niet begonnen";
      const kd = w.kerndoelen ? '<p class="kd">' + esc(w.kerndoelen) + "</p>" : "";
      return '<article class="wcard ' + w.k + (open ? "" : " off") + '"><span class="wid mono">Wereld ' + (i + 1) + '</span><div class="art">' + w.art + '</div><div class="wbody"><span class="lvl">' + w.k + " · " + w.modus + "</span><h3>" + esc(w.n) + "</h3><p>" + esc(w.d) + "</p>" + kd + '<div class="pbar"><i style="width:' + (open ? d.length / w.levels.length * 100 : 0) + '%"></i></div><div class="pr">' + esc(pr) + '</div><div class="ctrl"><button type="button" class="btn go" data-play="' + i + '"' + (open ? "" : " disabled") + '>Speel</button><button type="button" class="btn" data-reset="' + i + '"' + (d.length ? "" : " disabled") + ">Opnieuw</button></div></div></article>";
    }).join("");
  }
  function playWorld(index) {
    if (!unlocked(index)) return;
    if (index !== active) mode = WORLDS[index].suggest;
    active = index;
    wi = index;
    document.body.className = "";
    accent(world());
    $("sub").textContent = world().n + " · " + world().k;
    const d = doneOf(world().id);
    const next = world().levels.findIndex((_, i) => !d.includes(i));
    go(next === -1 ? 0 : next);
  }
  function resetWorld(index) {
    modal("<h3>Opnieuw beginnen?</h3><p>Alle voortgang van " + esc(WORLDS[index].n) + " gaat verloren. Je programma's in deze wereld ook.</p>", [
      ["Nee"],
      ["Ja, opnieuw", "go", () => {
        const id = WORLDS[index].id;
        done[id] = [];
        prog[id] = {};
        Object.keys(hintsUsed).forEach(k => { if (k.indexOf(id + ":") === 0) delete hintsUsed[k]; });
        seen = seen.filter(k => k.indexOf(id + ":") !== 0);
        save();
        if (document.body.classList.contains("home")) home();
        else { wi = index; go(0); }
      }]
    ]);
  }
  function exportCSV() {
    const rows = [["wereld", "opdracht", "titel", "voltooid"]];
    WORLDS.forEach(w => {
      const d = doneOf(w.id);
      w.levels.forEach((l, i) => rows.push([w.n, String(i + 1), l.t, d.includes(i) ? "ja" : "nee"]));
    });
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "iteachers-code-voortgang.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function guide() {
    const lessons = LESKAART.length
      ? '<h3>Leskaart</h3><table class="les"><thead><tr><th>Les</th><th>Wereld</th><th>Focus</th><th>Doel</th><th>Duur</th></tr></thead><tbody>'
        + LESKAART.map(r => "<tr><td>" + esc(r.les) + "</td><td>" + esc(r.wereld) + "</td><td>" + esc(r.focus) + "</td><td>" + esc(r.doel) + "</td><td>" + esc(r.duur) + "</td></tr>").join("")
        + "</tbody></table>"
      : "";
    modal('<div class="guide"><h3>Handleiding</h3>' + GUIDE.map(g => "<h3>" + g.h + "</h3><p>" + g.p + "</p>").join("") + lessons + '<p><a href="handleiding.html">Uitgebreide handleiding openen</a></p></div>', [["Sluiten", "go"]]);
  }

  const NOVA_MINI = '<div class="tour-nova" aria-hidden="true"><svg viewBox="0 0 200 150"><defs><radialGradient id="tng" cx=".4" cy=".3"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#94a3b8"/></radialGradient><radialGradient id="tgl"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".5"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient></defs><ellipse cx="100" cy="138" rx="48" ry="7" fill="#0003"/><g class="float"><circle cx="100" cy="82" r="62" fill="url(#tgl)"/><path d="M52 62L70 76M148 62L130 76" stroke="#64748b" stroke-width="5"/><ellipse class="rot2" cx="46" cy="56" rx="32" ry="5" fill="#38bdf8" opacity=".7"/><ellipse class="rot2" cx="154" cy="56" rx="32" ry="5" fill="#38bdf8" opacity=".7"/><rect x="56" y="62" width="88" height="62" rx="30" fill="url(#tng)"/><rect x="66" y="74" width="68" height="34" rx="17" fill="#0b1220"/><circle class="eyes" cx="86" cy="91" r="7" fill="#2dd4bf"/><circle class="eyes" cx="114" cy="91" r="7" fill="#2dd4bf"/><path d="M100 62V48" stroke="#64748b" stroke-width="4"/><circle cx="100" cy="46" r="5" fill="#f59e0b"/></g></svg></div>';

  /* Korte zinnen die Nova hardop zegt — filmpje, weinig lezen. */
  const TOUR = [
    {
      t: "Hoi, ik ben Nova!",
      say: "Hoi! Ik ben Nova. Een bezorgdrone in de zwevende stad Meridiaan, in het jaar twee-duizend-vijfenzeventig. Jij programmeert mijn route.",
      art: "hello",
      chips: [["teal", "Nova"], ["", "2075"], ["amber", "Jij stuurt"]]
    },
    {
      t: "Zo speel je",
      say: "Links is het speelveld. Rechts bouw je een programma. Tik op Start, dan vlieg ik jouw stappen. Botst iets? Dan zeg ik wat er misging.",
      art: "play",
      chips: [["", "Speelveld"], ["teal", "Start"], ["amber", "Programma"]]
    },
    {
      t: "Drie manieren",
      say: "Er zijn drie niveaus. Visueel: tik iconen. Blokken: sleep blokken. Code: typ JavaScript of Python. Je mag altijd wisselen.",
      art: "modes",
      chips: [["teal", "Visueel"], ["", "Blokken"], ["amber", "Code"]]
    },
    {
      t: "Bolletjes & werelden",
      say: "Bovenaan zie je bolletjes: dat zijn de opdrachten. Maak er één af, dan gaat de volgende open. Begin bij de wereld Skyline Meridiaan.",
      art: "dots",
      chips: [["", "Bolletjes"], ["teal", "Skyline"], ["amber", "Volgende"]]
    },
    {
      t: "Hulp & sterren",
      say: "Vast? Tik op Tip. Of gebruik Stap, om één beweging te zien. Als je wint, krijg je sterren. Drie sterren is top. Eén ster is ook goed!",
      art: "help",
      chips: [["amber", "Tip"], ["", "Stap"], ["teal", "Sterren"]]
    },
    {
      t: "Aan de slag!",
      say: "Klaar? Kies Skyline Meridiaan en druk op Speel. Volg het oranje doel. Proberen mag. Fouten maken mag. Laten we gaan!",
      art: "go",
      chips: [["teal", "Speel"], ["", "Doel"], ["amber", "Proberen"]]
    }
  ];

  function stopSpeech() {
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }
  function pickVoice() {
    if (!window.speechSynthesis) return null;
    const voices = speechSynthesis.getVoices() || [];
    return voices.find(v => /nl(-|_)?(NL|BE)/i.test(v.lang))
      || voices.find(v => /^nl/i.test(v.lang))
      || voices.find(v => /dutch|nederlands/i.test(v.name))
      || null;
  }
  function speak(text, token, onEnd) {
    stopSpeech();
    if (tourMuted || !window.speechSynthesis) {
      setTimeout(() => { if (token === tourToken && onEnd) onEnd(); }, Math.min(4200, 900 + text.length * 45));
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "nl-NL";
    u.rate = 1.02;
    u.pitch = 1.08;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = () => { if (token === tourToken && onEnd) onEnd(); };
    u.onerror = () => { if (token === tourToken && onEnd) onEnd(); };
    speechSynthesis.speak(u);
  }
  function tourArt(kind) {
    const map = {
      hello: '<div class="film-stage s-hello"><span class="film-badge">Meridiaan 2075</span></div>',
      play: '<div class="film-stage s-play"><div class="film-board"><i></i><i class="on"></i><i></i><i></i><b></b></div><span class="film-badge">Start → vliegen</span></div>',
      modes: '<div class="film-stage s-modes"><span>Visueel</span><span>Blokken</span><span>Code</span></div>',
      dots: '<div class="film-stage s-dots"><i class="on">1</i><i>2</i><i>3</i><i>4</i><span class="film-badge">Opdrachten</span></div>',
      help: '<div class="film-stage s-help"><span class="star">★★★</span><span class="film-badge">Tips & sterren</span></div>',
      go: '<div class="film-stage s-go"><span class="film-cta">Speel</span><span class="film-badge">Skyline Meridiaan</span></div>'
    };
    return map[kind] || "";
  }
  function showTourGate() {
    stopSpeech();
    tourPlaying = false;
    $("mc").className = "mc tour-mc film-mc";
    $("mc").innerHTML = '<div class="film-gate">' + NOVA_MINI + '<h3>Nova’s filmpje</h3><p>Kort. Met geluid. Bijna geen tekst.</p><button type="button" class="btn go film-play" id="filmstart">▶ Afspelen</button><button type="button" class="btn" id="filmskip">Overslaan</button><p class="film-note">Zet je geluid aan. Werkt het best in Chrome of Edge.</p></div>';
    $("md").classList.add("show");
    $("filmstart").onclick = () => { tourPlaying = true; showTour(0, true); };
    $("filmskip").onclick = () => finishTour(false);
  }
  function showTour(step, auto) {
    tourStep = Math.max(0, Math.min(step, TOUR.length - 1));
    const token = ++tourToken;
    const s = TOUR[tourStep];
    const chips = (s.chips || []).map(c => {
      const label = c[1];
      const mark = label.indexOf("★") >= 0 ? "★" : label.replace(/[^0-9A-Za-z]/g, "").slice(0, 1) || "•";
      return '<span class="tour-chip"><i class="' + (c[0] || "") + '">' + mark + "</i>" + esc(label) + "</span>";
    }).join("");
    const dots = TOUR.map((_, i) => "<span class=\"" + (i === tourStep ? "on" : "") + "\"></span>").join("");
    const last = tourStep === TOUR.length - 1;
    const html = '<div class="film">'
      + '<div class="film-top"><span class="tour-kicker">Scene ' + (tourStep + 1) + " / " + TOUR.length + '</span><span class="film-live" id="filmlive">' + (tourMuted ? "Gedempt" : "Nova praat…") + "</span></div>"
      + '<div class="film-body">' + NOVA_MINI.replace('class="tour-nova"', 'class="tour-nova speaking"') + '<div class="film-main">' + tourArt(s.art) + '<h3>' + esc(s.t) + '</h3><div class="tour-visual">' + chips + "</div></div></div>"
      + '<div class="tour-progress" aria-hidden="true">' + dots + "</div></div>";
    const btns = [
      [tourMuted ? "Geluid aan" : "Dempen", "", () => { tourMuted = !tourMuted; stopSpeech(); showTour(tourStep, tourPlaying); }],
      ["Overslaan", "", () => finishTour(false)]
    ];
    if (tourStep > 0) btns.splice(1, 0, ["Vorige", "", () => showTour(tourStep - 1, false)]);
    if (last) btns.push(["Aan de slag!", "go", () => finishTour(true)]);
    else btns.push(["Volgende", "go", () => showTour(tourStep + 1, false)]);
    $("mc").className = "mc tour-mc film-mc";
    $("mc").innerHTML = html + '<div class="ctrl">' + btns.map((b, i) => '<button type="button" class="btn ' + (b[1] || "") + '" data-b="' + i + '">' + b[0] + "</button>").join("") + "</div>";
    $("md").classList.add("show");
    $("mc").querySelectorAll("[data-b]").forEach(el => el.onclick = () => {
      const fn = btns[+el.dataset.b][2];
      if (fn) fn();
    });
    speak(s.say, token, () => {
      const live = $("filmlive");
      if (live) live.textContent = last ? "Klaar" : "Volgende scene…";
      const nova = $("mc").querySelector(".tour-nova");
      if (nova) nova.classList.remove("speaking");
      if (auto && tourPlaying && token === tourToken) {
        setTimeout(() => {
          if (token !== tourToken) return;
          if (last) finishTour(true);
          else showTour(tourStep + 1, true);
        }, 550);
      }
    });
  }
  function finishTour(ok) {
    tourPlaying = false;
    tourToken++;
    stopSpeech();
    $("md").classList.remove("show");
    $("mc").className = "mc";
    tourSeen = true;
    save();
    const replay = $("tourreplay");
    if (replay) replay.hidden = false;
  }
  function openTour() {
    showTourGate();
  }

  function bind() {
    $("wbtn").onclick = home;
    $("tbtn").onclick = () => {
      teach = !teach;
      $("tbtn").classList.toggle("go", teach);
      $("tbtn").setAttribute("aria-pressed", String(teach));
      if (document.body.classList.contains("home")) home();
      else { dots(); tnote(); }
    };
    $("guidebtn").onclick = guide;
    $("exportbtn").onclick = exportCSV;
    const tourBtn = $("tourbtn");
    const tourReplay = $("tourreplay");
    if (tourBtn) tourBtn.onclick = openTour;
    if (tourReplay) tourReplay.onclick = openTour;
    $("run").onclick = run;
    $("step").onclick = stepOnce;
    $("pause").onclick = togglePause;
    $("hintbtn").onclick = showHint;
    $("reset").onclick = () => { stop(); board(); };
    $("clear").onclick = () => modal("<h3>Programma wissen?</h3><p>Alles wat je in deze opdracht hebt gebouwd, wordt verwijderd.</p>", [
      ["Nee"],
      ["Ja, wissen", "go", () => { stop(); prog[world().id][lv] = []; sel = ""; save(); editor(); board(); }]
    ]);
    $("prev").onclick = () => { if (lv > 0) go(lv - 1); };
    $("next").onclick = () => { if (lv < world().levels.length - 1 && canOpen(lv + 1)) go(lv + 1); };
    $("dots").onclick = ev => {
      const b = ev.target.closest("[data-lv]");
      if (b && !b.disabled) go(+b.dataset.lv);
    };
    $("wg").onclick = ev => {
      const p = ev.target.closest("[data-play]");
      const r = ev.target.closest("[data-reset]");
      if (p) playWorld(+p.dataset.play);
      if (r) resetWorld(+r.dataset.reset);
    };
    $("editor").addEventListener("click", onEditorClick);
    $("seghost").addEventListener("click", onEditorClick);
    $("editor").addEventListener("change", onEditorChange);
    $("editor").addEventListener("dragstart", onDragStart);
    $("editor").addEventListener("dragend", () => {
      drag = null;
      skipClick = true;
      setTimeout(() => { skipClick = false; }, 0);
    });
    $("editor").addEventListener("dragover", ev => { if (ev.target.closest("[data-socket]")) ev.preventDefault(); });
    $("editor").addEventListener("drop", onDrop);
    $("editor").addEventListener("keydown", ev => {
      if (ev.key === "Tab" && ev.target.id === "ta") {
        ev.preventDefault();
        const ta = ev.target;
        ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end");
      }
    });
    $("md").addEventListener("click", ev => {
      if (ev.target.id === "md" && !$("mc").classList.contains("tour-mc")) $("md").classList.remove("show");
    });
    document.addEventListener("keydown", ev => {
      if (ev.key === "Escape" && $("mc").classList.contains("tour-mc")) return;
      if (ev.key === "Escape") $("md").classList.remove("show");
      if ($("md").classList.contains("show") && $("mc").classList.contains("tour-mc")) {
        if (ev.key === "ArrowRight" || ev.key === "Enter") { ev.preventDefault(); if (tourStep < TOUR.length - 1) showTour(tourStep + 1); else finishTour(true); }
        if (ev.key === "ArrowLeft") { ev.preventDefault(); if (tourStep > 0) showTour(tourStep - 1); }
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); if (!document.body.classList.contains("home")) run(); }
      if (ev.target.matches("textarea, input, select")) return;
      if (document.body.classList.contains("home")) return;
      if (ev.key === "ArrowRight" && !$("next").disabled) go(lv + 1);
      if (ev.key === "ArrowLeft" && lv > 0) go(lv - 1);
    });
    window.addEventListener("resize", fit);
  }

  load();
  bind();
  home();
  if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => speechSynthesis.getVoices());
  }
  const replay = $("tourreplay");
  if (replay) replay.hidden = !tourSeen;
  if (!tourSeen) setTimeout(openTour, 450);
})();
