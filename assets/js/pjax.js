(function () {
  "use strict";

  // Debug marker: stays constant during PJAX navigations, changes on full reload.
  if (!window.__pjaxRuntimeId) {
    window.__pjaxRuntimeId = Math.random().toString(16).slice(2);
  }

  function dispatchAppPageLoad() {
    try {
      document.dispatchEvent(new Event("app:page-load"));
      console.info("[PJAX] app:page-load", window.location.pathname, "rid=" + window.__pjaxRuntimeId);
    } catch (e) {
      // IE fallback not needed; keep silent
    }
  }

  function initSwup() {
    if (window.__swupInitialized) return;
    if (typeof window.Swup !== "function") {
      if (!window.__swupInitWarned) {
        window.__swupInitWarned = true;
        console.warn(
          "[PJAX] Swup not available (window.Swup missing)",
          window.location.pathname,
          "rid=" + window.__pjaxRuntimeId
        );
      }
      return;
    }

    // Ensure there is a container to swap
    if (!document.querySelector("#swup")) {
      // If container missing, skip PJAX to avoid breaking navigation.
      if (!window.__swupInitWarned) {
        window.__swupInitWarned = true;
        console.warn("[PJAX] #swup container missing; PJAX disabled", window.location.pathname, "rid=" + window.__pjaxRuntimeId);
      }
      return;
    }

    var swup = null;
    try {
      swup = new window.Swup({
        containers: ["#swup"],
        linkSelector: "a[href]:not([href^='#']):not([target]):not([download]):not([data-no-swup])",
        // Some browsers (or Tracking Prevention modes) block storage in certain contexts,
        // which can break Swup's caching. Keep it off for reliability.
        cache: false,
        animateHistoryBrowsing: false,
      });
    } catch (e) {
      if (!window.__swupInitWarned) {
        window.__swupInitWarned = true;
        console.warn(
          "[PJAX] Swup init failed",
          e && e.name ? e.name : "Error",
          e && e.message ? e.message : e,
          window.location.pathname,
          "rid=" + window.__pjaxRuntimeId
        );
      }
      return;
    }

    window.__swupInitialized = true;
    window.__swup = swup;

    try {
      window.__pjaxEnabled = true;
      console.info("[PJAX] Swup initialized", window.location.pathname, "rid=" + window.__pjaxRuntimeId);
    } catch (e) {}

    // After content swap, run page init hooks
    swup.on("contentReplaced", function () {
      console.info("[PJAX] contentReplaced", window.location.pathname, "rid=" + window.__pjaxRuntimeId);
      dispatchAppPageLoad();
    });

    // Also trigger once on first init (useful if scripts load late)
    dispatchAppPageLoad();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initSwup();
      dispatchAppPageLoad();
    });
  } else {
    initSwup();
    dispatchAppPageLoad();
  }

  // Compatibility: if user uses other PJAX engines, still forward their events
  var forwardEvents = ["pjax:complete", "turbo:load", "swup:contentReplaced", "turbolinks:load"];
  forwardEvents.forEach(function (evt) {
    document.addEventListener(evt, dispatchAppPageLoad);
  });
})();
