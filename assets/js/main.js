// État voyou — amélioration progressive. Le site reste lisible sans JavaScript.
(function () {
  "use strict";

  // 1. Compteurs de jours : recalculés à la date du lecteur.
  function daysSince(iso) {
    var p = iso.split("-").map(Number);
    var start = Date.UTC(p[0], p[1] - 1, p[2]);
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((today - start) / 86400000));
  }
  var fmt = new Intl.NumberFormat("fr-BE");
  document.querySelectorAll("[data-since]").forEach(function (el) {
    el.textContent = fmt.format(daysSince(el.getAttribute("data-since")));
  });

  // 2. Numérotation des paragraphes, comme dans un arrêt : citable et lien direct.
  document.querySelectorAll(".chapitre").forEach(function (article) {
    var slug = article.id || "chapitre";
    var prose = article.querySelector(".prose");
    if (!prose) return;
    var n = 0;
    Array.prototype.forEach.call(prose.children, function (el) {
      if (el.tagName !== "P") return;
      n += 1;
      var id = slug + "-" + n;
      el.id = id;
      var a = document.createElement("a");
      a.className = "pnum";
      a.href = "#" + id;
      a.textContent = "§ " + n;
      a.setAttribute("aria-label", "Lien vers le paragraphe " + n);
      el.insertBefore(a, el.firstChild);
    });
  });

  // 3. Chronologie : filtres par thème et recherche plein texte.
  document.querySelectorAll("[data-chrono]").forEach(function (root) {
    var chips = root.querySelectorAll("[data-filter]");
    var input = root.querySelector("input[type=search]");
    var items = root.querySelectorAll(".chrono-item");
    var years = root.querySelectorAll(".chrono-year");
    var count = root.querySelector("[data-chrono-count]");
    var empty = root.querySelector("[data-chrono-empty]");
    var current = "tout";
    var norm = function (s) {
      return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    };
    items.forEach(function (it) { it._txt = norm(it.textContent); });

    function apply() {
      var q = input ? norm(input.value.trim()) : "";
      var shown = 0;
      items.forEach(function (it) {
        var ok = (current === "tout" || it.getAttribute("data-cat") === current) &&
                 (!q || it._txt.indexOf(q) !== -1);
        it.hidden = !ok;
        if (ok) shown += 1;
      });
      years.forEach(function (y) {
        y.hidden = !y.querySelector(".chrono-item:not([hidden])");
      });
      if (count) count.textContent = shown + (shown > 1 ? " événements" : " événement");
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        current = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
  });
})();
