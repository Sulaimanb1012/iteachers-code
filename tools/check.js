const engine = require("../js/engine.js");
require("../js/extra-levels.js");
const { WORLDS } = require("../js/catalog.js");

let failed = 0;
function show(grid, x, y) {
  return grid.map((r, j) => r.map((c, i) => (i === x && j === y ? "@" : c)).join("")).join("\n");
}
function same(a, b) {
  return JSON.stringify(engine.strip(a)) === JSON.stringify(engine.strip(b));
}

WORLDS.forEach(world => {
  world.levels.forEach((level, i) => {
    const name = world.n + " / " + (i + 1) + " " + level.t;
    const width = level.g[0].length;
    if (!level.g.every(r => r.length === width)) {
      failed++;
      console.log("WIDTH " + name);
      level.g.forEach(r => console.log(r.length, r));
      return;
    }
    const starts = level.g.join("").split("S").length - 1;
    const exits = level.g.join("").split("E").length - 1;
    if (starts !== 1 || exits !== 1) {
      failed++;
      console.log("S/E " + name, starts, exits);
      return;
    }
    let ast;
    try { ast = engine.parseDsl(level.sol); }
    catch (e) { failed++; console.log("DSL " + name, e.message); return; }
    const before = level.g.join("|");
    const res = engine.run(world, level, ast);
    if (level.g.join("|") !== before) {
      failed++;
      console.log("MUTATED " + name);
    }
    if (!res.ok) {
      failed++;
      console.log("FAIL " + name + " — " + res.m + " (" + res.steps + " stappen)");
      console.log(show(res.grid, res.x, res.y));
      console.log("---");
      return;
    }
    const js = engine.toJs(ast);
    const py = engine.toPy(ast);
    const backJs = engine.parseJs(js);
    const backPy = engine.parsePy(py);
    if (backJs.err || !same(ast, backJs.ast)) {
      failed++;
      console.log("JS ROUNDTRIP " + name, backJs.err || "");
      console.log(js);
      return;
    }
    if (backPy.err || !same(ast, backPy.ast)) {
      failed++;
      console.log("PY ROUNDTRIP " + name, backPy.err || "");
      console.log(py);
      return;
    }
    const again = engine.run(world, level, backPy.ast);
    if (!again.ok || again.steps !== res.steps) {
      failed++;
      console.log("RE-RUN " + name, again.m, again.steps, res.steps);
      return;
    }
    console.log("ok  " + name + "  " + res.steps + " stappen");
  });
});

const badJs = engine.parseJs("vooruit(\n");
const badPy = engine.parsePy("vooruit(\n  vooruit()\n");
if (!badJs.err || !badPy.err) {
  failed++;
  console.log("expected parse errors", badJs, badPy);
}

console.log(failed ? "\n" + failed + " mislukt" : "\nalle opdrachten kloppen");
process.exit(failed ? 1 : 0);
