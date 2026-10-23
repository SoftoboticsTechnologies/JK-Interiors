/* Header behaviour: solid-on-scroll and the mobile menu drawer. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("mobile-nav");
  var desktopQuery = window.matchMedia("(min-width: 1024px)");

  /* ---- Solid header once the page scrolls ---- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (!toggle || !drawer) return;

  var focusables = function () {
    return Array.prototype.slice.call(
      drawer.querySelectorAll("a[href], button:not([disabled])")
    );
  };

  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    drawer.classList.add("is-open");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-open");
    header.classList.add("is-solid");
    var first = focusables()[0];
    if (first) window.setTimeout(function () { first.focus(); }, 60);
  }

  function closeMenu(returnFocus) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    drawer.classList.remove("is-open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-open");
    header.classList.toggle("is-solid", window.scrollY > 24);
    if (returnFocus) toggle.focus();
  }

  var isOpen = function () { return toggle.getAttribute("aria-expanded") === "true"; };

  toggle.addEventListener("click", function () {
    if (isOpen()) closeMenu(false); else openMenu();
  });

  // Close after choosing a link (also handles same-page anchors).
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      closeMenu(true);
      return;
    }
    // Keep keyboard focus inside the open drawer (toggle button included).
    if (e.key === "Tab") {
      var items = [toggle].concat(focusables());
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Reset when resizing up to the desktop layout.
  var onBreakpoint = function (mq) { if (mq.matches && isOpen()) closeMenu(false); };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", onBreakpoint);
  else if (desktopQuery.addListener) desktopQuery.addListener(onBreakpoint);
})();
