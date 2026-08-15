(function () {
  "use strict";

  function getThreadEl() {
    return document.getElementById("disqus_thread");
  }

  function getShortname(threadEl) {
    if (!threadEl) return null;
    var sn = threadEl.getAttribute("data-disqus-shortname");
    return sn && sn.trim ? sn.trim() : sn;
  }

  function getPageUrl() {
    // Prefer a stable canonical URL for Disqus.
    // If you rely on query params, keep location.href.
    return window.location.origin + window.location.pathname;
  }

  function getPageIdentifier() {
    // Stable per-path identifier.
    return window.location.pathname;
  }

  function ensureEmbedScript(shortname) {
    if (window.__disqusEmbedLoading || window.__disqusEmbedLoaded) return;

    window.__disqusEmbedLoading = true;
    window.disqus_config = function () {
      this.page.url = getPageUrl();
      this.page.identifier = getPageIdentifier();
    };

    var d = document;
    var s = d.createElement("script");
    s.src = "https://" + shortname + ".disqus.com/embed.js";
    s.async = true;
    s.setAttribute("data-timestamp", String(+new Date()));
    s.onload = function () {
      window.__disqusEmbedLoaded = true;
      window.__disqusEmbedLoading = false;
    };
    s.onerror = function () {
      window.__disqusEmbedLoading = false;
      console.warn("[Disqus] Failed to load embed.js");
    };

    (d.head || d.body).appendChild(s);
  }

  function resetDisqus() {
    var threadEl = getThreadEl();
    if (!threadEl) return;

    var shortname = getShortname(threadEl);
    if (!shortname) {
      console.warn("[Disqus] Missing data-disqus-shortname on #disqus_thread");
      return;
    }

    // If DISQUS exists, use reset. Otherwise, load embed.
    if (window.DISQUS && typeof window.DISQUS.reset === "function") {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.url = getPageUrl();
            this.page.identifier = getPageIdentifier();
          },
        });
      } catch (e) {
        console.warn("[Disqus] DISQUS.reset failed", e);
      }
      return;
    }

    ensureEmbedScript(shortname);
  }

  // Bind once.
  if (!window.__disqusManagerBound) {
    window.__disqusManagerBound = true;

    document.addEventListener("DOMContentLoaded", resetDisqus);
    document.addEventListener("app:page-load", resetDisqus);

    // Compatibility hooks (if other engines exist).
    document.addEventListener("pjax:complete", resetDisqus);
    document.addEventListener("turbo:load", resetDisqus);
    document.addEventListener("swup:contentReplaced", resetDisqus);
  }
})();
