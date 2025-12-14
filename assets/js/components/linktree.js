(function () {
  "use strict";

  function qs(id) {
    return document.getElementById(id);
  }

  function showAlertCompat(message) {
    if (typeof window.showAlert === "function") {
      window.showAlert(message);
      return;
    }
    window.alert(message || "");
  }

  function setOpen(box, open) {
    if (!box) return;

    box.style.display = open ? "flex" : "none";
    document.body.classList.toggle("linktree-lock-scroll", open);

    if (!open) {
      // remove hash without navigating
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function openViaHash() {
    location.hash = "linktree";
  }

  function handleHashChange() {
    const box = qs("linktreeBox");
    if (!box) return;

    if (window.location.hash === "#linktree") {
      setOpen(box, true);
    }
  }

  async function downloadCV() {
    const cvUrl = document.querySelector("[data-cv-url]")?.getAttribute("data-cv-url");
    if (!cvUrl) {
      showAlertCompat("CV url not configured");
      return;
    }

    try {
      const response = await fetch(cvUrl, { method: "HEAD" });
      if (!response.ok) {
        showAlertCompat("CV file not found");
        return;
      }
      window.location.href = cvUrl;
    } catch {
      showAlertCompat("Could not download CV");
    }
  }

  function bind() {
    const box = qs("linktreeBox");
    if (!box) return;

    if (box.dataset.bound === "true") return;
    box.dataset.bound = "true";

    const inner = box.querySelector(".linktree-inner");
    const openBtn = document.querySelector('[data-action="open-linktree"]');
    const closeBtn = box.querySelector('[data-action="close-linktree"]');
    const cvBtn = document.querySelector('[data-action="download-cv"]');

    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openViaHash();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        setOpen(box, false);
      });
    }

    if (cvBtn) {
      cvBtn.addEventListener("click", (e) => {
        e.preventDefault();
        downloadCV();
      });
    }

    box.addEventListener("click", (e) => {
      if (inner && !inner.contains(e.target)) {
        setOpen(box, false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && box.style.display === "flex") {
        setOpen(box, false);
      }

      // Shortcut: press L to open linktree if it exists
      if (!event.ctrlKey && String(event.key || "").toLowerCase() === "l") {
        if (!qs("linktreeBox")) return;
        event.preventDefault();
        openViaHash();
      }
    });

    window.addEventListener("hashchange", handleHashChange);

    // open on initial load if hash already present
    handleHashChange();
  }

  document.addEventListener("DOMContentLoaded", bind);
  document.addEventListener("app:page-load", bind);

  // Compatibility for older inline onclick callers (if any remain)
  window.openLinktree = openViaHash;
})();
