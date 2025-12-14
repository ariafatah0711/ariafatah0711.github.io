(function () {
  "use strict";

  function getEls() {
    return {
      hamburger: document.getElementById("hamburgerBtn"),
      menu: document.getElementById("mobileMenu"),
    };
  }

  function isOpen(hamburger, menu) {
    return hamburger.classList.contains("active") && menu.classList.contains("active");
  }

  function setOpen(open) {
    const { hamburger, menu } = getEls();
    if (!hamburger || !menu) return;

    hamburger.classList.toggle("active", open);
    menu.classList.toggle("active", open);

    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggle() {
    const { hamburger, menu } = getEls();
    if (!hamburger || !menu) return;
    setOpen(!isOpen(hamburger, menu));
  }

  function onHamburgerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  }

  function onDocumentClick(e) {
    const { hamburger, menu } = getEls();
    if (!hamburger || !menu) return;

    if (!isOpen(hamburger, menu)) return;

    // close if click is outside button and menu
    if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
      setOpen(false);
    }
  }

  function onDocumentKeydown(e) {
    if (e.key !== "Escape") return;
    setOpen(false);
  }

  function onMenuClick(e) {
    const link = e.target.closest("a");
    if (!link) return;
    setOpen(false);
  }

  function bind() {
    const { hamburger, menu } = getEls();
    if (!hamburger || !menu) return;

    // idempotent binding
    if (hamburger.dataset.bound === "true") return;
    hamburger.dataset.bound = "true";

    hamburger.addEventListener("click", onHamburgerClick);
    menu.addEventListener("click", onMenuClick);

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);

    // keep aria correct on load
    hamburger.setAttribute("aria-expanded", isOpen(hamburger, menu) ? "true" : "false");
  }

  // Compatibility: keep old global name if something still calls it
  window.toggleMobileMenu = function toggleMobileMenuCompat(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    if (event && typeof event.stopPropagation === "function") event.stopPropagation();
    toggle();
    return false;
  };

  function init() {
    bind();
  }

  document.addEventListener("DOMContentLoaded", init);

  // Future PJAX hook: re-run init after content swap
  document.addEventListener("app:page-load", init);
})();
