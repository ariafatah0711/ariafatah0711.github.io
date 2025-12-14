// PJAX navigation for the Jekyll site using Swup (static-friendly)
(function () {
  if (typeof window === "undefined") return;

  function runPageInits() {
    // Theme icon (always call, safe re-run)
    try {
      if (typeof window.updateThemeIcon === "function") window.updateThemeIcon();
    } catch (e) {
      console.error("[PJAX] updateThemeIcon error:", e);
    }

    // Gallery filters (safe re-run, has own guard)
    try {
      if (typeof window.initGallery === "function") window.initGallery();
    } catch (e) {
      console.error("[PJAX] initGallery error:", e);
    }

    // Projects page (modal + repo stats, safe re-run, has own guard)
    try {
      if (typeof window.initProjects === "function") window.initProjects();
    } catch (e) {
      console.error("[PJAX] initProjects error:", e);
    }

    // Discord Lanyard status (safe re-run, checks for element)
    try {
      if (typeof window.initDiscordLanyard === "function") window.initDiscordLanyard();
    } catch (e) {
      console.error("[PJAX] initDiscordLanyard error:", e);
    }

    // GitHub Profile data (safe re-run, checks for wrapper)
    try {
      if (typeof window.initGithubProfile === "function") window.initGithubProfile();
    } catch (e) {
      console.error("[PJAX] initGithubProfile error:", e);
    }

    // Song player (safe re-run, checks for elements)
    try {
      if (typeof window.initSongPlayer === "function") window.initSongPlayer();
    } catch (e) {
      console.error("[PJAX] initSongPlayer error:", e);
    }

    // Image lazy-loading optimization (safe re-run)
    try {
      if (typeof window.initImageOptimization === "function") window.initImageOptimization();
    } catch (e) {
      console.error("[PJAX] initImageOptimization error:", e);
    }

    // Linktree (safe re-run, handles PJAX swap)
    try {
      if (typeof window.initLinktree === "function") window.initLinktree();
    } catch (e) {
      console.error("[PJAX] initLinktree error:", e);
    }

    // Navbar keyboard shortcuts
    try {
      if (typeof window.initNavbarKeyboard === "function") window.initNavbarKeyboard();
    } catch (e) {
      console.error("[PJAX] initNavbarKeyboard error:", e);
    }

    // Info page functions (safe re-run, PJAX-safe)
    try {
      if (typeof window.initInfoPage === "function") window.initInfoPage();
    } catch (e) {
      console.error("[PJAX] initInfoPage error:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    runPageInits();

    // Swup v2 API (stable)
    if (typeof window.Swup !== "function") return;

    var swup = new window.Swup({
      containers: ["#swup"],
      linkSelector:
        'a[href]:not([data-no-swup]):not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])',
    });

    window.__swup = swup;

    swup.on("contentReplaced", function () {
      // Some pages inject a loader; under PJAX the scripts won't run, so ensure it doesn't hang around.
      try {
        var loader = document.getElementById("page-loader");
        if (loader) loader.remove();
      } catch (e) {}

      // Update title from the newly loaded document
      try {
        var newTitle = document.querySelector("title");
        if (newTitle) document.title = newTitle.textContent;
      } catch (e) {}

      runPageInits();
    });

    swup.on("pageView", function () {
      // Ensure inits run on history navigation too
      runPageInits();
    });
  });
})();
