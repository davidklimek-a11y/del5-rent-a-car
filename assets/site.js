/* Del5 — inquiry composer (opens WhatsApp with a ready message), header state, mobile action bar. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var L = doc.getAttribute("data-i18n") ? JSON.parse(doc.getAttribute("data-i18n")) : null;
  var WA = doc.getAttribute("data-wa");
  var lang = doc.lang.slice(0, 2);

  // Header shadow once the page scrolls
  var top = document.querySelector(".top");
  var onScroll = function () { if (top) top.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Mobile action bar hides while the hero buttons or the closing section are on screen
  var bar = document.querySelector(".bar");
  if (bar && "IntersectionObserver" in window) {
    var seen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      bar.classList.toggle("away", seen.size > 0);
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-hide-bar]").forEach(function (el) { io.observe(el); });
  }

  // Inquiry form
  var form = document.getElementById("inquiry-form");
  if (!form || !L || !WA) return;
  var from = form.querySelector("[name=from]"), to = form.querySelector("[name=to]");
  var car = form.querySelector("[name=car]"), place = form.querySelector("[name=place]");
  var out = form.querySelector("output"), err = form.querySelector(".err");
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parse = function (v) { if (!v) return null; var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var human = function (d) { return lang === "sr" ? d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear() + "." : d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear(); };
  var daysWord = function (n) { return n % 10 === 1 && n % 100 !== 11 ? L.one : L.many; };
  if (lang === "en") daysWord = function (n) { return n === 1 ? L.one : L.many; };

  var today = new Date(); today.setHours(0, 0, 0, 0);
  from.min = iso(today); to.min = iso(today);

  var days = function () {
    var a = parse(from.value), b = parse(to.value);
    if (!a || !b) return 0;
    return Math.round((b - a) / 864e5);
  };
  var sync = function () {
    var a = parse(from.value);
    if (a) { var m = new Date(a); m.setDate(m.getDate() + 1); to.min = iso(m); }
    var n = days();
    out.textContent = n > 0 ? n + " " + daysWord(n) : "";
    err.textContent = ""; from.parentNode.classList.remove("bad"); to.parentNode.classList.remove("bad");
  };
  from.addEventListener("change", sync); to.addEventListener("change", sync);

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var a = parse(from.value), b = parse(to.value), n = days();
    if (!a) { err.textContent = L.errFrom; from.parentNode.classList.add("bad"); from.focus(); return; }
    if (b && n <= 0) { err.textContent = L.errTo; to.parentNode.classList.add("bad"); to.focus(); return; }
    var msg = L.msg
      .replace("{car}", car.options[car.selectedIndex].text)
      .replace("{from}", human(a))
      .replace("{to}", b ? human(b) : "—")
      .replace(" ({days})", n > 0 ? " (" + n + " " + daysWord(n) + ")" : "")
      .replace("{place}", place.options[place.selectedIndex].text);
    var link = document.createElement("a");
    link.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    link.target = "_blank"; link.rel = "noopener";
    document.body.appendChild(link); link.click(); link.remove();
  });
})();
