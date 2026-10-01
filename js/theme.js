/* Licht / donker. Keuze staat in localStorage en geldt voor spel en handleiding. */
(function () {
  const KEY = "itc-theme";
  function current() {
    const set = document.documentElement.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paint() {
    const btn = document.getElementById("themebtn");
    if (!btn) return;
    const dark = current() === "dark";
    btn.textContent = dark ? "Licht" : "Donker";
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute("aria-label", dark ? "Schakel naar lichte modus" : "Schakel naar donkere modus");
  }
  const btn = document.getElementById("themebtn");
  if (btn) btn.addEventListener("click", function () {
    const next = current() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* sessie blijft wel wisselen */ }
    paint();
  });
  paint();
})();
