/* General page behaviour: hero slideshow, scroll reveal, counters,
   social links from config, and the projects section highlighter. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var config = window.JK_CONFIG || {};

  /* ---------- Hero background slideshow (home) ----------
     Mirrors the original: loop, fade, 5000ms per slide, 500ms transition. */
  var hero = document.querySelector("[data-hero-slideshow]");
  if (hero) {
    var slides = hero.querySelectorAll(".hero__slide");
    var dots = hero.querySelectorAll(".hero__dot");
    var current = 0;
    var timer = null;
    var duration = parseInt(hero.getAttribute("data-duration"), 10) || 5000;

    var show = function (i) {
      slides[current].classList.remove("is-active");
      if (dots[current]) dots[current].setAttribute("aria-current", "false");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      if (dots[current]) dots[current].setAttribute("aria-current", "true");
    };
    var start = function () {
      if (reduceMotion || slides.length < 2) return;
      stop();
      timer = window.setInterval(function () { show(current + 1); }, duration);
    };
    var stop = function () { if (timer) window.clearInterval(timer); timer = null; };

    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.addEventListener("click", function () { show(i); start(); });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(revealEls, function (el) { revealObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters (About) ----------
     The final number is already in the HTML; we count up to it when visible. */
  var counters = document.querySelectorAll("[data-count-to]");
  var runCounter = function (el) {
    var to = parseInt(el.getAttribute("data-count-to"), 10);
    var from = parseInt(el.getAttribute("data-count-from"), 10) || 0;
    var ms = parseInt(el.getAttribute("data-duration"), 10) || 2000;
    var suffix = el.getAttribute("data-suffix") || "";
    var t0 = null;
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / ms, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { counterObserver.observe(el); });
  }

  /* ---------- Social links ----------
     Placeholders become real links only when a URL is configured. */
  var social = config.social || {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-social]"), function (el) {
    var url = social[el.getAttribute("data-social")];
    if (!url) return;
    var a = document.createElement("a");
    a.className = el.className;
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (el.hasAttribute("aria-label")) a.setAttribute("aria-label", el.getAttribute("aria-label"));
    a.innerHTML = el.innerHTML;
    el.parentNode.replaceChild(a, el);
  });

  /* ---------- Projects page: highlight the current category ---------- */
  var navLinks = document.querySelectorAll(".project-nav__list a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(navLinks, function (a) {
          a.classList.remove("is-active");
          a.removeAttribute("aria-current");
        });
        var link = byId[entry.target.id];
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
          var list = link.parentNode.parentNode;
          if (list.scrollWidth > list.clientWidth) {
            list.scrollTo({
              left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
              behavior: reduceMotion ? "auto" : "smooth"
            });
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
})();
