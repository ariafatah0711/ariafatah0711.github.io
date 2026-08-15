(function () {
  "use strict";

  // Cari #linktreeBox di shell yang aktif (display:block)
  function getActiveLinktreeBox() {
    // Cari shell aktif
    const shells = document.querySelectorAll("[data-shell]");
    for (const shell of shells) {
      const style = window.getComputedStyle(shell);
      if (style.display !== "none") {
        const box = shell.querySelector("#linktreeBox");
        if (box) return box;
      }
    }
    // Fallback: cari langsung di root
    return document.getElementById("linktreeBox");
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
    // Buka overlay di shell aktif
    const box = getActiveLinktreeBox();
    if (box) setOpen(box, true);
    location.hash = "linktree";
  }

  function handleHashChange() {
    const box = getActiveLinktreeBox();
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
    const box = getActiveLinktreeBox();
    if (!box) return;

    if (box.dataset.bound === "true") return;
    box.dataset.bound = "true";

    const inner = box.querySelector(".linktree-inner");

    // Patch: bind to ALL matching buttons, not just the first
    const openBtns = document.querySelectorAll('[data-action="open-linktree"]');
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openViaHash();
      });
    });

    const closeBtns = box.querySelectorAll('[data-action="close-linktree"]');
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        setOpen(box, false);
      });
    });

    const cvBtns = document.querySelectorAll('[data-action="download-cv"]');
    cvBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        downloadCV();
      });
    });

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
        if (!getActiveLinktreeBox()) return;
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
