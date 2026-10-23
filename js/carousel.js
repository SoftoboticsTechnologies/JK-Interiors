/* Image carousels (scroll-snap based, touch friendly) and a shared lightbox.
   Markup: [data-carousel] > .carousel__track > .carousel__slide (button > img)
           + .carousel__controls with .carousel__dots and prev/next buttons. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lightbox (one <dialog> shared by every carousel) ---------- */
  var lightbox = null;
  var lbImg, lbCaption, lbGroup = [], lbIndex = 0, lbReturn = null;

  var icon = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  function buildLightbox() {
    if (typeof HTMLDialogElement !== "function") return null;
    var d = document.createElement("dialog");
    d.className = "lightbox";
    d.setAttribute("aria-label", "Image viewer");
    d.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Close">' + icon.close + "</button>" +
      '<button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">' + icon.prev + "</button>" +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image">' + icon.next + "</button>";
    document.body.appendChild(d);
    lbImg = d.querySelector(".lightbox__img");
    lbCaption = d.querySelector(".lightbox__caption");
    d.querySelector(".lightbox__close").addEventListener("click", function () { d.close(); });
    d.querySelector(".lightbox__nav--prev").addEventListener("click", function () { showLb(lbIndex - 1); });
    d.querySelector(".lightbox__nav--next").addEventListener("click", function () { showLb(lbIndex + 1); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
    d.addEventListener("close", function () {
      document.body.classList.remove("nav-open");
      if (lbReturn) lbReturn.focus();
    });
    return d;
  }

  function showLb(i) {
    lbIndex = (i + lbGroup.length) % lbGroup.length;
    var img = lbGroup[lbIndex];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt;
    var multiple = lbGroup.length > 1;
    lightbox.querySelector(".lightbox__nav--prev").hidden = !multiple;
    lightbox.querySelector(".lightbox__nav--next").hidden = !multiple;
  }

  function openLightbox(images, index, trigger) {
    if (!lightbox) lightbox = buildLightbox();
    if (!lightbox) return;
    lbGroup = images;
    lbReturn = trigger;
    showLb(index);
    lightbox.showModal();
    document.body.classList.add("nav-open");
  }

  /* ---------- Carousel ---------- */
  function Carousel(root) {
    var track = root.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel__slide"));
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dotsWrap = root.querySelector(".carousel__dots");
    var autoplayMs = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    var label = root.getAttribute("aria-label") || "Gallery";
    var stops = [];
    var dots = [];
    var timer = null;
    var paused = false;

    // Each distinct scroll position a slide can snap to becomes one "page".
    function computeStops() {
      var max = track.scrollWidth - track.clientWidth;
      var base = slides[0].offsetLeft;
      var seen = {};
      stops = [];
      slides.forEach(function (s) {
        var pos = Math.min(Math.max(s.offsetLeft - base, 0), max);
        var key = Math.round(pos);
        if (!seen[key]) { seen[key] = true; stops.push(pos); }
      });
      buildDots();
      update();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      dots = stops.map(function (pos, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "carousel__dot";
        b.setAttribute("aria-label", label + ": go to slide " + (i + 1) + " of " + stops.length);
        b.addEventListener("click", function () { goTo(i); restart(); });
        dotsWrap.appendChild(b);
        return b;
      });
      dotsWrap.hidden = stops.length < 2;
    }

    function currentIndex() {
      var x = track.scrollLeft;
      var best = 0;
      stops.forEach(function (pos, i) {
        if (Math.abs(pos - x) < Math.abs(stops[best] - x)) best = i;
      });
      return best;
    }

    function goTo(i) {
      if (!stops.length) return;
      var idx = Math.max(0, Math.min(i, stops.length - 1));
      track.scrollTo({ left: stops[idx], behavior: reduceMotion ? "auto" : "smooth" });
    }

    function update() {
      var i = currentIndex();
      dots.forEach(function (d, n) { d.setAttribute("aria-current", n === i ? "true" : "false"); });
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= stops.length - 1;
    }

    function tick() {
      if (paused || document.hidden) return;
      var i = currentIndex();
      goTo(i >= stops.length - 1 ? 0 : i + 1);
    }
    function restart() {
      if (!autoplayMs || reduceMotion) return;
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(tick, autoplayMs);
    }

    if (prev) prev.addEventListener("click", function () { goTo(currentIndex() - 1); restart(); });
    if (next) next.addEventListener("click", function () { goTo(currentIndex() + 1); restart(); });

    var raf = null;
    track.addEventListener("scroll", function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = null; update(); });
    }, { passive: true });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentIndex() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(currentIndex() - 1); }
    });

    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () { paused = false; });
    track.addEventListener("touchstart", function () { paused = true; }, { passive: true });

    // Lightbox on click
    var images = slides.map(function (s) { return s.querySelector("img"); });
    slides.forEach(function (s, i) {
      var trigger = s.querySelector("button");
      if (trigger) trigger.addEventListener("click", function () { openLightbox(images, i, trigger); });
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(computeStops, 150);
    });
    window.addEventListener("load", computeStops);

    computeStops();
    restart();
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (el) {
    new Carousel(el);
  });
})();
